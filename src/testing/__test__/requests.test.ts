import { FlowTypeEnum, generateEncryption, WebhookProcessor } from 'meta-cloud-api';
import { describe, expect, it } from 'vitest';
import {
    createFlowRequest,
    createSignedWebhookRequest,
    createTextMessageWebhook,
    decryptFlowResponse,
    generateFlowKeyPair,
    TEST_WEBHOOK_URL,
} from '../index';

const APP_SECRET = 'test-app-secret';

describe('createSignedWebhookRequest', () => {
    const payload = createTextMessageWebhook({ from: '15551234567', text: 'signed' });

    function processor() {
        const instance = new WebhookProcessor({
            accessToken: 'test-token',
            phoneNumberId: 1,
            appSecret: APP_SECRET,
            verifyWebhookSignature: true,
        });
        const seen: string[] = [];
        instance.onText((_wa, processed) => {
            seen.push(processed.message.text.body);
        });
        return { instance, seen };
    }

    it('builds a POST the processor accepts with signature verification on', async () => {
        const { instance, seen } = processor();
        const request = await createSignedWebhookRequest(payload, { appSecret: APP_SECRET });

        expect(request.method).toBe('POST');
        expect(request.url).toBe(TEST_WEBHOOK_URL);
        expect(request.headers.get('x-hub-signature-256')).toMatch(/^sha256=[0-9a-f]{64}$/);
        expect((await instance.processWebhook(request)).status).toBe(200);
        expect(seen).toEqual(['signed']);
    });

    it('is rejected when signed with another secret', async () => {
        const { instance, seen } = processor();
        const request = await createSignedWebhookRequest(payload, { appSecret: 'wrong-secret' });

        expect((await instance.processWebhook(request)).status).toBe(401);
        expect(seen).toEqual([]);
    });

    it('signs a raw string body unchanged and honours url and header overrides', async () => {
        const request = await createSignedWebhookRequest('{"object":"x"}', {
            appSecret: APP_SECRET,
            url: 'https://example.com/hook',
            headers: { 'x-extra': '1' },
        });
        expect(request.url).toBe('https://example.com/hook');
        expect(request.headers.get('x-extra')).toBe('1');
        expect(await request.text()).toBe('{"object":"x"}');
    });
});

describe('Flow requests', () => {
    it('round-trips a data_exchange request through processor.processFlow', async () => {
        const keys = await generateFlowKeyPair();
        const processor = new WebhookProcessor({
            accessToken: 'test-token',
            phoneNumberId: 1,
            appSecret: APP_SECRET,
            privatePem: keys.privatePem,
        });
        const seen: unknown[] = [];
        processor.onFlow(FlowTypeEnum.Change, (_wa, request) => {
            seen.push(request);
            return { screen: 'SUCCESS', data: { echoed: request.data?.name } };
        });

        const flow = await createFlowRequest(
            { screen: 'START', data: { name: 'Zoë' } },
            { publicKey: keys.publicPem, appSecret: APP_SECRET },
        );
        const response = await processor.processFlow(flow.request);

        expect(response.status).toBe(200);
        expect(seen).toEqual([
            {
                version: '3.0',
                action: 'data_exchange',
                screen: 'START',
                data: { name: 'Zoë' },
                flow_token: 'test-flow-token',
            },
        ]);
        expect(await flow.decryptResponse(response)).toEqual({ screen: 'SUCCESS', data: { echoed: 'Zoë' } });
        expect(await decryptFlowResponse(response.body, flow)).toEqual({ screen: 'SUCCESS', data: { echoed: 'Zoë' } });
    });

    it('answers a ping with the default health check', async () => {
        const keys = await generateFlowKeyPair();
        const processor = new WebhookProcessor({
            accessToken: 'test-token',
            phoneNumberId: 1,
            appSecret: APP_SECRET,
            privatePem: keys.privatePem,
        });
        const flow = await createFlowRequest({ action: 'ping' }, { publicKey: keys.publicKey, appSecret: APP_SECRET });

        expect(flow.payload).toEqual({ version: '3.0', action: 'ping' });
        const response = await processor.processFlow(flow.request);
        expect(await flow.decryptResponse(response)).toEqual({ version: '3.0', data: { status: 'active' } });
    });

    it('works with a passphrase-protected key from generateEncryption()', async () => {
        const keys = generateEncryption('test-passphrase');
        const processor = new WebhookProcessor({
            accessToken: 'test-token',
            phoneNumberId: 1,
            appSecret: APP_SECRET,
            privatePem: keys.privateKey,
            passphrase: keys.passphrase,
        });
        processor.onFlow(FlowTypeEnum.Change, () => ({ screen: 'NEXT', data: {} }));

        const flow = await createFlowRequest(
            { screen: 'START', data: {} },
            { publicKey: keys.publicKey, appSecret: APP_SECRET },
        );
        expect(await flow.decryptResponse(await processor.processFlow(flow.request))).toEqual({
            screen: 'NEXT',
            data: {},
        });
    });

    it('is rejected without a signature', async () => {
        const keys = await generateFlowKeyPair();
        const processor = new WebhookProcessor({
            accessToken: 'test-token',
            phoneNumberId: 1,
            appSecret: APP_SECRET,
            privatePem: keys.privatePem,
        });
        const flow = await createFlowRequest({ screen: 'START', data: {} }, { publicKey: keys.publicPem });
        expect(flow.request.headers.get('x-hub-signature-256')).toBeNull();
        expect((await processor.processFlow(flow.request)).status).toBe(401);
    });

    it('explains an unsupported public key format', async () => {
        await expect(
            createFlowRequest({}, { publicKey: '-----BEGIN RSA PUBLIC KEY-----\nAAAA\n-----END RSA PUBLIC KEY-----' }),
        ).rejects.toThrow(/SPKI PEM/);
    });

    it('parses plain JSON replies as is', async () => {
        const keys = { aesKey: new Uint8Array(16), initialVector: new Uint8Array(16) };
        expect(await decryptFlowResponse('{"data":{"acknowledged":true}}', keys)).toEqual({
            data: { acknowledged: true },
        });
    });
});
