import { describe, expect, it, vi } from 'vitest';
import { MessageTypesEnum } from '../../../types/enums';
import { WebhookProcessor } from '../WebhookProcessor';

// Mock WhatsApp client to avoid real API calls
vi.mock('../../whatsapp', () => ({
    WhatsApp: vi.fn().mockImplementation(() => ({})),
}));

const createProcessor = () =>
    new WebhookProcessor({
        accessToken: 'test-token',
        phoneNumberId: 123456789,
        webhookVerificationToken: 'test-verify-token',
    });

describe('WebhookProcessor', () => {
    describe('handler removal — offMessage', () => {
        it('should remove a registered message handler', () => {
            const processor = createProcessor();
            const handler = vi.fn();

            processor.onText(handler);
            // Verify registered
            expect((processor as any).messageHandlers.has(MessageTypesEnum.Text)).toBe(true);

            processor.offMessage(MessageTypesEnum.Text);
            expect((processor as any).messageHandlers.has(MessageTypesEnum.Text)).toBe(false);
        });

        it('should not throw when removing a non-existent handler', () => {
            const processor = createProcessor();
            expect(() => processor.offMessage(MessageTypesEnum.Text)).not.toThrow();
        });
    });

    describe('handler removal — offMessagePreProcess', () => {
        it('should remove the pre-process handler', () => {
            const processor = createProcessor();
            processor.onMessagePreProcess(vi.fn());
            expect((processor as any).preProcessHandler).toBeDefined();

            processor.offMessagePreProcess();
            expect((processor as any).preProcessHandler).toBeUndefined();
        });
    });

    describe('handler removal — offMessagePostProcess', () => {
        it('should remove the post-process handler', () => {
            const processor = createProcessor();
            processor.onMessagePostProcess(vi.fn());
            expect((processor as any).postProcessHandler).toBeDefined();

            processor.offMessagePostProcess();
            expect((processor as any).postProcessHandler).toBeUndefined();
        });
    });

    describe('handler removal — offStatus', () => {
        it('should remove the status handler', () => {
            const processor = createProcessor();
            processor.onStatus(vi.fn());
            expect((processor as any).statusHandler).toBeDefined();

            processor.offStatus();
            expect((processor as any).statusHandler).toBeUndefined();
        });
    });

    describe('handler removal — offRaw', () => {
        it('should remove the raw handler', () => {
            const processor = createProcessor();
            processor.onRaw(vi.fn());
            expect((processor as any).rawHandler).toBeDefined();

            processor.offRaw();
            expect((processor as any).rawHandler).toBeUndefined();
        });
    });

    describe('removeAllHandlers', () => {
        it('should clear all registered handlers', () => {
            const processor = createProcessor();

            // Register various handlers
            processor.onText(vi.fn());
            processor.onImage(vi.fn());
            processor.onAudio(vi.fn());
            processor.onMessagePreProcess(vi.fn());
            processor.onMessagePostProcess(vi.fn());
            processor.onStatus(vi.fn());
            processor.onRaw(vi.fn());
            processor.onAccountUpdate(vi.fn());
            processor.onFlows(vi.fn());
            processor.onSecurity(vi.fn());

            // Verify they're registered
            expect((processor as any).messageHandlers.size).toBe(3);
            expect((processor as any).preProcessHandler).toBeDefined();
            expect((processor as any).postProcessHandler).toBeDefined();
            expect((processor as any).statusHandler).toBeDefined();
            expect((processor as any).rawHandler).toBeDefined();
            expect((processor as any).accountUpdateHandler).toBeDefined();
            expect((processor as any).flowsHandler).toBeDefined();
            expect((processor as any).securityHandler).toBeDefined();

            processor.removeAllHandlers();

            // Verify all cleared
            expect((processor as any).messageHandlers.size).toBe(0);
            expect((processor as any).preProcessHandler).toBeUndefined();
            expect((processor as any).postProcessHandler).toBeUndefined();
            expect((processor as any).statusHandler).toBeUndefined();
            expect((processor as any).rawHandler).toBeUndefined();
            expect((processor as any).flowHandlers.size).toBe(0);
            expect((processor as any).accountUpdateHandler).toBeUndefined();
            expect((processor as any).flowsHandler).toBeUndefined();
            expect((processor as any).securityHandler).toBeUndefined();
        });

        it('should not throw when no handlers are registered', () => {
            const processor = createProcessor();
            expect(() => processor.removeAllHandlers()).not.toThrow();
        });
    });
});
