import { WhatsApp } from '@core/whatsapp';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('PhoneNumber API - Unit Tests', () => {
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
            display_phone_number: '+1234567890',
            id: 'phone_123',
            quality_rating: 'GREEN',
            verified_name: 'Test Business',
        });
    });

    describe('PhoneNumber Operations', () => {
        it('should get phone number by ID with correct endpoint', async () => {
            await whatsApp.phoneNumbers.getPhoneNumberById();

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('GET');
            expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}`);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });

        it('should get phone number by ID with fields parameter', async () => {
            const fields = 'display_phone_number,verified_name,quality_rating';

            await whatsApp.phoneNumbers.getPhoneNumberById(fields);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('GET');
            expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}?fields=${encodeURIComponent(fields)}`);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });

        it('should get all phone numbers with correct endpoint', async () => {
            await whatsApp.phoneNumbers.getPhoneNumbers();

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('GET');
            expect(endpoint).toBe(`${whatsApp.requester.businessAcctId}/phone_numbers`);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });

        it('should request verification code with correct endpoint and body', async () => {
            const request = {
                code_method: 'SMS' as const,
                language: 'en_US',
            };

            await whatsApp.phoneNumbers.requestVerificationCode(request);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('POST');
            expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/request_code`);
            expect(timeout).toBeGreaterThan(0);
            expect(JSON.parse(body)).toEqual(request);
        });

        it('should verify code with correct endpoint and body', async () => {
            const request = {
                code: '123456',
            };

            await whatsApp.phoneNumbers.verifyCode(request);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('POST');
            expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/verify_code`);
            expect(timeout).toBeGreaterThan(0);
            expect(JSON.parse(body)).toEqual(request);
        });
    });

    describe('Request Body Structure Validation', () => {
        it('should create correct request body for SMS verification code request', async () => {
            const request = {
                code_method: 'SMS' as const,
                language: 'en_US',
            };

            await whatsApp.phoneNumbers.requestVerificationCode(request);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody).toHaveProperty('code_method', 'SMS');
            expect(parsedBody).toHaveProperty('language', 'en_US');
        });

        it('should create correct request body for VOICE verification code request', async () => {
            const request = {
                code_method: 'VOICE' as const,
                language: 'es_ES',
            };

            await whatsApp.phoneNumbers.requestVerificationCode(request);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody).toHaveProperty('code_method', 'VOICE');
            expect(parsedBody).toHaveProperty('language', 'es_ES');
        });

        it('should create correct request body for verification code with different languages', async () => {
            const languages = ['en_US', 'es_ES', 'fr_FR', 'de_DE', 'it_IT', 'pt_BR'];

            for (const language of languages) {
                mockRequestSend.mockClear();
                const request = {
                    code_method: 'SMS' as const,
                    language,
                };

                await whatsApp.phoneNumbers.requestVerificationCode(request);

                const [_, __, ___, body] = mockRequestSend.mock.calls[0];
                const parsedBody = JSON.parse(body);

                expect(parsedBody).toHaveProperty('language', language);
            }
        });

        it('should create correct request body for code verification', async () => {
            const request = {
                code: '654321',
            };

            await whatsApp.phoneNumbers.verifyCode(request);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody).toHaveProperty('code', '654321');
            expect(typeof parsedBody.code).toBe('string');
        });

        it('should handle numeric codes as strings', async () => {
            const codes = ['123456', '000000', '999999', '123abc'];

            for (const code of codes) {
                mockRequestSend.mockClear();
                const request = { code };

                await whatsApp.phoneNumbers.verifyCode(request);

                const [_, __, ___, body] = mockRequestSend.mock.calls[0];
                const parsedBody = JSON.parse(body);

                expect(parsedBody.code).toBe(code);
                expect(typeof parsedBody.code).toBe('string');
            }
        });
    });

    describe('Query Parameter Handling', () => {
        it('should handle single field parameter correctly', async () => {
            const field = 'display_phone_number';

            await whatsApp.phoneNumbers.getPhoneNumberById(field);

            const [_, endpoint] = mockRequestSend.mock.calls[0];
            expect(endpoint).toContain(`?fields=${field}`);
        });

        it('should handle multiple fields parameter correctly', async () => {
            const fields = 'display_phone_number,verified_name,quality_rating,status';

            await whatsApp.phoneNumbers.getPhoneNumberById(fields);

            const [_, endpoint] = mockRequestSend.mock.calls[0];
            expect(endpoint).toContain(`?fields=${encodeURIComponent(fields)}`);
        });

        it('should handle fields with special characters correctly', async () => {
            const fields = 'field1,field2 with spaces,field_with_underscores';

            await whatsApp.phoneNumbers.getPhoneNumberById(fields);

            const [_, endpoint] = mockRequestSend.mock.calls[0];
            expect(endpoint).toContain(`?fields=${encodeURIComponent(fields)}`);
        });

        it('should not include query parameters when fields is undefined', async () => {
            await whatsApp.phoneNumbers.getPhoneNumberById();

            const [_, endpoint] = mockRequestSend.mock.calls[0];
            expect(endpoint).not.toContain('?');
            expect(endpoint).not.toContain('fields');
        });

        it('should not include query parameters when fields is empty string', async () => {
            await whatsApp.phoneNumbers.getPhoneNumberById('');

            const [_, endpoint] = mockRequestSend.mock.calls[0];
            expect(endpoint).not.toContain('?');
            expect(endpoint).not.toContain('fields');
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully for getPhoneNumberById', async () => {
            mockRequestSend.mockRejectedValue(new Error('API Error: Phone number not found'));

            await expect(whatsApp.phoneNumbers.getPhoneNumberById()).rejects.toThrow(
                'API Error: Phone number not found',
            );
        });

        it('should handle API errors gracefully for getPhoneNumbers', async () => {
            mockRequestSend.mockRejectedValue(new Error('API Error: Failed to fetch phone numbers'));

            await expect(whatsApp.phoneNumbers.getPhoneNumbers()).rejects.toThrow(
                'API Error: Failed to fetch phone numbers',
            );
        });

        it('should handle API errors gracefully for requestVerificationCode', async () => {
            mockRequestSend.mockRejectedValue(new Error('API Error: Verification code request failed'));

            const request = {
                code_method: 'SMS' as const,
                language: 'en_US',
            };

            await expect(whatsApp.phoneNumbers.requestVerificationCode(request)).rejects.toThrow(
                'API Error: Verification code request failed',
            );
        });

        it('should handle API errors gracefully for verifyCode', async () => {
            mockRequestSend.mockRejectedValue(new Error('API Error: Code verification failed'));

            const request = {
                code: '123456',
            };

            await expect(whatsApp.phoneNumbers.verifyCode(request)).rejects.toThrow(
                'API Error: Code verification failed',
            );
        });

        it('should handle network timeout errors', async () => {
            mockRequestSend.mockRejectedValue(new Error('Network timeout'));

            await expect(whatsApp.phoneNumbers.getPhoneNumberById()).rejects.toThrow('Network timeout');
            await expect(whatsApp.phoneNumbers.getPhoneNumbers()).rejects.toThrow('Network timeout');

            const verificationRequest = { code_method: 'SMS' as const, language: 'en_US' };
            await expect(whatsApp.phoneNumbers.requestVerificationCode(verificationRequest)).rejects.toThrow(
                'Network timeout',
            );

            const verifyRequest = { code: '123456' };
            await expect(whatsApp.phoneNumbers.verifyCode(verifyRequest)).rejects.toThrow('Network timeout');
        });
    });

    describe('API Integration', () => {
        it('should be accessible through WhatsApp instance', () => {
            expect(whatsApp.phoneNumbers).toBeDefined();
            expect(typeof whatsApp.phoneNumbers.getPhoneNumberById).toBe('function');
            expect(typeof whatsApp.phoneNumbers.getPhoneNumbers).toBe('function');
            expect(typeof whatsApp.phoneNumbers.requestVerificationCode).toBe('function');
            expect(typeof whatsApp.phoneNumbers.verifyCode).toBe('function');
        });

        it('should use phone number ID in single resource endpoints', async () => {
            const phoneNumberId = whatsApp.requester.phoneNumberId;

            // Test getPhoneNumberById
            await whatsApp.phoneNumbers.getPhoneNumberById();
            const getByIdEndpoint = mockRequestSend.mock.calls[0][1];
            expect(getByIdEndpoint).toContain(phoneNumberId.toString());

            // Test requestVerificationCode
            mockRequestSend.mockClear();
            await whatsApp.phoneNumbers.requestVerificationCode({ code_method: 'SMS', language: 'en_US' });
            const requestCodeEndpoint = mockRequestSend.mock.calls[0][1];
            expect(requestCodeEndpoint).toContain(phoneNumberId.toString());
            expect(requestCodeEndpoint).toContain('/request_code');

            // Test verifyCode
            mockRequestSend.mockClear();
            await whatsApp.phoneNumbers.verifyCode({ code: '123456' });
            const verifyCodeEndpoint = mockRequestSend.mock.calls[0][1];
            expect(verifyCodeEndpoint).toContain(phoneNumberId.toString());
            expect(verifyCodeEndpoint).toContain('/verify_code');
        });

        it('should use business account ID in collection endpoints', async () => {
            const businessAcctId = whatsApp.requester.businessAcctId;

            await whatsApp.phoneNumbers.getPhoneNumbers();
            const endpoint = mockRequestSend.mock.calls[0][1];

            expect(endpoint).toContain(businessAcctId);
            expect(endpoint).toContain('/phone_numbers');
        });

        it('should use correct HTTP methods for each operation', async () => {
            // Test getPhoneNumberById - GET
            await whatsApp.phoneNumbers.getPhoneNumberById();
            expect(mockRequestSend.mock.calls[0][0]).toBe('GET');

            // Test getPhoneNumbers - GET
            mockRequestSend.mockClear();
            await whatsApp.phoneNumbers.getPhoneNumbers();
            expect(mockRequestSend.mock.calls[0][0]).toBe('GET');

            // Test requestVerificationCode - POST
            mockRequestSend.mockClear();
            await whatsApp.phoneNumbers.requestVerificationCode({ code_method: 'SMS', language: 'en_US' });
            expect(mockRequestSend.mock.calls[0][0]).toBe('POST');

            // Test verifyCode - POST
            mockRequestSend.mockClear();
            await whatsApp.phoneNumbers.verifyCode({ code: '123456' });
            expect(mockRequestSend.mock.calls[0][0]).toBe('POST');
        });
    });

    describe('Timeout Configuration', () => {
        it('should use configured timeout for all operations', async () => {
            const expectedTimeout = whatsApp.config.REQUEST_TIMEOUT;

            // Test getPhoneNumberById
            await whatsApp.phoneNumbers.getPhoneNumberById();
            expect(mockRequestSend.mock.calls[0][2]).toBe(expectedTimeout);

            // Test getPhoneNumbers
            mockRequestSend.mockClear();
            await whatsApp.phoneNumbers.getPhoneNumbers();
            expect(mockRequestSend.mock.calls[0][2]).toBe(expectedTimeout);

            // Test requestVerificationCode
            mockRequestSend.mockClear();
            await whatsApp.phoneNumbers.requestVerificationCode({ code_method: 'SMS', language: 'en_US' });
            expect(mockRequestSend.mock.calls[0][2]).toBe(expectedTimeout);

            // Test verifyCode
            mockRequestSend.mockClear();
            await whatsApp.phoneNumbers.verifyCode({ code: '123456' });
            expect(mockRequestSend.mock.calls[0][2]).toBe(expectedTimeout);
        });
    });

    describe('Request Consistency', () => {
        it('should always include required fields in verification code requests', async () => {
            const testCases = [
                { code_method: 'SMS' as const, language: 'en_US' },
                { code_method: 'VOICE' as const, language: 'es_ES' },
                { code_method: 'SMS' as const, language: 'fr_FR' },
                { code_method: 'VOICE' as const, language: 'de_DE' },
            ];

            for (const testCase of testCases) {
                mockRequestSend.mockClear();
                await whatsApp.phoneNumbers.requestVerificationCode(testCase);

                const [_, __, ___, body] = mockRequestSend.mock.calls[0];
                const parsedBody = JSON.parse(body);

                expect(parsedBody).toHaveProperty('code_method', testCase.code_method);
                expect(parsedBody).toHaveProperty('language', testCase.language);
                expect(Object.keys(parsedBody)).toHaveLength(2);
            }
        });

        it('should always include only code field in verify requests', async () => {
            const codes = ['123456', '000000', '999999', 'ABC123'];

            for (const code of codes) {
                mockRequestSend.mockClear();
                await whatsApp.phoneNumbers.verifyCode({ code });

                const [_, __, ___, body] = mockRequestSend.mock.calls[0];
                const parsedBody = JSON.parse(body);

                expect(parsedBody).toHaveProperty('code', code);
                expect(Object.keys(parsedBody)).toHaveLength(1);
            }
        });

        it('should never include body for GET requests', async () => {
            // Test getPhoneNumberById
            await whatsApp.phoneNumbers.getPhoneNumberById();
            expect(mockRequestSend.mock.calls[0][3]).toBeNull();

            // Test getPhoneNumberById with fields
            mockRequestSend.mockClear();
            await whatsApp.phoneNumbers.getPhoneNumberById('display_phone_number');
            expect(mockRequestSend.mock.calls[0][3]).toBeNull();

            // Test getPhoneNumbers
            mockRequestSend.mockClear();
            await whatsApp.phoneNumbers.getPhoneNumbers();
            expect(mockRequestSend.mock.calls[0][3]).toBeNull();
        });
    });

    describe('Endpoint Construction', () => {
        it('should construct correct endpoints for different operations', async () => {
            const phoneNumberId = whatsApp.requester.phoneNumberId;
            const businessAcctId = whatsApp.requester.businessAcctId;

            // Test single resource endpoints
            await whatsApp.phoneNumbers.getPhoneNumberById();
            expect(mockRequestSend.mock.calls[0][1]).toBe(`${phoneNumberId}`);

            mockRequestSend.mockClear();
            await whatsApp.phoneNumbers.requestVerificationCode({ code_method: 'SMS', language: 'en_US' });
            expect(mockRequestSend.mock.calls[0][1]).toBe(`${phoneNumberId}/request_code`);

            mockRequestSend.mockClear();
            await whatsApp.phoneNumbers.verifyCode({ code: '123456' });
            expect(mockRequestSend.mock.calls[0][1]).toBe(`${phoneNumberId}/verify_code`);

            // Test collection endpoint
            mockRequestSend.mockClear();
            await whatsApp.phoneNumbers.getPhoneNumbers();
            expect(mockRequestSend.mock.calls[0][1]).toBe(`${businessAcctId}/phone_numbers`);
        });
    });
});
