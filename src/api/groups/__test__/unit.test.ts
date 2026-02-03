import { WhatsApp } from '@core/whatsapp';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Groups API - Unit Tests', () => {
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
            id: 'group_123',
        });
    });

    it('creates group with correct endpoint and body', async () => {
        await whatsApp.groups.createGroup({
            subject: 'New Group',
            description: 'Test group',
            join_approval_mode: 'auto_approve',
        });

        const [method, endpoint, _, body] = mockRequestSend.mock.calls[0];
        expect(method).toBe('POST');
        expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/groups`);
        expect(JSON.parse(body)).toEqual({
            messaging_product: 'whatsapp',
            subject: 'New Group',
            description: 'Test group',
            join_approval_mode: 'auto_approve',
        });
    });

    it('fetches active groups with query params', async () => {
        await whatsApp.groups.getActiveGroups({ limit: 10, after: 'cursor' });

        const [method, endpoint] = mockRequestSend.mock.calls[0];
        expect(method).toBe('GET');
        expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/groups?limit=10&after=cursor`);
    });

    it('fetches group info with fields', async () => {
        await whatsApp.groups.getGroupInfo('group_id', ['subject', 'description']);

        const [method, endpoint] = mockRequestSend.mock.calls[0];
        expect(method).toBe('GET');
        expect(endpoint).toBe('/group_id?fields=subject%2Cdescription');
    });

    it('resets invite link with correct endpoint', async () => {
        await whatsApp.groups.resetGroupInviteLink('group_id');

        const [method, endpoint, _, body] = mockRequestSend.mock.calls[0];
        expect(method).toBe('POST');
        expect(endpoint).toBe('/group_id/invite_link');
        expect(JSON.parse(body)).toEqual({ messaging_product: 'whatsapp' });
    });

    it('approves join requests with correct endpoint', async () => {
        await whatsApp.groups.approveJoinRequests('group_id', ['req_1', 'req_2']);

        const [method, endpoint, _, body] = mockRequestSend.mock.calls[0];
        expect(method).toBe('POST');
        expect(endpoint).toBe('/group_id/join_requests');
        expect(JSON.parse(body)).toEqual({
            messaging_product: 'whatsapp',
            join_requests: ['req_1', 'req_2'],
        });
    });

    it('removes group participants with correct endpoint', async () => {
        await whatsApp.groups.removeParticipants('group_id', ['+123', '+456']);

        const [method, endpoint, _, body] = mockRequestSend.mock.calls[0];
        expect(method).toBe('DELETE');
        expect(endpoint).toBe('/group_id/participants');
        expect(JSON.parse(body)).toEqual({
            messaging_product: 'whatsapp',
            participants: [{ user: '+123' }, { user: '+456' }],
        });
    });
});
