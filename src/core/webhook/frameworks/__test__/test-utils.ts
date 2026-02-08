import { expect, vi } from 'vitest';

/**
 * Common test configuration used across all webhook handler tests
 */
export const mockWebhookConfig = {
    accessToken: 'test-token',
    phoneNumberId: 123456789,
    webhookVerificationToken: 'test-verify-token',
};

/**
 * Mock WebhookProcessor factory for consistent mocking across tests
 */
export const createMockWebhookProcessor = () => ({
    processVerification: vi.fn(),
    processWebhook: vi.fn(),
    processFlow: vi.fn(),
});

/**
 * Common test data for webhook verification
 */
export const webhookVerificationData = {
    mode: 'subscribe',
    token: 'test-verify-token',
    challenge: 'test-challenge-123',
    successResponse: {
        status: 200,
        body: 'test-challenge-123',
        headers: { 'Content-Type': 'text/plain' },
    },
};

/**
 * Common test data for webhook processing
 */
export const webhookProcessingData = {
    webhookPayload: {
        object: 'whatsapp_business_account',
        entry: [
            {
                id: 'entry-id',
                changes: [
                    {
                        value: {
                            messaging_product: 'whatsapp',
                            messages: [
                                {
                                    id: 'msg-id',
                                    from: '1234567890',
                                    timestamp: '1234567890',
                                    text: { body: 'Hello' },
                                    type: 'text',
                                },
                            ],
                        },
                        field: 'messages',
                    },
                ],
            },
        ],
    },
    successResponse: {
        status: 200,
        body: { status: 'ok' },
        headers: { 'Content-Type': 'application/json' },
    },
};

/**
 * Common test data for flow processing
 */
export const flowProcessingData = {
    flowPayload: {
        version: '3.0',
        screen: 'SCREEN_1',
        data: { key: 'value' },
    },
    successResponse: {
        status: 200,
        body: { screen: 'SCREEN_2', data: {} },
        headers: { 'Content-Type': 'application/json' },
    },
};

/**
 * Error scenarios for testing error handling
 */
export const errorScenarios = {
    verification: new Error('Verification failed'),
    processing: new Error('Processing failed'),
    flow: new Error('Flow processing failed'),
};

/**
 * Creates a mock Express request object
 */
export const createMockExpressRequest = (overrides: Partial<any> = {}) => ({
    method: 'GET',
    url: '/webhook',
    headers: { host: 'example.com' },
    body: {},
    query: {},
    ...overrides,
});

/**
 * Creates a mock Express response object with chainable methods
 */
export const createMockExpressResponse = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    setHeader: vi.fn(),
});

/**
 * Creates a mock Next.js API request object
 */
export const createMockNextApiRequest = (overrides: Partial<any> = {}) => ({
    method: 'GET',
    url: '/api/webhook',
    headers: { host: 'example.com' },
    body: {},
    query: {},
    ...overrides,
});

/**
 * Creates a mock Next.js API response object
 */
export const createMockNextApiResponse = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    send: vi.fn(),
    setHeader: vi.fn(),
});

/**
 * Creates a mock Next.js App Router Request object
 */
export const createMockAppRouterRequest = (url: string = 'https://example.com/webhook') => {
    return new Request(url);
};

/**
 * Common test suite for webhook verification functionality
 * Can be reused across different framework tests
 */
export const createWebhookVerificationTests = (
    getHandler: () => any,
    testConfig: {
        framework: 'express' | 'nextjs' | 'nextjs-app';
        callHandler: (handler: any, req: any, res?: any, next?: any) => Promise<any>;
        setupRequest: (query: Record<string, string>) => any;
        setupResponse?: () => any;
    },
) => {
    return {
        'should handle webhook verification successfully': async () => {
            const handler = getHandler();
            const req = testConfig.setupRequest({
                'hub.mode': webhookVerificationData.mode,
                'hub.verify_token': webhookVerificationData.token,
                'hub.challenge': webhookVerificationData.challenge,
            });
            const res = testConfig.setupResponse?.();

            handler.processor.processVerification = vi.fn().mockResolvedValue(webhookVerificationData.successResponse);

            await testConfig.callHandler(handler, req, res);

            expect(handler.processor.processVerification).toHaveBeenCalledWith(
                webhookVerificationData.mode,
                webhookVerificationData.token,
                webhookVerificationData.challenge,
            );
        },

        'should handle verification errors': async () => {
            const handler = getHandler();
            const req = testConfig.setupRequest({
                'hub.mode': 'subscribe',
                'hub.verify_token': 'wrong-token',
                'hub.challenge': 'test-challenge',
            });
            const res = testConfig.setupResponse?.();

            handler.processor.processVerification = vi.fn().mockRejectedValue(errorScenarios.verification);

            await testConfig.callHandler(handler, req, res);

            expect(handler.processor.processVerification).toHaveBeenCalled();
        },
    };
};

/**
 * Common test suite for webhook processing functionality
 */
export const createWebhookProcessingTests = (
    getHandler: () => any,
    testConfig: {
        framework: 'express' | 'nextjs' | 'nextjs-app';
        callHandler: (handler: any, req: any, res?: any, next?: any) => Promise<any>;
        setupRequest: (body: any, method?: string) => any;
        setupResponse?: () => any;
    },
) => {
    return {
        'should handle webhook processing successfully': async () => {
            const handler = getHandler();
            const req = testConfig.setupRequest(webhookProcessingData.webhookPayload, 'POST');
            const res = testConfig.setupResponse?.();

            handler.processor.processWebhook = vi.fn().mockResolvedValue(webhookProcessingData.successResponse);

            await testConfig.callHandler(handler, req, res);

            expect(handler.processor.processWebhook).toHaveBeenCalled();
        },

        'should handle processing errors': async () => {
            const handler = getHandler();
            const req = testConfig.setupRequest(webhookProcessingData.webhookPayload, 'POST');
            const res = testConfig.setupResponse?.();

            handler.processor.processWebhook = vi.fn().mockRejectedValue(errorScenarios.processing);

            await testConfig.callHandler(handler, req, res);

            expect(handler.processor.processWebhook).toHaveBeenCalled();
        },
    };
};

/**
 * Common test suite for flow processing functionality
 */
export const createFlowProcessingTests = (
    getHandler: () => any,
    testConfig: {
        framework: 'express' | 'nextjs' | 'nextjs-app';
        callHandler: (handler: any, req: any, res?: any, next?: any) => Promise<any>;
        setupRequest: (body: any, method?: string) => any;
        setupResponse?: () => any;
    },
) => {
    return {
        'should handle flow processing successfully': async () => {
            const handler = getHandler();
            const req = testConfig.setupRequest(flowProcessingData.flowPayload, 'POST');
            const res = testConfig.setupResponse?.();

            handler.processor.processFlow = vi.fn().mockResolvedValue(flowProcessingData.successResponse);

            await testConfig.callHandler(handler, req, res);

            expect(handler.processor.processFlow).toHaveBeenCalled();
        },

        'should handle flow processing errors': async () => {
            const handler = getHandler();
            const req = testConfig.setupRequest(flowProcessingData.flowPayload, 'POST');
            const res = testConfig.setupResponse?.();

            handler.processor.processFlow = vi.fn().mockRejectedValue(errorScenarios.flow);

            await testConfig.callHandler(handler, req, res);

            expect(handler.processor.processFlow).toHaveBeenCalled();
        },
    };
};
