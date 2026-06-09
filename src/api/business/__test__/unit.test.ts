import { WhatsApp } from '@core/whatsapp';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Business API - Unit Tests', () => {
    let whatsApp: WhatsApp;
    let mockGetJson: any;

    beforeEach(() => {
        whatsApp = new WhatsApp({
            accessToken: 'test_token',
            appId: 'app_123',
            phoneNumberId: 123456789,
            businessAcctId: 'waba_123',
        });

        mockGetJson = vi.spyOn(whatsApp.requester, 'getJson');
        mockGetJson.mockResolvedValue({ data: [] });
    });

    it('gets connected client businesses with configured app id', async () => {
        await whatsApp.business.getConnectedClientBusinesses(undefined, { limit: 10 });

        const [method, endpoint, _, body] = mockGetJson.mock.calls[0];
        expect(method).toBe('GET');
        expect(endpoint).toBe('app_123/connected_client_businesses?limit=10');
        expect(body).toBeNull();
    });

    it('adds a phone number to a business', async () => {
        await whatsApp.business.addPhoneNumbers('business_123', { phone_number: '+15551234567' });

        const [method, endpoint, _, body] = mockGetJson.mock.calls[0];
        expect(method).toBe('POST');
        expect(endpoint).toBe('business_123/add_phone_numbers');
        expect(JSON.parse(body)).toEqual({ phone_number: '+15551234567' });
    });

    it('requests and verifies a pre-verified phone number code', async () => {
        await whatsApp.business.requestPreVerifiedPhoneNumberCode('pre_123', {
            code_method: 'SMS',
            language: 'en_US',
        });

        expect(mockGetJson.mock.calls[0][0]).toBe('POST');
        expect(mockGetJson.mock.calls[0][1]).toBe('pre_123/request_code');

        mockGetJson.mockClear();
        await whatsApp.business.verifyPreVerifiedPhoneNumberCode('pre_123', { code: '123456' });

        expect(mockGetJson.mock.calls[0][0]).toBe('POST');
        expect(mockGetJson.mock.calls[0][1]).toBe('pre_123/verify_code');
    });
});
