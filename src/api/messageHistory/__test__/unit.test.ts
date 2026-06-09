import { WhatsApp } from '@core/whatsapp';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Message History API - Unit Tests', () => {
    let whatsApp: WhatsApp;
    let mockGetJson: any;

    beforeEach(() => {
        whatsApp = new WhatsApp({
            accessToken: 'test_token',
            phoneNumberId: 123456789,
            businessAcctId: 'waba_123',
        });

        mockGetJson = vi.spyOn(whatsApp.requester, 'getJson');
        mockGetJson.mockResolvedValue({ data: [] });
    });

    it('gets message history from the configured phone number', async () => {
        await whatsApp.messageHistory.getMessageHistory({ message_id: 'wamid_123', limit: 5 });

        const [method, endpoint, _, body] = mockGetJson.mock.calls[0];
        expect(method).toBe('GET');
        expect(endpoint).toBe('123456789/message_history?message_id=wamid_123&limit=5');
        expect(body).toBeNull();
    });

    it('gets message history events', async () => {
        await whatsApp.messageHistory.getMessageHistoryEvents('history_123', { status_filter: 'DELIVERED' });

        const [method, endpoint, _, body] = mockGetJson.mock.calls[0];
        expect(method).toBe('GET');
        expect(endpoint).toBe('history_123/events?status_filter=DELIVERED');
        expect(body).toBeNull();
    });
});
