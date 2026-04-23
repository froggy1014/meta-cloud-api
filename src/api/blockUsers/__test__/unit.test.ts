import { WhatsApp } from '@core/whatsapp';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WhatsAppValidationError } from '../../../utils/isMetaError';

describe('BlockUsers API - Unit Tests', () => {
    let whatsApp: WhatsApp;
    let mockGetJson: any;

    const mockBlockResponse = {
        block_users: {
            added_users: [{ input: '1234567890', wa_id: '1234567890', status: 'valid' }],
            failed_users: [],
        },
    };

    beforeEach(() => {
        whatsApp = new WhatsApp({
            accessToken: 'test_token',
            phoneNumberId: 123456789,
            businessAcctId: 'test_business_id',
        });

        mockGetJson = vi.spyOn(whatsApp.requester, 'getJson');
        mockGetJson.mockResolvedValue(mockBlockResponse);
    });

    describe('block()', () => {
        it('should throw WhatsAppValidationError for empty users array', async () => {
            await expect(whatsApp.blockUsers.block([])).rejects.toThrow(WhatsAppValidationError);
            await expect(whatsApp.blockUsers.block([])).rejects.toThrow('"users" must contain at least one item.');
        });

        it('should call POST /{phoneNumberId}/block_users with correct payload', async () => {
            await whatsApp.blockUsers.block(['1234567890']);

            expect(mockGetJson).toHaveBeenCalledOnce();
            const [method, endpoint, , body] = mockGetJson.mock.calls[0];

            expect(method).toBe('POST');
            expect(endpoint).toContain('block_users');

            const requestBody = JSON.parse(body);
            expect(requestBody).toMatchObject({
                messaging_product: 'whatsapp',
                block_users: [{ user: '1234567890' }],
            });
        });

        it('should block multiple users', async () => {
            await whatsApp.blockUsers.block(['1111111111', '2222222222']);

            const [, , , body] = mockGetJson.mock.calls[0];
            const requestBody = JSON.parse(body);

            expect(requestBody.block_users).toHaveLength(2);
            expect(requestBody.block_users[0]).toEqual({ user: '1111111111' });
            expect(requestBody.block_users[1]).toEqual({ user: '2222222222' });
        });

        it('should not call API when validation fails', async () => {
            await expect(whatsApp.blockUsers.block([])).rejects.toThrow(WhatsAppValidationError);
            expect(mockGetJson).not.toHaveBeenCalled();
        });
    });

    describe('unblock()', () => {
        it('should throw WhatsAppValidationError for empty users array', async () => {
            await expect(whatsApp.blockUsers.unblock([])).rejects.toThrow(WhatsAppValidationError);
            await expect(whatsApp.blockUsers.unblock([])).rejects.toThrow('"users" must contain at least one item.');
        });

        it('should call DELETE /{phoneNumberId}/block_users with correct payload', async () => {
            await whatsApp.blockUsers.unblock(['1234567890']);

            expect(mockGetJson).toHaveBeenCalledOnce();
            const [method, endpoint, , body] = mockGetJson.mock.calls[0];

            expect(method).toBe('DELETE');
            expect(endpoint).toContain('block_users');

            const requestBody = JSON.parse(body);
            expect(requestBody).toMatchObject({
                messaging_product: 'whatsapp',
                block_users: [{ user: '1234567890' }],
            });
        });
    });

    describe('listBlockedUsers()', () => {
        it('should call GET /{phoneNumberId}/block_users', async () => {
            mockGetJson.mockResolvedValue({ data: [], paging: {} });

            await whatsApp.blockUsers.listBlockedUsers();

            const [method, endpoint] = mockGetJson.mock.calls[0];
            expect(method).toBe('GET');
            expect(endpoint).toContain('block_users');
        });

        it('should append pagination params to endpoint', async () => {
            mockGetJson.mockResolvedValue({ data: [], paging: {} });

            await whatsApp.blockUsers.listBlockedUsers({ limit: 10, after: 'cursor123' });

            const [, endpoint] = mockGetJson.mock.calls[0];
            expect(endpoint).toContain('limit=10');
            expect(endpoint).toContain('after=cursor123');
        });
    });
});
