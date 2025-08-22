import { describe, it, expect, vi, beforeEach } from 'vitest';
import { webhookHandler } from '../nextjs';
import type { NextJsWebhookConfig, BaseApiRequest, BaseApiResponse } from '../nextjs';
import {
    mockWebhookConfig,
    createMockNextApiRequest,
    createMockNextApiResponse,
    webhookVerificationData,
    webhookProcessingData,
    flowProcessingData,
    errorScenarios,
} from './test-utils';

// Mock the WebhookProcessor
vi.mock('../../WebhookProcessor', () => ({
    WebhookProcessor: vi.fn().mockImplementation(() => ({
        processVerification: vi.fn(),
        processWebhook: vi.fn(),
        processFlow: vi.fn(),
    })),
}));

describe('Next.js Page Router Webhook Handler', () => {
    const mockConfig: NextJsWebhookConfig = mockWebhookConfig;

    let handler: ReturnType<typeof webhookHandler>;
    let mockReq: BaseApiRequest;
    let mockRes: BaseApiResponse;

    beforeEach(() => {
        vi.clearAllMocks();
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
            expect(typeof handler.GET).toBe('function');
            expect(typeof handler.POST).toBe('function');
            expect(typeof handler.webhook).toBe('function');
            expect(typeof handler.flow).toBe('function');
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
