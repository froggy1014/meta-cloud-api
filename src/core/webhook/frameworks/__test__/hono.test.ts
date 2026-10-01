import { Hono } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { type HonoWebhookConfig, type HonoWebhookHandlers, honoWebhookHandler } from '../hono';
import {
    baseConfig,
    compactBody,
    createEncryptedFlowPing,
    prettyBody,
    signatureHeader,
    VERIFY_TOKEN,
    verifyQuery,
} from './adapter-fixtures';

const handlers: HonoWebhookHandlers[] = [];

function setup(config: Partial<HonoWebhookConfig> = {}) {
    const wa = honoWebhookHandler({ ...baseConfig, ...config });
    handlers.push(wa);
    const received: string[] = [];
    wa.processor.onText((_whatsapp, processed) => {
        received.push(processed.message.text.body);
    });

    const app = new Hono();
    app.get('/webhook', wa.GET);
    app.post('/webhook', wa.POST);
    app.all('/auto', wa.webhook);
    app.post('/flow', wa.flow);
    return { wa, app, received };
}

const post = (body: string, headers: Record<string, string> = {}) => ({
    method: 'POST',
    body,
    headers: { 'content-type': 'application/json', ...headers },
});

afterEach(() => {
    for (const wa of handlers.splice(0)) wa.destroy();
});

describe('honoWebhookHandler with a real Hono app', () => {
    describe('GET verification', () => {
        it('returns the challenge for a valid token', async () => {
            const { app } = setup();
            const res = await app.request(`/webhook?${verifyQuery(VERIFY_TOKEN)}`);
            expect(res.status).toBe(200);
            expect(await res.text()).toBe('challenge-123');
        });

        it('returns 403 for a wrong token', async () => {
            const { app } = setup();
            const res = await app.request(`/webhook?${verifyQuery('wrong')}`);
            expect(res.status).toBe(403);
        });
    });

    describe('POST webhook', () => {
        it('dispatches a text message to onText', async () => {
            const { app, received } = setup();
            const res = await app.request('/webhook', post(compactBody));
            expect(res.status).toBe(200);
            expect(received).toEqual(['hi']);
        });

        it('still dispatches when middleware already read the body', async () => {
            const { wa, received } = setup();
            const app = new Hono();
            app.use(async (c, next) => {
                await c.req.json();
                await next();
            });
            app.post('/webhook', wa.POST);
            const res = await app.request('/webhook', post(compactBody));
            expect(res.status).toBe(200);
            expect(received).toEqual(['hi']);
        });
    });

    describe('signature verification', () => {
        it('accepts a valid signature and runs the handler', async () => {
            const { app, received } = setup({ verifyWebhookSignature: true });
            const res = await app.request(
                '/webhook',
                post(prettyBody, { 'x-hub-signature-256': await signatureHeader(prettyBody) }),
            );
            expect(res.status).toBe(200);
            expect(received).toEqual(['hi']);
        });

        it('rejects an invalid signature with 401', async () => {
            const { app, received } = setup({ verifyWebhookSignature: true });
            const res = await app.request(
                '/webhook',
                post(prettyBody, { 'x-hub-signature-256': await signatureHeader(prettyBody, 'wrong-secret') }),
            );
            expect(res.status).toBe(401);
            expect(received).toEqual([]);
        });

        it('rejects a missing signature with 401', async () => {
            const { app, received } = setup({ verifyWebhookSignature: true });
            const res = await app.request('/webhook', post(prettyBody));
            expect(res.status).toBe(401);
            expect(received).toEqual([]);
        });
    });

    describe('auto-routing webhook', () => {
        it('routes GET and POST and rejects other methods with 405', async () => {
            const { app, received } = setup();
            expect((await app.request(`/auto?${verifyQuery(VERIFY_TOKEN)}`)).status).toBe(200);
            expect((await app.request('/auto', post(compactBody))).status).toBe(200);
            expect(received).toEqual(['hi']);
            expect((await app.request('/auto', { method: 'PUT' })).status).toBe(405);
        });
    });

    describe('flow route', () => {
        it('decrypts a signed Flow ping and encrypts the response', async () => {
            const flow = await createEncryptedFlowPing();
            const { app } = setup({ privatePem: flow.privatePem });
            const res = await app.request(
                '/flow',
                post(flow.body, { 'x-hub-signature-256': await signatureHeader(flow.body) }),
            );
            expect(res.status).toBe(200);
            expect(await flow.decryptResponse(await res.text())).toEqual({
                data: { status: 'active' },
                version: '3.0',
            });
        });

        it('rejects an unsigned Flow request with 401', async () => {
            const flow = await createEncryptedFlowPing();
            const { app } = setup({ privatePem: flow.privatePem });
            const res = await app.request('/flow', post(flow.body));
            expect(res.status).toBe(401);
        });
    });

    describe('errors', () => {
        it('returns 500 when the processor throws', async () => {
            const { wa, app } = setup();
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
            vi.spyOn(wa.processor, 'processWebhook').mockRejectedValueOnce(new Error('boom'));
            const res = await app.request('/webhook', post(compactBody));
            expect(res.status).toBe(500);
            spy.mockRestore();
        });
    });

    describe('singleton cache', () => {
        it('returns the same instance for the same phoneNumberId', () => {
            const { wa } = setup();
            expect(honoWebhookHandler(baseConfig)).toBe(wa);
        });

        it('returns a different instance for a different phoneNumberId', () => {
            const { wa } = setup();
            const other = honoWebhookHandler({ ...baseConfig, phoneNumberId: 999 });
            handlers.push(other);
            expect(other).not.toBe(wa);
        });

        it('destroy() removes handlers and evicts the cache entry', async () => {
            const { wa, app, received } = setup();
            const removeAllHandlers = vi.spyOn(wa.processor, 'removeAllHandlers');
            wa.destroy();
            expect(removeAllHandlers).toHaveBeenCalled();
            await app.request('/webhook', post(compactBody));
            expect(received).toEqual([]);
            const fresh = honoWebhookHandler(baseConfig);
            handlers.push(fresh);
            expect(fresh).not.toBe(wa);
        });
    });
});
