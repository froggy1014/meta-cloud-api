import { describe, it, expect, vi, beforeEach } from 'vitest';
import { expressWebhookHandler } from '../express';
import type { ExpressWebhookConfig, ExpressRequest, ExpressResponse, NextFunction } from '../express';
import {
    mockWebhookConfig,
    createMockExpressRequest,
    createMockExpressResponse,
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

describe('Express Webhook Handler', () => {
    const mockConfig: ExpressWebhookConfig = {
        ...mockWebhookConfig,
        path: '/webhook',
    };

    let handler: ReturnType<typeof expressWebhookHandler>;
    let mockReq: ExpressRequest;
    let mockRes: ExpressResponse;
    let mockNext: NextFunction;

    beforeEach(() => {
        vi.clearAllMocks();
        handler = expressWebhookHandler(mockConfig);
        mockReq = createMockExpressRequest();
        mockRes = createMockExpressResponse() as any;
        mockNext = vi.fn();
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

            await handler.webhook(mockReq, mockRes, mockNext);

            expect(handler.processor.processVerification).toHaveBeenCalledWith(
                webhookVerificationData.mode,
                webhookVerificationData.token,
                webhookVerificationData.challenge,
            );
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith(webhookVerificationData.challenge);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should handle verification errors by calling next', async () => {
            mockReq.method = 'GET';
            mockReq.query = {
                'hub.mode': 'subscribe',
                'hub.verify_token': 'wrong-token',
                'hub.challenge': 'test-challenge',
            };

            handler.processor.processVerification = vi.fn().mockRejectedValue(errorScenarios.verification);

            await handler.webhook(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(errorScenarios.verification);
            expect(mockRes.status).not.toHaveBeenCalled();
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

            await handler.webhook(mockReq, mockRes, mockNext);

            expect(handler.processor.processWebhook).toHaveBeenCalled();
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should handle webhook processing errors by calling next', async () => {
            mockReq.method = 'POST';
            mockReq.body = webhookProcessingData.webhookPayload;

            handler.processor.processWebhook = vi.fn().mockRejectedValue(errorScenarios.processing);

            await handler.webhook(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(errorScenarios.processing);
            expect(mockRes.status).not.toHaveBeenCalled();
        });

        it('should handle unsupported methods', async () => {
            mockReq.method = 'PUT';

            await handler.webhook(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(405);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Method Not Allowed' });
            expect(mockNext).not.toHaveBeenCalled();
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

            await handler.GET(mockReq, mockRes, mockNext);

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

            await handler.POST(mockReq, mockRes, mockNext);

            expect(handler.processor.processWebhook).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    describe('flow handler', () => {
        it('should handle flow requests successfully', async () => {
            mockReq.method = 'POST';
            mockReq.body = flowProcessingData.flowPayload;

            handler.processor.processFlow = vi.fn().mockResolvedValue(flowProcessingData.successResponse);

            await handler.flow(mockReq, mockRes, mockNext);

            expect(handler.processor.processFlow).toHaveBeenCalled();
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should handle flow processing errors by calling next', async () => {
            mockReq.method = 'POST';
            mockReq.body = flowProcessingData.flowPayload;

            handler.processor.processFlow = vi.fn().mockRejectedValue(errorScenarios.flow);

            await handler.flow(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(errorScenarios.flow);
            expect(mockRes.status).not.toHaveBeenCalled();
        });
    });
});
