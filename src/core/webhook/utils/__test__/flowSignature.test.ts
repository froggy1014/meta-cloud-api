import { createHmac } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { importConfig } from '../../../../config/importConfig';
import { decryptFlowRequestAsync, encryptFlowResponseAsync } from '../../../../utils/flowEncryptionUtils';
import type WhatsApp from '../../../whatsapp/WhatsApp';
import { processFlowRequest } from '../webhookUtils';

vi.mock('../../../../utils/flowEncryptionUtils', () => ({
    decryptFlowRequestAsync: vi.fn(async () => ({
        decryptedBody: { action: 'ping', version: '3.0' },
        aesKeyBuffer: Buffer.alloc(16),
        initialVectorBuffer: Buffer.alloc(16),
    })),
    encryptFlowResponseAsync: vi.fn(async () => 'encrypted-ping'),
}));
const raw = '{ "encrypted_flow_data": "opaque" }';
function request(key: string) {
    return new Request('https://example.com/flow', {
        method: 'POST',
        body: raw,
        headers: { 'x-hub-signature-256': `sha256=${createHmac('sha256', key).update(raw).digest('hex')}` },
    });
}
const client = {} as WhatsApp;
beforeEach(() => vi.clearAllMocks());
describe('Flow signatures use the App Secret', () => {
    it('accepts the App Secret and encrypts the ping response', async () => {
        const config = importConfig({
            accessToken: 'test-token',
            phoneNumberId: 123,
            appSecret: 'app-secret',
            webhookVerificationToken: 'verify-token',
        });
        const result = await processFlowRequest(request('app-secret'), config, client, new Map());
        expect(result.status).toBe(200);
        expect(await result.text()).toBe('encrypted-ping');
        expect(decryptFlowRequestAsync).toHaveBeenCalledOnce();
        expect(encryptFlowResponseAsync).toHaveBeenCalledOnce();
    });
    it('rejects the verify token when App Secret is configured before decrypting', async () => {
        const config = importConfig({
            accessToken: 'test-token',
            phoneNumberId: 123,
            appSecret: 'app-secret',
            webhookVerificationToken: 'verify-token',
        });
        expect((await processFlowRequest(request('verify-token'), config, client, new Map())).status).toBe(401);
        expect(decryptFlowRequestAsync).not.toHaveBeenCalled();
    });
    it('keeps the documented legacy fallback when App Secret is absent', async () => {
        const config = importConfig({
            accessToken: 'test-token',
            phoneNumberId: 123,
            webhookVerificationToken: 'verify-token',
        });
        config.M4D_APP_SECRET = '';
        expect((await processFlowRequest(request('verify-token'), config, client, new Map())).status).toBe(200);
    });
});
