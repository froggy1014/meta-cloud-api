import { beforeEach, describe, expect, it, vi } from 'vitest';
import WhatsApp from '../../../whatsapp';

describe('TwoStepVerification API - Unit Tests', () => {
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
            success: true,
        });
    });

    describe('Two-Step Verification Operations', () => {
        it('should set two-step verification code with correct endpoint and body', async () => {
            const pin = '123456';

            await whatsApp.twoStepVerification.setTwoStepVerificationCode(pin);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('POST');
            expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}`);
            expect(timeout).toBeGreaterThan(0);

            const parsedBody = JSON.parse(body);
            expect(parsedBody).toEqual({ pin });
        });

        it('should handle PIN code with leading zeros correctly', async () => {
            const pin = '012345';

            await whatsApp.twoStepVerification.setTwoStepVerificationCode(pin);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const parsedBody = JSON.parse(body);
            expect(parsedBody.pin).toBe('012345');
        });

        it('should handle PIN code as string regardless of numeric content', async () => {
            const pin = '999999';

            await whatsApp.twoStepVerification.setTwoStepVerificationCode(pin);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const parsedBody = JSON.parse(body);
            expect(typeof parsedBody.pin).toBe('string');
            expect(parsedBody.pin).toBe(pin);
        });

        it('should use correct HTTP method for setting PIN', async () => {
            const pin = '654321';

            await whatsApp.twoStepVerification.setTwoStepVerificationCode(pin);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method] = mockRequestSend.mock.calls[0];

            expect(method).toBe('POST');
        });

        it('should include phone number ID in endpoint', async () => {
            const pin = '111111';
            const expectedPhoneNumberId = whatsApp.requester.phoneNumberId;

            await whatsApp.twoStepVerification.setTwoStepVerificationCode(pin);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, endpoint] = mockRequestSend.mock.calls[0];

            expect(endpoint).toBe(`${expectedPhoneNumberId}`);
        });
    });

    describe('Request Body Structure Validation', () => {
        it('should create correct JSON body structure for PIN setting', async () => {
            const pin = '987654';

            await whatsApp.twoStepVerification.setTwoStepVerificationCode(pin);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody).toHaveProperty('pin');
            expect(parsedBody.pin).toBe(pin);
            expect(Object.keys(parsedBody)).toHaveLength(1);
        });

        it('should stringify body correctly', async () => {
            const pin = '111222';

            await whatsApp.twoStepVerification.setTwoStepVerificationCode(pin);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            expect(typeof body).toBe('string');
            expect(() => JSON.parse(body)).not.toThrow();
        });

        it('should handle empty PIN gracefully', async () => {
            const pin = '';

            await whatsApp.twoStepVerification.setTwoStepVerificationCode(pin);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody.pin).toBe('');
        });

        it('should handle special characters in PIN', async () => {
            const pin = '123*45';

            await whatsApp.twoStepVerification.setTwoStepVerificationCode(pin);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody.pin).toBe('123*45');
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully', async () => {
            mockRequestSend.mockRejectedValue(new Error('API Error: Invalid PIN format'));

            await expect(whatsApp.twoStepVerification.setTwoStepVerificationCode('invalid')).rejects.toThrow(
                'API Error: Invalid PIN format',
            );
        });

        it('should handle network errors', async () => {
            mockRequestSend.mockRejectedValue(new Error('Network error'));

            await expect(whatsApp.twoStepVerification.setTwoStepVerificationCode('123456')).rejects.toThrow(
                'Network error',
            );
        });

        it('should handle timeout errors', async () => {
            mockRequestSend.mockRejectedValue(new Error('Request timeout'));

            await expect(whatsApp.twoStepVerification.setTwoStepVerificationCode('123456')).rejects.toThrow(
                'Request timeout',
            );
        });

        it('should handle unauthorized errors', async () => {
            mockRequestSend.mockRejectedValue(new Error('Unauthorized: Invalid access token'));

            await expect(whatsApp.twoStepVerification.setTwoStepVerificationCode('123456')).rejects.toThrow(
                'Unauthorized: Invalid access token',
            );
        });
    });

    describe('API Integration', () => {
        it('should be accessible through WhatsApp instance', () => {
            expect(whatsApp.twoStepVerification).toBeDefined();
            expect(typeof whatsApp.twoStepVerification.setTwoStepVerificationCode).toBe('function');
        });

        it('should use consistent timeout configuration', async () => {
            const pin = '123456';

            await whatsApp.twoStepVerification.setTwoStepVerificationCode(pin);

            const [_, __, timeout] = mockRequestSend.mock.calls[0];
            expect(timeout).toBeGreaterThan(0);
            expect(typeof timeout).toBe('number');
        });

        it('should maintain API consistency across calls', async () => {
            const pin1 = '111111';
            const pin2 = '222222';

            await whatsApp.twoStepVerification.setTwoStepVerificationCode(pin1);
            await whatsApp.twoStepVerification.setTwoStepVerificationCode(pin2);

            expect(mockRequestSend).toHaveBeenCalledTimes(2);

            // Check that both calls use the same method and endpoint structure
            const [method1, endpoint1] = mockRequestSend.mock.calls[0];
            const [method2, endpoint2] = mockRequestSend.mock.calls[1];

            expect(method1).toBe(method2);
            expect(endpoint1).toBe(endpoint2);
        });
    });

    describe('Response Handling', () => {
        it('should return success response correctly', async () => {
            const mockResponse = { success: true };
            mockRequestSend.mockResolvedValue(mockResponse);

            const result = await whatsApp.twoStepVerification.setTwoStepVerificationCode('123456');

            expect(result).toEqual(mockResponse);
        });

        it('should handle complex response structures', async () => {
            const mockResponse = {
                success: true,
                message: 'PIN updated successfully',
                timestamp: Date.now(),
            };
            mockRequestSend.mockResolvedValue(mockResponse);

            const result = await whatsApp.twoStepVerification.setTwoStepVerificationCode('123456');

            expect(result).toEqual(mockResponse);
        });
    });
});
