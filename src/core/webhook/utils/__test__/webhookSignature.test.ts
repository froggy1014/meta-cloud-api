import { createHmac } from 'node:crypto';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import { MessageTypesEnum } from '../../../../types/enums';
import type WhatsApp from '../../../whatsapp/WhatsApp';
import { nextjsAppWebhookHandler } from '../../frameworks/nextjs-app/nextjs-app';
import { isValidWebhookSignature, processWebhookMessages } from '../webhookUtils';

const APP_SECRET = 'test-app-secret';
const whatsapp = {} as WhatsApp;

const rawBody = JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [
        {
            id: 'waba-id',
            changes: [
                {
                    field: 'messages',
                    value: {
                        messaging_product: 'whatsapp',
                        metadata: { display_phone_number: '15550000000', phone_number_id: '123' },
                        contacts: [{ profile: { name: 'Ann' }, wa_id: '15551112222' }],
                        messages: [
                            { from: '15551112222', id: 'wamid.1', timestamp: '1', type: 'text', text: { body: 'hi' } },
                        ],
                    },
                },
            ],
        },
    ],
});

const sign = (body: string, secret = APP_SECRET) => `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;

const request = (signature?: string) =>
    new Request('https://example.com/webhook', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(signature ? { 'x-hub-signature-256': signature } : {}) },
        body: rawBody,
    });

async function run(signature: string | undefined, options: Parameters<typeof processWebhookMessages>[3]) {
    const onText = vi.fn();
    const res = await processWebhookMessages(
        request(signature),
        whatsapp,
        { messageHandlers: new Map([[MessageTypesEnum.Text, onText]]) },
        options,
    );
    return { status: res.status, onText };
}

describe('isValidWebhookSignature', () => {
    it('accepts a correct sha256= signature', () => {
        expect(isValidWebhookSignature(rawBody, sign(rawBody), APP_SECRET)).toBe(true);
    });

    it('rejects a signature made with another secret', () => {
        expect(isValidWebhookSignature(rawBody, sign(rawBody, 'other'), APP_SECRET)).toBe(false);
    });

    it('returns false instead of throwing on wrong-length or missing input', () => {
        expect(isValidWebhookSignature(rawBody, 'sha256=abc', APP_SECRET)).toBe(false);
        expect(isValidWebhookSignature(rawBody, null, APP_SECRET)).toBe(false);
        expect(isValidWebhookSignature(rawBody, sign(rawBody), '')).toBe(false);
    });
});

describe('processWebhookMessages signature verification', () => {
    it('is off by default, so unsigned payloads are still processed', async () => {
        const { status, onText } = await run(undefined, undefined);
        expect(status).toBe(200);
        expect(onText).toHaveBeenCalledOnce();
    });

    it('rejects a missing signature with 401 and does not call handlers', async () => {
        const { status, onText } = await run(undefined, { verifySignature: true, appSecret: APP_SECRET });
        expect(status).toBe(401);
        expect(onText).not.toHaveBeenCalled();
    });

    it('rejects an invalid signature with 401', async () => {
        const { status, onText } = await run(sign(rawBody, 'forged'), { verifySignature: true, appSecret: APP_SECRET });
        expect(status).toBe(401);
        expect(onText).not.toHaveBeenCalled();
    });

    it('processes a correctly signed payload', async () => {
        const { status, onText } = await run(sign(rawBody), { verifySignature: true, appSecret: APP_SECRET });
        expect(status).toBe(200);
        expect(onText).toHaveBeenCalledOnce();
    });

    it('fails closed with 500 when verification is on but no app secret is configured', async () => {
        const { status, onText } = await run(sign(rawBody), { verifySignature: true });
        expect(status).toBe(500);
        expect(onText).not.toHaveBeenCalled();
    });
});

describe('nextjsAppWebhookHandler typing', () => {
    it('is not typed as any, so processor handlers get inference', () => {
        expectTypeOf(nextjsAppWebhookHandler).returns.not.toBeAny();
        expectTypeOf(nextjsAppWebhookHandler).returns.toHaveProperty('processor');
    });
});
