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

    it('gets call permissions by BSUID', async () => {
        await whatsApp.calling.getCallPermissions({ recipient: 'US.13491208655302741918' });

        const [method, endpoint] = mockRequestSend.mock.calls[0];
        expect(method).toBe('GET');
        expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/call_permissions?recipient=US.13491208655302741918`);
    });

    it('rejects call permission lookups without a user identifier', async () => {
        await expect(whatsApp.calling.getCallPermissions({})).rejects.toThrow('userWaId');
    });

    it('initiates a call to a BSUID without a phone number', async () => {
        await whatsApp.calling.initiateCall({
            recipient: 'US.13491208655302741918',
            session: { sdp_type: 'offer', sdp: 'v=0' },
        });

        const [, , , body] = mockRequestSend.mock.calls[0];
        expect(JSON.parse(body)).toEqual({
            messaging_product: 'whatsapp',
            recipient: 'US.13491208655302741918',
            action: 'connect',
            session: { sdp_type: 'offer', sdp: 'v=0' },
        });
    });

    it('rejects initiating a call without to or recipient', async () => {
        await expect(whatsApp.calling.initiateCall({ session: { sdp_type: 'offer', sdp: 'v=0' } })).rejects.toThrow(
            'recipient',
        );
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

    it('initiates a call with recording and transcription', async () => {
        await whatsApp.calling.initiateCall({
            to: '14085551234',
            session: { sdp_type: 'offer', sdp: 'v=0' },
            recording: { status: 'ENABLED', purpose: 'Quality assurance', announcement_language: 'en_US' },
            transcription: { status: 'ENABLED', purpose: 'Quality assurance', announcement_language: 'en_US' },
        });

        const [method, endpoint, _, body] = mockRequestSend.mock.calls[0];
        expect(method).toBe('POST');
        expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/calls`);
        expect(JSON.parse(body)).toEqual({
            messaging_product: 'whatsapp',
            to: '14085551234',
            action: 'connect',
            session: { sdp_type: 'offer', sdp: 'v=0' },
            recording: { status: 'ENABLED', purpose: 'Quality assurance', announcement_language: 'en_US' },
            transcription: { status: 'ENABLED', purpose: 'Quality assurance', announcement_language: 'en_US' },
        });
    });

    it('accepts a call with recording configuration', async () => {
        await whatsApp.calling.acceptCall({
            call_id: 'wacid.123',
            session: { sdp_type: 'answer', sdp: 'v=0' },
            recording: { status: 'ENABLED', purpose: 'Quality assurance', announcement_language: 'en' },
        });

        const [method, endpoint, _, body] = mockRequestSend.mock.calls[0];
        expect(method).toBe('POST');
        expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/calls`);
        expect(JSON.parse(body)).toEqual({
            messaging_product: 'whatsapp',
            call_id: 'wacid.123',
            action: 'accept',
            session: { sdp_type: 'answer', sdp: 'v=0' },
            recording: { status: 'ENABLED', purpose: 'Quality assurance', announcement_language: 'en' },
        });
    });

    it('sends messaging_account_id on every call action when provided', async () => {
        const messaging_account_id = '1234567890';
        await whatsApp.calling.initiateCall({
            to: '14085551234',
            session: { sdp_type: 'offer', sdp: 'v=0' },
            messaging_account_id,
        });
        await whatsApp.calling.preAcceptCall({ call_id: 'wacid.123', messaging_account_id });
        await whatsApp.calling.acceptCall({ call_id: 'wacid.123', messaging_account_id });
        await whatsApp.calling.rejectCall({ call_id: 'wacid.123', messaging_account_id });
        await whatsApp.calling.terminateCall({ call_id: 'wacid.123', messaging_account_id });

        const bodies = mockRequestSend.mock.calls.map((call: unknown[]) => JSON.parse(call[3] as string));
        expect(bodies.map((b: { action: string }) => b.action)).toEqual([
            'connect',
            'pre_accept',
            'accept',
            'reject',
            'terminate',
        ]);
        for (const b of bodies) {
            expect(b.messaging_account_id).toBe(messaging_account_id);
        }
    });

    it('omits messaging_account_id when not provided', async () => {
        await whatsApp.calling.rejectCall({ call_id: 'wacid.123' });
        await whatsApp.calling.terminateCall({ call_id: 'wacid.123' });

        for (const call of mockRequestSend.mock.calls) {
            expect(JSON.parse(call[3])).not.toHaveProperty('messaging_account_id');
        }
    });
});
