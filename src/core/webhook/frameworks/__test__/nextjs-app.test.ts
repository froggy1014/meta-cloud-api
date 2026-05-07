import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextJsAppWebhookConfig } from '../nextjs-app';
import { nextjsAppWebhookHandler } from '../nextjs-app';
import {
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

describe('Next.js App Router Webhook Handler', () => {
    const mockConfig: NextJsAppWebhookConfig = mockWebhookConfig;

    let handler: ReturnType<typeof nextjsAppWebhookHandler>;

    beforeEach(() => {
        vi.clearAllMocks();
        // Destroy cached handler to ensure fresh instance per test
        handler?.destroy?.();
        handler = nextjsAppWebhookHandler(mockConfig);
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
            expect(typeof handler.webhook).toBe('object');
            expect(typeof handler.flow).toBe('object');
            expect(typeof handler.destroy).toBe('function');
            expect(handler.webhook).toHaveProperty('GET');
            expect(handler.webhook).toHaveProperty('POST');
            expect(handler.flow).toHaveProperty('GET');
            expect(handler.flow).toHaveProperty('POST');
        });
    });

    describe('singleton caching', () => {
        it('should return the same instance for the same config', () => {
            const handler2 = nextjsAppWebhookHandler(mockConfig);
            expect(handler2).toBe(handler);
        });

        it('should return a different instance for a different phoneNumberId', () => {
            const differentConfig = { ...mockConfig, phoneNumberId: 999999999 };
            const handler2 = nextjsAppWebhookHandler(differentConfig);
            expect(handler2).not.toBe(handler);
            handler2.destroy();
        });

        it('should return a fresh instance after destroy()', () => {
            handler.destroy();
            const handler2 = nextjsAppWebhookHandler(mockConfig);
            expect(handler2).not.toBe(handler);
            handler = handler2;
        });

        it('should call removeAllHandlers on destroy()', () => {
            const removeAllHandlers = handler.processor.removeAllHandlers;
            handler.destroy();
            expect(removeAllHandlers).toHaveBeenCalled();
            handler = nextjsAppWebhookHandler(mockConfig);
        });
    });

    describe('direct GET handler', () => {
        it('should handle webhook verification', async () => {
            const mockRequest = new Request(
                `https://example.com/webhook?hub.mode=${webhookVerificationData.mode}&hub.verify_token=${webhookVerificationData.token}&hub.challenge=${webhookVerificationData.challenge}`,
            );

            handler.processor.processVerification = vi.fn().mockResolvedValue(webhookVerificationData.successResponse);

            const response = await handler.GET(mockRequest as any);

            expect(handler.processor.processVerification).toHaveBeenCalledWith(
                webhookVerificationData.mode,
                webhookVerificationData.token,
                webhookVerificationData.challenge,
            );
            expect(response.status).toBe(200);
        });

        it('should handle errors gracefully', async () => {
            const mockRequest = new Request('https://example.com/webhook?hub.mode=subscribe');

            handler.processor.processVerification = vi.fn().mockRejectedValue(errorScenarios.verification);

            const response = await handler.GET(mockRequest as any);

            expect(response.status).toBe(500);
        });
    });

    describe('direct POST handler', () => {
        it('should handle webhook processing', async () => {
            const mockRequest = new Request('https://example.com/webhook', {
                method: 'POST',
                body: JSON.stringify(webhookProcessingData.webhookPayload),
                headers: { 'Content-Type': 'application/json' },
            });

            handler.processor.processWebhook = vi.fn().mockResolvedValue(webhookProcessingData.successResponse);

            const response = await handler.POST(mockRequest as any);

            expect(handler.processor.processWebhook).toHaveBeenCalled();
            expect(response.status).toBe(200);
        });

        it('should handle processing errors', async () => {
            const mockRequest = new Request('https://example.com/webhook', {
                method: 'POST',
                body: JSON.stringify(webhookProcessingData.webhookPayload),
                headers: { 'Content-Type': 'application/json' },
            });

            handler.processor.processWebhook = vi.fn().mockRejectedValue(errorScenarios.processing);

            const response = await handler.POST(mockRequest as any);

            expect(response.status).toBe(500);
        });
    });

    describe('webhook.GET', () => {
        it('should handle webhook verification', async () => {
            const mockRequest = new Request(
                `https://example.com/webhook?hub.mode=${webhookVerificationData.mode}&hub.verify_token=${webhookVerificationData.token}&hub.challenge=${webhookVerificationData.challenge}`,
            );

            handler.processor.processVerification = vi.fn().mockResolvedValue(webhookVerificationData.successResponse);

            const response = await handler.webhook.GET(mockRequest as any);

            expect(handler.processor.processVerification).toHaveBeenCalledWith(
                webhookVerificationData.mode,
                webhookVerificationData.token,
                webhookVerificationData.challenge,
            );
            expect(response.status).toBe(200);
        });

        it('should handle errors gracefully', async () => {
            const mockRequest = new Request('https://example.com/webhook?hub.mode=subscribe');

            handler.processor.processVerification = vi.fn().mockRejectedValue(errorScenarios.verification);

            const response = await handler.webhook.GET(mockRequest as any);

            expect(response.status).toBe(500);
        });
    });

    describe('webhook.POST', () => {
        it('should handle webhook processing', async () => {
            const mockRequest = new Request('https://example.com/webhook', {
                method: 'POST',
                body: JSON.stringify(webhookProcessingData.webhookPayload),
                headers: { 'Content-Type': 'application/json' },
            });

            handler.processor.processWebhook = vi.fn().mockResolvedValue(webhookProcessingData.successResponse);

            const response = await handler.webhook.POST(mockRequest as any);

            expect(handler.processor.processWebhook).toHaveBeenCalled();
            expect(response.status).toBe(200);
        });

        it('should handle processing errors', async () => {
            const mockRequest = new Request('https://example.com/webhook', {
                method: 'POST',
                body: JSON.stringify(webhookProcessingData.webhookPayload),
                headers: { 'Content-Type': 'application/json' },
            });

            handler.processor.processWebhook = vi.fn().mockRejectedValue(errorScenarios.processing);

            const response = await handler.webhook.POST(mockRequest as any);

            expect(response.status).toBe(500);
        });
    });

    describe('flow.GET', () => {
        it('should handle flow GET requests', async () => {
            const mockRequest = new Request('https://example.com/flow');

            handler.processor.processFlow = vi.fn().mockResolvedValue(flowProcessingData.successResponse);

            const response = await handler.flow.GET(mockRequest as any);

            expect(handler.processor.processFlow).toHaveBeenCalled();
            expect(response.status).toBe(200);
        });

        it('should handle errors gracefully', async () => {
            const mockRequest = new Request('https://example.com/flow');

            handler.processor.processFlow = vi.fn().mockRejectedValue(errorScenarios.flow);

            const response = await handler.flow.GET(mockRequest as any);

            expect(response.status).toBe(500);
        });
    });

    describe('flow.POST', () => {
        it('should handle flow POST requests', async () => {
            const mockRequest = new Request('https://example.com/flow', {
                method: 'POST',
                body: JSON.stringify(flowProcessingData.flowPayload),
                headers: { 'Content-Type': 'application/json' },
            });

            handler.processor.processFlow = vi.fn().mockResolvedValue(flowProcessingData.successResponse);

            const response = await handler.flow.POST(mockRequest as any);

            expect(handler.processor.processFlow).toHaveBeenCalled();
            expect(response.status).toBe(200);
        });

        it('should handle errors gracefully', async () => {
            const mockRequest = new Request('https://example.com/flow', {
                method: 'POST',
                body: JSON.stringify(flowProcessingData.flowPayload),
                headers: { 'Content-Type': 'application/json' },
            });

            handler.processor.processFlow = vi.fn().mockRejectedValue(errorScenarios.flow);

            const response = await handler.flow.POST(mockRequest as any);

            expect(response.status).toBe(500);
        });
    });
});
