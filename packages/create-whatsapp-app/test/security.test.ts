import { createHmac } from 'node:crypto';
import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { authorizeDashboard } from '../templates/basic/lib/dashboard-auth';
import { proxy } from '../templates/basic/proxy';

const { post, mode } = vi.hoisted(() => ({
    post: vi.fn((_request: Request) => new Response('ok')),
    mode: { isMock: false },
}));
vi.mock('@/lib/webhook', () => ({ webhook: { GET: vi.fn(), POST: post } }));
vi.mock('@/lib/whatsapp', () => mode);

import { POST } from '../templates/basic/app/api/webhook/route';

afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    mode.isMock = false;
});
const request = (authorization?: string) =>
    new Request('https://example.com/api/send', { headers: authorization ? { authorization } : {} });
const basic = (password: string) => `Basic ${Buffer.from(`admin:${password}`).toString('base64')}`;
function live() {
    vi.stubEnv('CLOUD_API_ACCESS_TOKEN', 'test-token');
    vi.stubEnv('WA_PHONE_NUMBER_ID', '123');
}

describe('live dashboard authentication', () => {
    it('allows the no-credentials mock dashboard', () => {
        vi.stubEnv('CLOUD_API_ACCESS_TOKEN', '');
        expect(authorizeDashboard(request())).toBeNull();
    });
    it('fails closed without a password in live mode', () => {
        live();
        vi.stubEnv('DASHBOARD_PASSWORD', '');
        expect(authorizeDashboard(request())?.status).toBe(503);
    });
    it('challenges missing and wrong credentials', () => {
        live();
        vi.stubEnv('DASHBOARD_PASSWORD', 'secret');
        expect(authorizeDashboard(request())?.status).toBe(401);
        expect(authorizeDashboard(request(basic('wrong')))?.status).toBe(401);
    });
    it('rejects cross-origin writes even with valid browser credentials', () => {
        live();
        vi.stubEnv('DASHBOARD_PASSWORD', 'secret');
        const req = new Request('https://example.com/api/send', {
            method: 'POST',
            headers: { authorization: basic('secret'), origin: 'https://attacker.example' },
        });
        expect(authorizeDashboard(req)?.status).toBe(403);
    });
    it('accepts only the configured admin password', () => {
        live();
        vi.stubEnv('DASHBOARD_PASSWORD', 'secret');
        expect(authorizeDashboard(request(basic('secret')))).toBeNull();
    });
});

describe('live webhook signature', () => {
    const raw = '{ "entry": [] }';
    const req = (signature?: string) =>
        new Request('https://example.com/api/webhook', {
            method: 'POST',
            body: raw,
            headers: signature ? { 'x-hub-signature-256': signature } : {},
        });
    it('fails closed without App Secret', async () => {
        vi.stubEnv('APP_SECRET', '');
        expect((await POST(req())).status).toBe(503);
        expect(post).not.toHaveBeenCalled();
    });
    it('rejects missing and forged signatures before the bot runs', async () => {
        vi.stubEnv('APP_SECRET', 'secret');
        expect((await POST(req())).status).toBe(401);
        expect((await POST(req('sha256=forged'))).status).toBe(401);
        expect(post).not.toHaveBeenCalled();
    });
    it('passes exact signed bytes to the bot', async () => {
        vi.stubEnv('APP_SECRET', 'secret');
        const signature = `sha256=${createHmac('sha256', 'secret').update(raw).digest('hex')}`;
        expect((await POST(req(signature))).status).toBe(200);
        expect(await post.mock.calls[0][0].text()).toBe(raw);
    });
    it('keeps unsigned mock webhooks usable', async () => {
        mode.isMock = true;
        vi.stubEnv('APP_SECRET', '');
        expect((await POST(req())).status).toBe(200);
    });
});

describe('dashboard route boundary', () => {
    it.each(['/', '/api/send', '/api/events', '/api/simulate'])('protects %s in live mode', (path) => {
        live();
        vi.stubEnv('DASHBOARD_PASSWORD', 'secret');
        expect(proxy(new NextRequest(`https://example.com${path}`)).status).toBe(401);
    });
    it('lets Meta reach the independently verified webhook', () => {
        live();
        vi.stubEnv('DASHBOARD_PASSWORD', 'secret');
        expect(proxy(new NextRequest('https://example.com/api/webhook')).headers.get('x-middleware-next')).toBe('1');
    });
});
