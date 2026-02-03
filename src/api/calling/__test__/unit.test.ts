import { WhatsApp } from '@core/whatsapp';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Calling API - Unit Tests', () => {
    let whatsApp: WhatsApp;
    let mockRequestSend: any;

    beforeEach(() => {
        whatsApp = new WhatsApp({
            accessToken: process.env.CLOUD_API_ACCESS_TOKEN || 'test_token',
            phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID) || 123456789,
            businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID || 'test_business_id',
        });

        mockRequestSend = vi.spyOn(whatsApp.requester, 'getJson');
        mockRequestSend.mockResolvedValue({ success: true });
    });

    it('updates calling settings', async () => {
        await whatsApp.calling.updateCallingSettings({
            calling: { status: 'ENABLED', call_icon_visibility: 'DEFAULT' },
        });

        const [method, endpoint, _, body] = mockRequestSend.mock.calls[0];
        expect(method).toBe('POST');
        expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/settings`);
        expect(JSON.parse(body)).toEqual({ calling: { status: 'ENABLED', call_icon_visibility: 'DEFAULT' } });
    });

    it('gets calling settings with params', async () => {
        await whatsApp.calling.getCallingSettings({ fields: ['calling'], include_sip_credentials: true });

        const [method, endpoint] = mockRequestSend.mock.calls[0];
        expect(method).toBe('GET');
        expect(endpoint).toBe(
            `${whatsApp.requester.phoneNumberId}/settings?fields=calling&include_sip_credentials=true`,
        );
    });

    it('gets call permissions', async () => {
        await whatsApp.calling.getCallPermissions({ userWaId: '12345' });

        const [method, endpoint] = mockRequestSend.mock.calls[0];
        expect(method).toBe('GET');
        expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/call_permissions?user_wa_id=12345`);
    });

    it('initiates a call', async () => {
        await whatsApp.calling.initiateCall({
            to: '14085551234',
            session: { sdp_type: 'offer', sdp: 'v=0' },
        });

        const [method, endpoint, _, body] = mockRequestSend.mock.calls[0];
        expect(method).toBe('POST');
        expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/calls`);
        expect(JSON.parse(body)).toEqual({
            messaging_product: 'whatsapp',
            to: '14085551234',
            action: 'connect',
            session: { sdp_type: 'offer', sdp: 'v=0' },
        });
    });
});
