import { WhatsApp } from '@core/whatsapp';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Marketing Messages API - Unit Tests', () => {
    let whatsApp: WhatsApp;
    let mockRequestSend: any;

    beforeEach(() => {
        whatsApp = new WhatsApp({
            accessToken: process.env.CLOUD_API_ACCESS_TOKEN || 'test_token',
            phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID) || 123456789,
            businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID || 'test_business_id',
        });

        mockRequestSend = vi.spyOn(whatsApp.requester, 'getJson');
        mockRequestSend.mockResolvedValue({
            messaging_product: 'whatsapp',
            messages: [{ id: 'msg_1' }],
        });
    });

    it('sends marketing template message with correct payload', async () => {
        await whatsApp.marketingMessages.sendTemplateMessage({
            to: '15551234567',
            template: {
                name: 'marketing_template',
                language: { code: 'en_US' },
            },
            message_activity_sharing: true,
        });

        const [method, endpoint, _, body] = mockRequestSend.mock.calls[0];
        expect(method).toBe('POST');
        expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/marketing_messages`);
        expect(JSON.parse(body)).toEqual({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: '15551234567',
            type: 'template',
            template: {
                name: 'marketing_template',
                language: { code: 'en_US' },
            },
            message_activity_sharing: true,
        });
    });
});
