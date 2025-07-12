import { WhatsApp } from '@core/whatsapp';

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataLocalizationRegionEnum } from '../../../types';

describe('Registration API - Unit Tests', () => {
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

    describe('Registration Operations', () => {
        it('should register with PIN and correct endpoint and body', async () => {
            const pin = '123456';

            await whatsApp.registration.register(pin);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('POST');
            expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/register`);
            expect(timeout).toBeGreaterThan(0);

            const parsedBody = JSON.parse(body);
            expect(parsedBody).toEqual({
                messaging_product: 'whatsapp',
                pin: '123456',
            });
        });

        it('should register with PIN and data localization region', async () => {
            const pin = '654321';
            const region = DataLocalizationRegionEnum.SG;

            await whatsApp.registration.register(pin, region);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('POST');
            expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/register`);
            expect(timeout).toBeGreaterThan(0);

            const parsedBody = JSON.parse(body);
            expect(parsedBody).toEqual({
                messaging_product: 'whatsapp',
                pin: '654321',
                data_localization_region: 'SG',
            });
        });

        it('should deregister with correct endpoint', async () => {
            await whatsApp.registration.deregister();

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('POST');
            expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/deregister`);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });
    });

    describe('Request Body Structure Validation', () => {
        it('should create correct request body for registration without region', async () => {
            const pin = '111111';

            await whatsApp.registration.register(pin);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody).toHaveProperty('messaging_product', 'whatsapp');
            expect(parsedBody).toHaveProperty('pin', '111111');
            expect(parsedBody).not.toHaveProperty('data_localization_region');
        });

        it('should create correct request body for registration with EU region', async () => {
            const pin = '222222';
            const region = DataLocalizationRegionEnum.DE;

            await whatsApp.registration.register(pin, region);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody).toHaveProperty('messaging_product', 'whatsapp');
            expect(parsedBody).toHaveProperty('pin', '222222');
            expect(parsedBody).toHaveProperty('data_localization_region', 'DE');
        });

        it('should create correct request body for registration with APAC region', async () => {
            const pin = '333333';
            const region = DataLocalizationRegionEnum.AU;

            await whatsApp.registration.register(pin, region);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody).toHaveProperty('messaging_product', 'whatsapp');
            expect(parsedBody).toHaveProperty('pin', '333333');
            expect(parsedBody).toHaveProperty('data_localization_region', 'AU');
        });

        it('should create correct request body for registration with LATAM region', async () => {
            const pin = '444444';
            const region = DataLocalizationRegionEnum.BR;

            await whatsApp.registration.register(pin, region);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody).toHaveProperty('messaging_product', 'whatsapp');
            expect(parsedBody).toHaveProperty('pin', '444444');
            expect(parsedBody).toHaveProperty('data_localization_region', 'BR');
        });

        it('should create correct request body for registration with MEA region', async () => {
            const pin = '555555';
            const region = DataLocalizationRegionEnum.AE;

            await whatsApp.registration.register(pin, region);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody).toHaveProperty('messaging_product', 'whatsapp');
            expect(parsedBody).toHaveProperty('pin', '555555');
            expect(parsedBody).toHaveProperty('data_localization_region', 'AE');
        });

        it('should create correct request body for registration with NORAM region', async () => {
            const pin = '666666';
            const region = DataLocalizationRegionEnum.CA;

            await whatsApp.registration.register(pin, region);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody).toHaveProperty('messaging_product', 'whatsapp');
            expect(parsedBody).toHaveProperty('pin', '666666');
            expect(parsedBody).toHaveProperty('data_localization_region', 'CA');
        });

        it('should handle numeric PIN strings correctly', async () => {
            const pin = '000000';

            await whatsApp.registration.register(pin);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody.pin).toBe('000000');
            expect(typeof parsedBody.pin).toBe('string');
        });

        it('should handle alphanumeric PINs correctly', async () => {
            const pin = 'ABC123';

            await whatsApp.registration.register(pin);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody.pin).toBe('ABC123');
            expect(typeof parsedBody.pin).toBe('string');
        });
    });

    describe('Data Localization Region Coverage', () => {
        it('should handle all APAC regions', async () => {
            const apacRegions = [
                DataLocalizationRegionEnum.AU,
                DataLocalizationRegionEnum.ID,
                DataLocalizationRegionEnum.IN,
                DataLocalizationRegionEnum.JP,
                DataLocalizationRegionEnum.SG,
                DataLocalizationRegionEnum.KR,
            ];

            for (const region of apacRegions) {
                mockRequestSend.mockClear();
                await whatsApp.registration.register('123456', region);

                const [_, __, ___, body] = mockRequestSend.mock.calls[0];
                const parsedBody = JSON.parse(body);

                expect(parsedBody).toHaveProperty('data_localization_region', region);
            }
        });

        it('should handle all Europe regions', async () => {
            const europeRegions = [
                DataLocalizationRegionEnum.DE,
                DataLocalizationRegionEnum.CH,
                DataLocalizationRegionEnum.GB,
            ];

            for (const region of europeRegions) {
                mockRequestSend.mockClear();
                await whatsApp.registration.register('123456', region);

                const [_, __, ___, body] = mockRequestSend.mock.calls[0];
                const parsedBody = JSON.parse(body);

                expect(parsedBody).toHaveProperty('data_localization_region', region);
            }
        });

        it('should handle all MEA regions', async () => {
            const meaRegions = [
                DataLocalizationRegionEnum.BH,
                DataLocalizationRegionEnum.ZA,
                DataLocalizationRegionEnum.AE,
            ];

            for (const region of meaRegions) {
                mockRequestSend.mockClear();
                await whatsApp.registration.register('123456', region);

                const [_, __, ___, body] = mockRequestSend.mock.calls[0];
                const parsedBody = JSON.parse(body);

                expect(parsedBody).toHaveProperty('data_localization_region', region);
            }
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully for register operation', async () => {
            mockRequestSend.mockRejectedValue(new Error('API Error: Registration failed'));

            await expect(whatsApp.registration.register('123456')).rejects.toThrow('API Error: Registration failed');
        });

        it('should handle API errors gracefully for register with region operation', async () => {
            mockRequestSend.mockRejectedValue(new Error('API Error: Registration with region failed'));

            await expect(whatsApp.registration.register('123456', DataLocalizationRegionEnum.CA)).rejects.toThrow(
                'API Error: Registration with region failed',
            );
        });

        it('should handle API errors gracefully for deregister operation', async () => {
            mockRequestSend.mockRejectedValue(new Error('API Error: Deregistration failed'));

            await expect(whatsApp.registration.deregister()).rejects.toThrow('API Error: Deregistration failed');
        });

        it('should handle network timeout errors', async () => {
            mockRequestSend.mockRejectedValue(new Error('Network timeout'));

            await expect(whatsApp.registration.register('123456')).rejects.toThrow('Network timeout');
            await expect(whatsApp.registration.deregister()).rejects.toThrow('Network timeout');
        });

        it('should handle invalid PIN format errors', async () => {
            mockRequestSend.mockRejectedValue(new Error('Invalid PIN format'));

            await expect(whatsApp.registration.register('invalid_pin')).rejects.toThrow('Invalid PIN format');
        });
    });

    describe('API Integration', () => {
        it('should be accessible through WhatsApp instance', () => {
            expect(whatsApp.registration).toBeDefined();
            expect(typeof whatsApp.registration.register).toBe('function');
            expect(typeof whatsApp.registration.deregister).toBe('function');
        });

        it('should use consistent endpoint for registration operations', async () => {
            const baseEndpoint = `${whatsApp.requester.phoneNumberId}`;

            // Test register operation
            await whatsApp.registration.register('123456');
            const registerEndpoint = mockRequestSend.mock.calls[0][1];
            expect(registerEndpoint).toBe(`${baseEndpoint}/register`);

            // Test deregister operation
            mockRequestSend.mockClear();
            await whatsApp.registration.deregister();
            const deregisterEndpoint = mockRequestSend.mock.calls[0][1];
            expect(deregisterEndpoint).toBe(`${baseEndpoint}/deregister`);
        });

        it('should use correct HTTP methods for each operation', async () => {
            // Test register - POST
            await whatsApp.registration.register('123456');
            expect(mockRequestSend.mock.calls[0][0]).toBe('POST');

            // Test register with region - POST
            mockRequestSend.mockClear();
            await whatsApp.registration.register('123456', DataLocalizationRegionEnum.SG);
            expect(mockRequestSend.mock.calls[0][0]).toBe('POST');

            // Test deregister - POST
            mockRequestSend.mockClear();
            await whatsApp.registration.deregister();
            expect(mockRequestSend.mock.calls[0][0]).toBe('POST');
        });

        it('should use phone number ID in endpoint construction', async () => {
            const phoneNumberId = whatsApp.requester.phoneNumberId;

            await whatsApp.registration.register('123456');
            const registerEndpoint = mockRequestSend.mock.calls[0][1];
            expect(registerEndpoint).toContain(phoneNumberId.toString());

            mockRequestSend.mockClear();
            await whatsApp.registration.deregister();
            const deregisterEndpoint = mockRequestSend.mock.calls[0][1];
            expect(deregisterEndpoint).toContain(phoneNumberId.toString());
        });
    });

    describe('Timeout Configuration', () => {
        it('should use configured timeout for all operations', async () => {
            const expectedTimeout = whatsApp.config.REQUEST_TIMEOUT;

            // Test register operation
            await whatsApp.registration.register('123456');
            expect(mockRequestSend.mock.calls[0][2]).toBe(expectedTimeout);

            // Test register with region operation
            mockRequestSend.mockClear();
            await whatsApp.registration.register('123456', DataLocalizationRegionEnum.SG);
            expect(mockRequestSend.mock.calls[0][2]).toBe(expectedTimeout);

            // Test deregister operation
            mockRequestSend.mockClear();
            await whatsApp.registration.deregister();
            expect(mockRequestSend.mock.calls[0][2]).toBe(expectedTimeout);
        });
    });

    describe('Request Consistency', () => {
        it('should always include messaging_product in registration requests', async () => {
            const testCases = [
                { pin: '123456', region: undefined },
                { pin: '654321', region: DataLocalizationRegionEnum.SG },
                { pin: '111111', region: DataLocalizationRegionEnum.DE },
                { pin: '999999', region: DataLocalizationRegionEnum.CA },
            ];

            for (const testCase of testCases) {
                mockRequestSend.mockClear();
                await whatsApp.registration.register(testCase.pin, testCase.region);

                const [_, __, ___, body] = mockRequestSend.mock.calls[0];
                const parsedBody = JSON.parse(body);

                expect(parsedBody).toHaveProperty('messaging_product', 'whatsapp');
                expect(parsedBody).toHaveProperty('pin', testCase.pin);

                if (testCase.region) {
                    expect(parsedBody).toHaveProperty('data_localization_region', testCase.region);
                } else {
                    expect(parsedBody).not.toHaveProperty('data_localization_region');
                }
            }
        });

        it('should never include body for deregister requests', async () => {
            // Test multiple deregister calls to ensure consistency
            for (let i = 0; i < 3; i++) {
                mockRequestSend.mockClear();
                await whatsApp.registration.deregister();

                const [_, __, ___, body] = mockRequestSend.mock.calls[0];
                expect(body).toBeNull();
            }
        });
    });
});
