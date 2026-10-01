import { createHmac } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateXHub256Sig, generateXHub256SigAsync } from '../generateXHub256Sig';
import { isValidWebhookSignature, verifyWebhookSignature } from '../webhookUtils';

const secret = 'app-secret';
const body = '{"object":"whatsapp_business_account","entry":[{"id":"1","changes":[]}]}';
const signature = createHmac('sha256', secret).update(body).digest('hex');

afterEach(() => vi.unstubAllGlobals());

describe('verifyWebhookSignature (Web Crypto)', () => {
    it.each([
        ['prefixed signature', `sha256=${signature}`, true],
        ['bare hex signature', signature, true],
        ['upper-case hex', `sha256=${signature.toUpperCase()}`, true],
        ['wrong signature', `sha256=${'0'.repeat(64)}`, false],
        ['truncated signature', `sha256=${signature.slice(0, 10)}`, false],
        ['garbage', 'not-a-signature', false],
        ['empty header', '', false],
    ])('%s', async (_name, header, expected) => {
        expect(await verifyWebhookSignature(body, header, secret)).toBe(expected);
        expect(isValidWebhookSignature(body, header, secret)).toBe(expected);
    });

    it('rejects a missing header or secret', async () => {
        expect(await verifyWebhookSignature(body, null, secret)).toBe(false);
        expect(await verifyWebhookSignature(body, `sha256=${signature}`, '')).toBe(false);
    });

    it('rejects a body changed after signing', async () => {
        expect(await verifyWebhookSignature(`${body} `, `sha256=${signature}`, secret)).toBe(false);
    });

    it('works without node:crypto (edge runtimes)', async () => {
        vi.stubGlobal('process', undefined);
        expect(await verifyWebhookSignature(body, `sha256=${signature}`, secret)).toBe(true);
        expect(() => isValidWebhookSignature(body, `sha256=${signature}`, secret)).toThrow(/node:crypto/);
    });
});

describe('generateXHub256Sig', () => {
    it('sync and async variants match node:crypto', async () => {
        expect(generateXHub256Sig(body, secret)).toBe(signature);
        expect(await generateXHub256SigAsync(body, secret)).toBe(signature);
    });
});
