import { WhatsApp } from '@core/whatsapp';

import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Encryption API - Unit Tests', () => {
    let whatsApp: WhatsApp;
    let mockRequestSend: any;

    beforeEach(() => {
        whatsApp = new WhatsApp({
            accessToken: process.env.CLOUD_API_ACCESS_TOKEN || 'test_token',
            phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID) || 123456789,
            businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID || 'test_business_id',
        });

        mockRequestSend = vi.spyOn(whatsApp.requester, 'getJson');
    });

    describe('getEncryptionPublicKey', () => {
        it('should construct correct GET request parameters', async () => {
            mockRequestSend.mockResolvedValue({
                data: {
                    business_public_key: 'test_public_key_123',
                    business_public_key_signature_status: 'VALID',
                },
            });

            await whatsApp.encryption.getEncryptionPublicKey();

            expect(mockRequestSend).toHaveBeenCalledTimes(1);
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('GET');
            expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/whatsapp_business_encryption`);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });

        it('should handle API response correctly', async () => {
            const mockResponse = {
                data: {
                    business_public_key: 'valid_key_123',
                    business_public_key_signature_status: 'VALID',
                },
            };

            mockRequestSend.mockResolvedValue(mockResponse);

            const result = await whatsApp.encryption.getEncryptionPublicKey();

            expect(result.data.business_public_key).toBe('valid_key_123');
            expect(result.data.business_public_key_signature_status).toBe('VALID');
        });

        it('should handle API errors', async () => {
            const mockError = new Error('API Error: Unable to fetch public key');
            mockRequestSend.mockRejectedValue(mockError);

            await expect(whatsApp.encryption.getEncryptionPublicKey()).rejects.toThrow(
                'API Error: Unable to fetch public key',
            );
        });
    });

    describe('setEncryptionPublicKey', () => {
        it('should construct correct POST request with FormData', async () => {
            mockRequestSend.mockResolvedValue({ success: true });

            const businessPublicKey = 'new_business_public_key_789';

            await whatsApp.encryption.setEncryptionPublicKey(businessPublicKey);

            expect(mockRequestSend).toHaveBeenCalledTimes(1);
            const [method, endpoint, timeout, formData] = mockRequestSend.mock.calls[0];

            expect(method).toBe('POST');
            expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/whatsapp_business_encryption`);
            expect(timeout).toBeGreaterThan(0);
            expect(formData).toBeInstanceOf(FormData);

            // Verify FormData contains the correct key
            expect(formData.get('business_public_key')).toBe(businessPublicKey);
        });

        it('should handle empty business public key', async () => {
            mockRequestSend.mockResolvedValue({ success: true });

            const businessPublicKey = '';

            await whatsApp.encryption.setEncryptionPublicKey(businessPublicKey);

            expect(mockRequestSend).toHaveBeenCalled();
            const [, , , formData] = mockRequestSend.mock.calls[0];

            expect(formData.get('business_public_key')).toBe('');
        });

        it('should handle API errors when setting public key', async () => {
            const mockError = new Error('API Error: Unable to set public key');
            mockRequestSend.mockRejectedValue(mockError);

            const businessPublicKey = 'test_key';

            await expect(whatsApp.encryption.setEncryptionPublicKey(businessPublicKey)).rejects.toThrow(
                'API Error: Unable to set public key',
            );
        });
    });

    describe('API Integration', () => {
        it('should be accessible through WhatsApp instance', () => {
            expect(whatsApp.encryption).toBeDefined();
            expect(typeof whatsApp.encryption.getEncryptionPublicKey).toBe('function');
            expect(typeof whatsApp.encryption.setEncryptionPublicKey).toBe('function');
        });

        it('should use consistent endpoint for both operations', async () => {
            mockRequestSend.mockResolvedValue({
                data: { business_public_key: 'test', business_public_key_signature_status: 'VALID' },
            });

            // Test GET operation
            await whatsApp.encryption.getEncryptionPublicKey();
            const getEndpoint = mockRequestSend.mock.calls[0][1];

            // Reset and test POST operation
            mockRequestSend.mockClear();
            mockRequestSend.mockResolvedValue({ success: true });
            await whatsApp.encryption.setEncryptionPublicKey('test_key');
            const postEndpoint = mockRequestSend.mock.calls[0][1];

            // Both should use the same endpoint
            expect(getEndpoint).toBe(postEndpoint);
            expect(getEndpoint).toContain('whatsapp_business_encryption');
        });
    });
});
