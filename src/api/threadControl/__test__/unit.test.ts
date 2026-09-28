import { WhatsApp } from '@core/whatsapp';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Thread Control API - Unit Tests', () => {
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
            request_id: 'REQ_123',
        });
    });

    it('sends an untargeted pass to the thread_control endpoint', async () => {
        const result = await whatsApp.threadControl.pass({ to: '15551234567' });

        const [method, endpoint, , body] = mockRequestSend.mock.calls[0];
        expect(method).toBe('POST');
        expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/thread_control`);
        expect(JSON.parse(body)).toEqual({
            messaging_product: 'whatsapp',
            to: '15551234567',
            action: 'pass',
        });
        expect(result.request_id).toBe('REQ_123');
    });

    it('sends a targeted pass with a BSUID recipient and metadata', async () => {
        await whatsApp.threadControl.pass({
            recipient: 'US.13491208655302741918',
            metadata: 'WhatsApp user requested human agent',
            control_pass: { target_role: 'ai_agent' },
        });

        const [, , , body] = mockRequestSend.mock.calls[0];
        expect(JSON.parse(body)).toEqual({
            messaging_product: 'whatsapp',
            recipient: 'US.13491208655302741918',
            action: 'pass',
            metadata: 'WhatsApp user requested human agent',
            control_pass: { target_role: 'ai_agent' },
        });
    });

    it('sends release and take actions', async () => {
        await whatsApp.threadControl.release({ to: '15551234567' });
        await whatsApp.threadControl.take({
            recipient: 'US.13491208655302741918',
            metadata: 'Human agent stepping in',
        });

        expect(JSON.parse(mockRequestSend.mock.calls[0][3])).toEqual({
            messaging_product: 'whatsapp',
            to: '15551234567',
            action: 'release',
        });
        expect(JSON.parse(mockRequestSend.mock.calls[1][3])).toEqual({
            messaging_product: 'whatsapp',
            recipient: 'US.13491208655302741918',
            action: 'take',
            metadata: 'Human agent stepping in',
        });
    });

    it('rejects a request with both or neither user identifier', async () => {
        await expect(whatsApp.threadControl.release({ to: '15551234567', recipient: 'US.1' } as any)).rejects.toThrow(
            'Exactly one of "to" or "recipient" is required for thread control.',
        );
        await expect(whatsApp.threadControl.take({} as any)).rejects.toThrow(
            'Exactly one of "to" or "recipient" is required for thread control.',
        );
        expect(mockRequestSend).not.toHaveBeenCalled();
    });

    it('rejects control_pass outside the pass action and oversized metadata', async () => {
        await expect(
            whatsApp.threadControl.take({ to: '15551234567', control_pass: { target_role: 'marketing' } } as any),
        ).rejects.toThrow('"control_pass" is only supported for the pass action.');
        await expect(whatsApp.threadControl.pass({ to: '15551234567', metadata: 'x'.repeat(2001) })).rejects.toThrow(
            '"metadata" must be at most 2000 characters for thread control.',
        );
        expect(mockRequestSend).not.toHaveBeenCalled();
    });
});
