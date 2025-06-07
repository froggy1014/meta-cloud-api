import { beforeEach, describe, expect, it, vi } from 'vitest';
import WhatsApp from '../../whatsapp';
import { WabaAccountFields } from '../types/common';

describe('WABA API - Unit Tests', () => {
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
            id: 'test_business_id',
            name: 'Test Business',
            account_review_status: 'APPROVED',
            status: 'ACTIVE',
            business_verification_status: 'verified',
        });
    });

    describe('WABA Account Operations', () => {
        it('should get WABA account with correct endpoint', async () => {
            await whatsApp.waba.getWabaAccount();

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('GET');
            expect(endpoint).toBe(whatsApp.config.WA_BUSINESS_ACCOUNT_ID);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });

        it('should get WABA account with specific fields', async () => {
            const fields: WabaAccountFields[] = ['id', 'name', 'status'];

            await whatsApp.waba.getWabaAccount(fields);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint] = mockRequestSend.mock.calls[0];

            expect(method).toBe('GET');
            expect(endpoint).toContain(whatsApp.config.WA_BUSINESS_ACCOUNT_ID);
            expect(endpoint).toContain('id%2Cname%2Cstatus');
        });

        it('should get all WABA subscriptions', async () => {
            mockRequestSend.mockResolvedValue({
                data: [
                    {
                        whatsapp_business_api_data: {
                            id: 'app_123',
                            link: 'https://example.com',
                            name: 'Test App',
                            category: 'BUSINESS',
                        },
                    },
                ],
            });

            await whatsApp.waba.getAllWabaSubscriptions();

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('GET');
            expect(endpoint).toBe(`${whatsApp.config.WA_BUSINESS_ACCOUNT_ID}/subscribed_apps`);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });

        it('should update WABA subscription with correct body', async () => {
            const updateParams = {
                override_callback_uri: 'https://example.com/webhook',
                verify_token: 'test_verify_token',
            };

            mockRequestSend.mockResolvedValue({ success: true });

            await whatsApp.waba.updateWabaSubscription(updateParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('POST');
            expect(endpoint).toBe(`${whatsApp.config.WA_BUSINESS_ACCOUNT_ID}/subscribed_apps`);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBe(JSON.stringify(updateParams));
        });

        it('should unsubscribe from WABA', async () => {
            mockRequestSend.mockResolvedValue({ success: true });

            await whatsApp.waba.unsubscribeFromWaba();

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('DELETE');
            expect(endpoint).toBe(`${whatsApp.config.WA_BUSINESS_ACCOUNT_ID}/subscribed_apps`);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });
    });

    describe('Request Body Structure Validation', () => {
        it('should create correct subscription update body', async () => {
            const subscriptionData = {
                override_callback_uri: 'https://myapp.com/webhook',
                verify_token: 'my_verify_token_123',
            };

            await whatsApp.waba.updateWabaSubscription(subscriptionData);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody.override_callback_uri).toBe(subscriptionData.override_callback_uri);
            expect(parsedBody.verify_token).toBe(subscriptionData.verify_token);
        });

        it('should handle URL encoding in fields query', async () => {
            const fields: WabaAccountFields[] = ['id', 'name', 'account_review_status', 'business_verification_status'];

            await whatsApp.waba.getWabaAccount(fields);

            const [_, endpoint] = mockRequestSend.mock.calls[0];

            // Should encode commas as %2C
            expect(endpoint).toContain('%2C');
            expect(endpoint).toContain('id%2Cname%2Caccount_review_status%2Cbusiness_verification_status');
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully when getting account', async () => {
            mockRequestSend.mockRejectedValue(new Error('API Error: Account not found'));

            await expect(whatsApp.waba.getWabaAccount()).rejects.toThrow('API Error: Account not found');
        });

        it('should handle subscription retrieval errors', async () => {
            mockRequestSend.mockRejectedValue(new Error('Failed to get subscriptions'));

            await expect(whatsApp.waba.getAllWabaSubscriptions()).rejects.toThrow('Failed to get subscriptions');
        });

        it('should handle subscription update errors', async () => {
            mockRequestSend.mockRejectedValue(new Error('Update failed'));

            const updateParams = {
                override_callback_uri: 'https://example.com/webhook',
                verify_token: 'test_token',
            };

            await expect(whatsApp.waba.updateWabaSubscription(updateParams)).rejects.toThrow('Update failed');
        });

        it('should handle unsubscribe errors', async () => {
            mockRequestSend.mockRejectedValue(new Error('Unsubscribe failed'));

            await expect(whatsApp.waba.unsubscribeFromWaba()).rejects.toThrow('Unsubscribe failed');
        });
    });

    describe('API Integration', () => {
        it('should be accessible through WhatsApp instance', () => {
            expect(whatsApp.waba).toBeDefined();
            expect(typeof whatsApp.waba.getWabaAccount).toBe('function');
            expect(typeof whatsApp.waba.getAllWabaSubscriptions).toBe('function');
            expect(typeof whatsApp.waba.updateWabaSubscription).toBe('function');
            expect(typeof whatsApp.waba.unsubscribeFromWaba).toBe('function');
        });

        it('should use consistent business account ID in endpoints', async () => {
            const businessAcctId = whatsApp.config.WA_BUSINESS_ACCOUNT_ID;

            // Test different operations to ensure endpoint consistency
            await whatsApp.waba.getWabaAccount();
            const accountEndpoint = mockRequestSend.mock.calls[0][1];

            mockRequestSend.mockClear();
            await whatsApp.waba.getAllWabaSubscriptions();
            const subscriptionsEndpoint = mockRequestSend.mock.calls[0][1];

            expect(accountEndpoint).toBe(businessAcctId);
            expect(subscriptionsEndpoint).toBe(`${businessAcctId}/subscribed_apps`);
        });

        it('should handle empty fields array', async () => {
            await whatsApp.waba.getWabaAccount([]);

            const [_, endpoint] = mockRequestSend.mock.calls[0];
            expect(endpoint).toBe(whatsApp.config.WA_BUSINESS_ACCOUNT_ID);
        });

        it('should handle undefined fields parameter', async () => {
            await whatsApp.waba.getWabaAccount(undefined);

            const [_, endpoint] = mockRequestSend.mock.calls[0];
            expect(endpoint).toBe(whatsApp.config.WA_BUSINESS_ACCOUNT_ID);
        });
    });

    describe('Response Structure Validation', () => {
        it('should return proper WABA account structure', async () => {
            const mockAccount = {
                id: 'test_business_123',
                name: 'Test Business Account',
                account_review_status: 'APPROVED',
                status: 'ACTIVE',
                business_verification_status: 'verified',
                health_status: {
                    can_send_message: 'AVAILABLE',
                    entities: [],
                },
            };

            mockRequestSend.mockResolvedValue(mockAccount);

            const result = await whatsApp.waba.getWabaAccount();

            expect(result).toEqual(mockAccount);
            expect(result.id).toBe('test_business_123');
            expect(result.account_review_status).toBe('APPROVED');
        });

        it('should return proper subscriptions structure', async () => {
            const mockSubscriptions = {
                data: [
                    {
                        whatsapp_business_api_data: {
                            id: 'app_123',
                            link: 'https://example.com',
                            name: 'Test App',
                            category: 'BUSINESS',
                        },
                        override_callback_uri: 'https://webhook.example.com',
                    },
                ],
            };

            mockRequestSend.mockResolvedValue(mockSubscriptions);

            const result = await whatsApp.waba.getAllWabaSubscriptions();

            expect(result).toEqual(mockSubscriptions);
            expect(result.data).toHaveLength(1);
            expect(result.data[0]?.whatsapp_business_api_data?.id).toBe('app_123');
        });

        it('should return success response for subscription operations', async () => {
            const mockResponse = { success: true };
            mockRequestSend.mockResolvedValue(mockResponse);

            const updateResult = await whatsApp.waba.updateWabaSubscription({
                override_callback_uri: 'https://example.com/webhook',
                verify_token: 'test_token',
            });

            expect(updateResult).toEqual(mockResponse);

            mockRequestSend.mockClear();
            mockRequestSend.mockResolvedValue(mockResponse);

            const unsubscribeResult = await whatsApp.waba.unsubscribeFromWaba();

            expect(unsubscribeResult).toEqual(mockResponse);
        });
    });
});
