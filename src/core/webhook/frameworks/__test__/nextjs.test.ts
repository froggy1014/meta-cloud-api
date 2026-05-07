import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BaseApiRequest, BaseApiResponse, NextJsWebhookConfig } from '../nextjs';
import { webhookHandler } from '../nextjs';
import {
    createMockNextApiRequest,
    createMockNextApiResponse,
    errorScenarios,
    flowProcessingData,
    mockWebhookConfig,
    webhookProcessingData,
    webhookVerificationData,
} from './test-utils';

// Mock the WebhookProcessor
vi.mock('../../WebhookProcessor', () => ({
    WebhookProcessor: vi.fn().mockImplementation(() => ({
        processVerification: vi.fn(),
        processWebhook: vi.fn(),
        processFlow: vi.fn(),
        removeAllHandlers: vi.fn(),
    })),
}));

describe('Next.js Page Router Webhook Handler', () => {
    const mockConfig: NextJsWebhookConfig = mockWebhookConfig;

    let handler: ReturnType<typeof webhookHandler>;
    let mockReq: BaseApiRequest;
    let mockRes: BaseApiResponse;

    beforeEach(() => {
        vi.clearAllMocks();
        // Destroy cached handler to ensure fresh instance per test
        handler?.destroy?.();
        handler = webhookHandler(mockConfig);
        mockReq = createMockNextApiRequest();
        mockRes = createMockNextApiResponse();
    });

    describe('handler structure', () => {
        it('should return expected handler methods', () => {
            expect(handler).toHaveProperty('GET');
            expect(handler).toHaveProperty('POST');
            expect(handler).toHaveProperty('webhook');
            expect(handler).toHaveProperty('flow');
            expect(handler).toHaveProperty('processor');
            expect(handler).toHaveProperty('destroy');
            expect(typeof handler.GET).toBe('function');
            expect(typeof handler.POST).toBe('function');
            expect(typeof handler.webhook).toBe('function');
            expect(typeof handler.flow).toBe('function');
            expect(typeof handler.destroy).toBe('function');
        });
    });

    describe('singleton caching', () => {
        it('should return the same instance for the same config', () => {
            const handler2 = webhookHandler(mockConfig);
            expect(handler2).toBe(handler);
        });

        it('should return a different instance for a different phoneNumberId', () => {
            const differentConfig = { ...mockConfig, phoneNumberId: 999999999 };
            const handler2 = webhookHandler(differentConfig);
            expect(handler2).not.toBe(handler);
            handler2.destroy();
        });

        it('should return a fresh instance after destroy()', () => {
            handler.destroy();
            const handler2 = webhookHandler(mockConfig);
            expect(handler2).not.toBe(handler);
            handler = handler2;
        });

        it('should call removeAllHandlers on destroy()', () => {
            const removeAllHandlers = handler.processor.removeAllHandlers;
            handler.destroy();
            expect(removeAllHandlers).toHaveBeenCalled();
            handler = webhookHandler(mockConfig);
        });
    });

    describe('webhook handler - GET (verification)', () => {
        it('should handle GET webhook verification successfully', async () => {
            mockReq.method = 'GET';
            mockReq.query = {
                'hub.mode': webhookVerificationData.mode,
                'hub.verify_token': webhookVerificationData.token,
                'hub.challenge': webhookVerificationData.challenge,
            };

            handler.processor.processVerification = vi.fn().mockResolvedValue(webhookVerificationData.successResponse);

            await handler.webhook(mockReq, mockRes);

            expect(handler.processor.processVerification).toHaveBeenCalledWith(
                webhookVerificationData.mode,
                webhookVerificationData.token,
                webhookVerificationData.challenge,
            );
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith(webhookVerificationData.challenge);
        });

        it('should handle verification errors gracefully', async () => {
            mockReq.method = 'GET';
            mockReq.query = {
                'hub.mode': 'subscribe',
                'hub.verify_token': 'wrong-token',
                'hub.challenge': 'test-challenge',
            };

            handler.processor.processVerification = vi.fn().mockRejectedValue(errorScenarios.verification);

            await handler.webhook(mockReq, mockRes);

            expect(handler.processor.processVerification).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });
    });

    describe('webhook handler - POST (processing)', () => {
        it('should handle POST webhook processing successfully', async () => {
            mockReq.method = 'POST';
            mockReq.body = webhookProcessingData.webhookPayload;
            mockReq.headers = {
                host: 'example.com',
                'content-type': 'application/json',
            };

            handler.processor.processWebhook = vi.fn().mockResolvedValue(webhookProcessingData.successResponse);

            await handler.webhook(mockReq, mockRes);

            expect(handler.processor.processWebhook).toHaveBeenCalled();
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it('should preserve raw body when creating the webhook request', async () => {
            const rawBody = JSON.stringify(webhookProcessingData.webhookPayload);
            mockReq.method = 'POST';
            mockReq.body = { parsed: true };
            mockReq.rawBody = rawBody;
            mockReq.headers = {
                host: 'example.com',
                'content-type': 'application/json',
            };

            handler.processor.processWebhook = vi.fn().mockResolvedValue(webhookProcessingData.successResponse);

            await handler.webhook(mockReq, mockRes);

            const webRequest = (handler.processor.processWebhook as any).mock.calls[0][0] as Request;

            expect(await webRequest.text()).toBe(rawBody);
        });

        it('should handle webhook processing errors gracefully', async () => {
            mockReq.method = 'POST';
            mockReq.body = webhookProcessingData.webhookPayload;

            handler.processor.processWebhook = vi.fn().mockRejectedValue(errorScenarios.processing);

            await handler.webhook(mockReq, mockRes);

            expect(handler.processor.processWebhook).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });

        it('should handle JSON parsing errors', async () => {
            mockReq.method = 'POST';
            mockReq.body = undefined;
            // Mock the parseRequestBody to throw an error
            (mockReq as any)[Symbol.asyncIterator] = function* () {
                yield Buffer.from('invalid json{');
            };

            await handler.webhook(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid JSON' });
        });

        it('should handle unsupported methods', async () => {
            mockReq.method = 'PUT';

            await handler.webhook(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(405);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Method Not Allowed' });
        });
    });

    describe('direct GET handler', () => {
        it('should handle GET requests directly', async () => {
            mockReq.method = 'GET';
            mockReq.query = {
                'hub.mode': webhookVerificationData.mode,
                'hub.verify_token': webhookVerificationData.token,
                'hub.challenge': webhookVerificationData.challenge,
            };

            handler.processor.processVerification = vi.fn().mockResolvedValue(webhookVerificationData.successResponse);

            await handler.GET(mockReq, mockRes);

            expect(handler.processor.processVerification).toHaveBeenCalledWith(
                webhookVerificationData.mode,
                webhookVerificationData.token,
                webhookVerificationData.challenge,
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    describe('direct POST handler', () => {
        it('should handle POST requests directly', async () => {
            mockReq.method = 'POST';
            mockReq.body = webhookProcessingData.webhookPayload;

            handler.processor.processWebhook = vi.fn().mockResolvedValue(webhookProcessingData.successResponse);

            await handler.POST(mockReq, mockRes);

            expect(handler.processor.processWebhook).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    describe('flow handler', () => {
        it('should handle flow requests successfully', async () => {
            mockReq.method = 'POST';
            mockReq.body = flowProcessingData.flowPayload;

            handler.processor.processFlow = vi.fn().mockResolvedValue(flowProcessingData.successResponse);

            await handler.flow(mockReq, mockRes);

            expect(handler.processor.processFlow).toHaveBeenCalled();
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it('should handle flow processing errors gracefully', async () => {
            mockReq.method = 'POST';
            mockReq.body = flowProcessingData.flowPayload;

            handler.processor.processFlow = vi.fn().mockRejectedValue(errorScenarios.flow);

            await handler.flow(mockReq, mockRes);

            expect(handler.processor.processFlow).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });
    });

    describe('body parsing functionality', () => {
        it('should parse request body for POST requests without existing body', async () => {
            mockReq.method = 'POST';
            mockReq.body = undefined;
            (mockReq as any)[Symbol.asyncIterator] = function* () {
                yield Buffer.from(JSON.stringify(webhookProcessingData.webhookPayload));
            };

            handler.processor.processWebhook = vi.fn().mockResolvedValue(webhookProcessingData.successResponse);

            await handler.POST(mockReq, mockRes);

            expect(mockReq.body).toEqual(webhookProcessingData.webhookPayload);
            expect(handler.processor.processWebhook).toHaveBeenCalled();
        });

        it('should handle empty body gracefully', async () => {
            mockReq.method = 'POST';
            mockReq.body = undefined;
            (mockReq as any)[Symbol.asyncIterator] = function* () {
                yield Buffer.from('');
            };

            handler.processor.processWebhook = vi.fn().mockResolvedValue(webhookProcessingData.successResponse);

            await handler.POST(mockReq, mockRes);

            expect(mockReq.body).toEqual({});
            expect(handler.processor.processWebhook).toHaveBeenCalled();
        });
    });
});
