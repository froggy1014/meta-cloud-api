import { describe, expect, it, vi } from 'vitest';

import type WhatsApp from '../../../whatsapp/WhatsApp';
import type { WebhookPayload } from '../../types';
import { processWebhookMessages } from '../webhookUtils';

const createRequest = (payload: WebhookPayload): { request: Request; rawBody: string } => {
    const rawBody = JSON.stringify(payload);

    return {
        rawBody,
        request: new Request('https://example.com/webhook', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-hub-signature-256': 'sha256=test-signature',
            },
            body: rawBody,
        }),
    };
};

const whatsapp = {} as WhatsApp;

describe('processWebhookMessages', () => {
    it('passes request headers and raw body to raw webhook handlers', async () => {
        const payload = {
            object: 'whatsapp_business_account',
            entry: [
                {
                    id: 'waba-id',
                    changes: [
                        {
                            field: 'message_template_status_update',
                            value: {
                                event: 'APPROVED',
                                message_template_id: 123,
                                message_template_name: 'hello_world',
                                message_template_language: 'en_US',
                            },
                        },
                    ],
                },
            ],
        } as unknown as WebhookPayload;
        const { request, rawBody } = createRequest(payload);
        const rawHandler = vi.fn();

        await processWebhookMessages(request, whatsapp, {
            messageHandlers: new Map(),
            rawHandler,
        });

        expect(rawHandler).toHaveBeenCalledOnce();
        expect(rawHandler.mock.calls[0]?.[1]).toEqual(payload);
        expect(rawHandler.mock.calls[0]?.[2]).toMatchObject({
            rawBody,
            method: 'POST',
            url: 'https://example.com/webhook',
        });
        expect(rawHandler.mock.calls[0]?.[2].headers.get('x-hub-signature-256')).toBe('sha256=test-signature');
    });

    it('keeps context raw body unchanged when raw payload is field-filtered', async () => {
        const payload = {
            object: 'whatsapp_business_account',
            entry: [
                {
                    id: 'waba-id',
                    changes: [
                        {
                            field: 'messages',
                            value: {
                                messaging_product: 'whatsapp',
                                metadata: {
                                    display_phone_number: '15551234567',
                                    phone_number_id: 'phone-number-id',
                                },
                                messages: [
                                    {
                                        id: 'message-id',
                                        from: '15557654321',
                                        timestamp: '1234567890',
                                        text: { body: 'hello' },
                                        type: 'text',
                                    },
                                ],
                            },
                        },
                        {
                            field: 'message_template_status_update',
                            value: {
                                event: 'APPROVED',
                                message_template_id: 123,
                                message_template_name: 'hello_world',
                                message_template_language: 'en_US',
                            },
                        },
                    ],
                },
            ],
        } as unknown as WebhookPayload;
        const { request, rawBody } = createRequest(payload);
        const rawHandler = vi.fn();

        await processWebhookMessages(request, whatsapp, {
            messageHandlers: new Map(),
            rawHandler,
            rawHandlerFields: ['message_template_status_update'],
        });

        const filteredPayload = rawHandler.mock.calls[0]?.[1] as WebhookPayload;
        const context = rawHandler.mock.calls[0]?.[2];

        expect(filteredPayload.entry[0]?.changes).toHaveLength(1);
        expect(filteredPayload.entry[0]?.changes[0]?.field).toBe('message_template_status_update');
        expect(context.rawBody).toBe(rawBody);
        expect(JSON.parse(context.rawBody).entry[0].changes).toHaveLength(2);
    });
});
