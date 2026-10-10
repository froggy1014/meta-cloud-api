import { describe, expect, it, vi } from 'vitest';
import { MessageTypesEnum } from '../../../types/enums';
import type { AccountUpdateValue } from '../types/account';
import type { StatusWebhook } from '../types/status';
import { WebhookProcessor } from '../WebhookProcessor';

// Mock WhatsApp client to avoid real API calls
vi.mock('../../whatsapp', () => ({
    WhatsApp: class MockWhatsApp {},
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

    describe('handler removal — offUserAction', () => {
        it('should register and remove the user action handler', () => {
            const processor = createProcessor();
            const handler = vi.fn();

            processor.onUserAction(handler);
            expect((processor as any).userActionHandler).toBe(handler);

            processor.offUserAction();
            expect((processor as any).userActionHandler).toBeUndefined();
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
            processor.onUserAction(vi.fn());
            processor.onRaw(vi.fn());
            processor.onAccountUpdate(vi.fn());
            processor.onFlows(vi.fn());
            processor.onSecurity(vi.fn());

            // Verify they're registered
            expect((processor as any).messageHandlers.size).toBe(3);
            expect((processor as any).preProcessHandler).toBeDefined();
            expect((processor as any).postProcessHandler).toBeDefined();
            expect((processor as any).statusHandler).toBeDefined();
            expect((processor as any).userActionHandler).toBeDefined();
            expect((processor as any).rawHandler).toBeDefined();
            expect((processor as any).fieldHandlers.has('account_update')).toBe(true);
            expect((processor as any).fieldHandlers.has('flows')).toBe(true);
            expect((processor as any).fieldHandlers.has('security')).toBe(true);

            processor.removeAllHandlers();

            // Verify all cleared
            expect((processor as any).messageHandlers.size).toBe(0);
            expect((processor as any).preProcessHandler).toBeUndefined();
            expect((processor as any).postProcessHandler).toBeUndefined();
            expect((processor as any).statusHandler).toBeUndefined();
            expect((processor as any).userActionHandler).toBeUndefined();
            expect((processor as any).rawHandler).toBeUndefined();
            expect((processor as any).flowHandlers.size).toBe(0);
            expect((processor as any).fieldHandlers.size).toBe(0);
        });

        it('should not throw when no handlers are registered', () => {
            const processor = createProcessor();
            expect(() => processor.removeAllHandlers()).not.toThrow();
        });
    });

    // October 1, 2026 service and utility pricing change (changelog entry #444)
    describe('status webhook pricing values', () => {
        it('accepts the group free-tier pricing type and group pricing categories', () => {
            const groupServiceStatus: StatusWebhook = {
                id: 'wamid.TEST',
                status: 'delivered',
                timestamp: '1759276800',
                recipient_id: '1234567890@g.us',
                recipient_type: 'group',
                pricing: {
                    billable: false,
                    pricing_model: 'PMP',
                    type: 'free_group_customer_service',
                    category: 'group_service',
                },
            };

            expect(groupServiceStatus.pricing?.type).toBe('free_group_customer_service');
            expect(groupServiceStatus.pricing?.category).toBe('group_service');
        });

        it('accepts the hyphenated authentication-international pricing category', () => {
            const authIntlStatus: StatusWebhook = {
                id: 'wamid.TEST',
                status: 'sent',
                timestamp: '1759276800',
                recipient_id: '15551234567',
                pricing: {
                    billable: true,
                    pricing_model: 'PMP',
                    type: 'regular',
                    category: 'authentication-international',
                },
            };

            expect(authIntlStatus.pricing?.category).toBe('authentication-international');
        });

        // Changelog entry #475
        it('passes the paid_exempt pricing subtype through to the status handler', async () => {
            const processor = createProcessor();
            const handler = vi.fn();
            processor.onStatus(handler);

            const status: StatusWebhook = {
                id: 'wamid.TEST',
                status: 'delivered',
                timestamp: '1760227200',
                recipient_id: '15551234567',
                pricing: {
                    billable: false,
                    pricing_model: 'PMP',
                    category: 'service',
                    type: 'free_customer_service',
                    subtype: 'paid_exempt',
                },
            };

            await processor.processWebhook(
                new Request('https://example.com/webhook', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        object: 'whatsapp_business_account',
                        entry: [
                            {
                                id: 'WABA_ID',
                                changes: [
                                    {
                                        field: 'messages',
                                        value: {
                                            messaging_product: 'whatsapp',
                                            metadata: {
                                                display_phone_number: '15550000000',
                                                phone_number_id: '123456789',
                                            },
                                            statuses: [status],
                                        },
                                    },
                                ],
                            },
                        ],
                    }),
                }),
            );

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler.mock.lastCall?.[1].status.pricing).toEqual(status.pricing);
            expect(handler.mock.lastCall?.[1].status.pricing?.subtype).toBe('paid_exempt');
        });
    });

    // account_update phone_number field (changelog entry #468)
    describe('account_update phone_number', () => {
        it('passes phone_number and calling restriction types through to the handler', async () => {
            const processor = createProcessor();
            const handler = vi.fn();
            processor.onAccountUpdate(handler);

            const value: AccountUpdateValue = {
                phone_number: '15550783881',
                event: 'ACCOUNT_RESTRICTION',
                restriction_info: [
                    { restriction_type: 'RESTRICTED_BUSINESS_INITIATED_CALLING', expiration: 1641330498 },
                    { restriction_type: 'RESTRICTED_ADD_PHONE_NUMBER_ACTION' },
                ],
            };

            await processor.processWebhook(
                new Request('https://example.com/webhook', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        object: 'whatsapp_business_account',
                        entry: [{ id: '102290129340398', changes: [{ field: 'account_update', value }] }],
                    }),
                }),
            );

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler.mock.lastCall?.[1]).toMatchObject({ wabaId: '102290129340398', value });
            expect(handler.mock.lastCall?.[1].value.phone_number).toBe('15550783881');
        });
    });
});
