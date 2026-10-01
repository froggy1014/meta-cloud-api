import { describe, expect, it, vi } from 'vitest';

import { MessageTypesEnum } from '../../../../types/enums';
import type WhatsApp from '../../../whatsapp/WhatsApp';
import type { WebhookPayload } from '../../types';
import type { UserActionsWebhookValue } from '../../types/marketing';
import type { SystemMessage } from '../../types/message';
import type { MessagingHandoversWebhookValue, UserPreferencesWebhookValue } from '../../types/messaging';
import type { BusinessUsernameUpdatesWebhookValue } from '../../types/phoneNumber';
import { processWebhookMessages } from '../webhookUtils';

const createRequest = (payload: WebhookPayload): { request: Request; rawBody: string } => {
    const rawBody = JSON.stringify(payload);

    return {
        rawBody,
        request: new Request('https://example.com/webhook', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-hub-signature-256': 'sha256=test-signature',
            },
            body: rawBody,
        }),
    };
};

const whatsapp = {} as WhatsApp;

describe('processWebhookMessages', () => {
    it('passes request headers and raw body to raw webhook handlers', async () => {
        const payload = {
            object: 'whatsapp_business_account',
            entry: [
                {
                    id: 'waba-id',
                    changes: [
                        {
                            field: 'message_template_status_update',
                            value: {
                                event: 'APPROVED',
                                message_template_id: 123,
                                message_template_name: 'hello_world',
                                message_template_language: 'en_US',
                            },
                        },
                    ],
                },
            ],
        } as unknown as WebhookPayload;
        const { request, rawBody } = createRequest(payload);
        const rawHandler = vi.fn();

        await processWebhookMessages(request, whatsapp, {
            messageHandlers: new Map(),
            rawHandler,
        });

        expect(rawHandler).toHaveBeenCalledOnce();
        expect(rawHandler.mock.calls[0]?.[1]).toEqual(payload);
        expect(rawHandler.mock.calls[0]?.[2]).toMatchObject({
            rawBody,
            method: 'POST',
            url: 'https://example.com/webhook',
        });
        expect(rawHandler.mock.calls[0]?.[2].headers.get('x-hub-signature-256')).toBe('sha256=test-signature');
    });

    it('keeps context raw body unchanged when raw payload is field-filtered', async () => {
        const payload = {
            object: 'whatsapp_business_account',
            entry: [
                {
                    id: 'waba-id',
                    changes: [
                        {
                            field: 'messages',
                            value: {
                                messaging_product: 'whatsapp',
                                metadata: {
                                    display_phone_number: '15551234567',
                                    phone_number_id: 'phone-number-id',
                                },
                                messages: [
                                    {
                                        id: 'message-id',
                                        from: '15557654321',
                                        timestamp: '1234567890',
                                        text: { body: 'hello' },
                                        type: 'text',
                                    },
                                ],
                            },
                        },
                        {
                            field: 'message_template_status_update',
                            value: {
                                event: 'APPROVED',
                                message_template_id: 123,
                                message_template_name: 'hello_world',
                                message_template_language: 'en_US',
                            },
                        },
                    ],
                },
            ],
        } as unknown as WebhookPayload;
        const { request, rawBody } = createRequest(payload);
        const rawHandler = vi.fn();

        await processWebhookMessages(request, whatsapp, {
            messageHandlers: new Map(),
            rawHandler,
            rawHandlerFields: ['message_template_status_update'],
        });

        const filteredPayload = rawHandler.mock.calls[0]?.[1] as WebhookPayload;
        const context = rawHandler.mock.calls[0]?.[2];

        expect(filteredPayload.entry[0]?.changes).toHaveLength(1);
        expect(filteredPayload.entry[0]?.changes[0]?.field).toBe('message_template_status_update');
        expect(context.rawBody).toBe(rawBody);
        expect(JSON.parse(context.rawBody).entry[0].changes).toHaveLength(2);
    });
});

describe('BSUID identity and preference webhooks', () => {
    it('routes a user_changed_user_id system message with the new BSUIDs', async () => {
        const payload = {
            object: 'whatsapp_business_account',
            entry: [
                {
                    id: 'waba-id',
                    changes: [
                        {
                            field: 'messages',
                            value: {
                                messaging_product: 'whatsapp',
                                metadata: {
                                    display_phone_number: '15551234567',
                                    phone_number_id: 'phone-number-id',
                                },
                                messages: [
                                    {
                                        id: 'message-id',
                                        from: '15557654321',
                                        timestamp: '1234567890',
                                        type: 'system',
                                        system: {
                                            body: 'User A changed from US.1111111 to US.2222222',
                                            wa_id: '15557654321',
                                            user_id: 'US.2222222',
                                            parent_user_id: 'US.9999999',
                                            type: 'user_changed_user_id',
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
        } as unknown as WebhookPayload;
        const { request } = createRequest(payload);
        const systemHandler = vi.fn();

        await processWebhookMessages(request, whatsapp, {
            messageHandlers: new Map([[MessageTypesEnum.System, systemHandler]]),
        });

        expect(systemHandler).toHaveBeenCalledOnce();
        const processed = systemHandler.mock.calls[0]?.[1] as { message: SystemMessage };
        expect(processed.message.system).toEqual({
            body: 'User A changed from US.1111111 to US.2222222',
            wa_id: '15557654321',
            user_id: 'US.2222222',
            parent_user_id: 'US.9999999',
            type: 'user_changed_user_id',
        });
    });

    it('routes a user_preferences change carrying user_id and parent_user_id', async () => {
        const payload = {
            object: 'whatsapp_business_account',
            entry: [
                {
                    id: 'waba-id',
                    changes: [
                        {
                            field: 'user_preferences',
                            value: {
                                messaging_product: 'whatsapp',
                                metadata: {
                                    display_phone_number: '15551234567',
                                    phone_number_id: 'phone-number-id',
                                },
                                user_preferences: [
                                    {
                                        wa_id: '15557654321',
                                        user_id: 'US.2222222',
                                        parent_user_id: 'US.9999999',
                                        detail: 'User requested to resume marketing messages',
                                        category: 'marketing_messages',
                                        value: 'resume',
                                        timestamp: 1731705721,
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
        } as unknown as WebhookPayload;
        const { request } = createRequest(payload);
        const userPreferencesHandler = vi.fn();

        await processWebhookMessages(request, whatsapp, {
            messageHandlers: new Map(),
            userPreferencesHandler,
        });

        expect(userPreferencesHandler).toHaveBeenCalledOnce();
        const processed = userPreferencesHandler.mock.calls[0]?.[1] as {
            wabaId: string;
            value: UserPreferencesWebhookValue['value'];
        };
        expect(processed.wabaId).toBe('waba-id');
        expect(processed.value.user_preferences[0]).toMatchObject({
            user_id: 'US.2222222',
            parent_user_id: 'US.9999999',
            value: 'resume',
        });
    });

    it('routes a business_username_updates change carrying the revoked context', async () => {
        const payload = {
            object: 'whatsapp_business_account',
            entry: [
                {
                    id: 'waba-id',
                    changes: [
                        {
                            field: 'business_username_updates',
                            value: {
                                display_phone_number: '15551234567',
                                status: 'deleted',
                                context: 'revoked',
                            },
                        },
                    ],
                },
            ],
        } as unknown as WebhookPayload;
        const { request } = createRequest(payload);
        const businessUsernameUpdatesHandler = vi.fn();

        await processWebhookMessages(request, whatsapp, {
            messageHandlers: new Map(),
            businessUsernameUpdatesHandler,
        });

        expect(businessUsernameUpdatesHandler).toHaveBeenCalledOnce();
        const processed = businessUsernameUpdatesHandler.mock.calls[0]?.[1] as {
            wabaId: string;
            value: BusinessUsernameUpdatesWebhookValue['value'];
        };
        expect(processed.wabaId).toBe('waba-id');
        expect(processed.value).toEqual({
            display_phone_number: '15551234567',
            status: 'deleted',
            context: 'revoked',
        });
    });

    it('routes a control_passed handover carrying owner roles and conversation context', async () => {
        const payload = {
            object: 'whatsapp_business_account',
            entry: [
                {
                    id: 'waba-id',
                    changes: [
                        {
                            field: 'messaging_handovers',
                            value: {
                                messaging_product: 'whatsapp',
                                sender: { phone_number: '15557654321' },
                                recipient: { phone_number_id: 'phone-number-id', display_phone_number: '15551234567' },
                                type: 'control_passed',
                                timestamp: '1697041663',
                                control_passed: {
                                    previous_owner_role: 'ai_agent',
                                    new_owner_role: 'escalation',
                                    metadata: 'WhatsApp user requested human agent',
                                    conversation_context: { type: 'summary', summary: { text: 'Summary' } },
                                },
                            },
                        },
                    ],
                },
            ],
        } as unknown as WebhookPayload;
        const { request } = createRequest(payload);
        const messagingHandoversHandler = vi.fn();

        await processWebhookMessages(request, whatsapp, {
            messageHandlers: new Map(),
            messagingHandoversHandler,
        });

        expect(messagingHandoversHandler).toHaveBeenCalledOnce();
        const processed = messagingHandoversHandler.mock.calls[0]?.[1] as {
            value: MessagingHandoversWebhookValue['value'];
        };
        expect(processed.value.type).toBe('control_passed');
        expect(processed.value.control_passed).toMatchObject({
            previous_owner_role: 'ai_agent',
            new_owner_role: 'escalation',
            conversation_context: { type: 'summary', summary: { text: 'Summary' } },
        });
    });

    it('exposes conversation_context on processed incoming messages', async () => {
        const payload = {
            object: 'whatsapp_business_account',
            entry: [
                {
                    id: 'waba-id',
                    changes: [
                        {
                            field: 'messages',
                            value: {
                                messaging_product: 'whatsapp',
                                metadata: { display_phone_number: '15551234567', phone_number_id: 'phone-number-id' },
                                contacts: [{ profile: { name: 'User' }, wa_id: '15557654321' }],
                                messages: [
                                    {
                                        from: '15557654321',
                                        id: 'wamid.1',
                                        timestamp: '1697041663',
                                        type: 'text',
                                        text: { body: 'Hello, I need help with my order' },
                                    },
                                ],
                                conversation_context: { type: 'summary', summary: { text: 'Summary' } },
                            },
                        },
                    ],
                },
            ],
        } as unknown as WebhookPayload;
        const { request } = createRequest(payload);
        const textHandler = vi.fn();

        await processWebhookMessages(request, whatsapp, {
            messageHandlers: new Map([[MessageTypesEnum.Text, textHandler]]),
        });

        expect(textHandler).toHaveBeenCalledOnce();
        expect(textHandler.mock.calls[0]?.[1].conversationContext).toEqual({
            type: 'summary',
            summary: { text: 'Summary' },
        });
    });
});

// Marketing message user actions on the `messages` field (changelog entry #461)
describe('marketing message user_actions webhooks', () => {
    const createUserActionsPayload = (userActions: UserActionsWebhookValue['user_actions']): WebhookPayload =>
        ({
            object: 'whatsapp_business_account',
            entry: [
                {
                    id: 'waba-id',
                    changes: [
                        {
                            field: 'messages',
                            value: {
                                messaging_product: 'whatsapp',
                                metadata: { display_phone_number: '15551234567', phone_number_id: 'phone-number-id' },
                                user_actions: userActions,
                            } satisfies UserActionsWebhookValue,
                        },
                    ],
                },
            ],
        }) as unknown as WebhookPayload;

    it('dispatches landing_page_view actions to the user action handler with metadata', async () => {
        const { request } = createRequest(
            createUserActionsPayload([
                {
                    action_type: 'landing_page_view',
                    timestamp: '1758585600',
                    marketing_messages_link_click_data: { tracking_token: 'token-1', click_id: 'click-1' },
                },
            ]),
        );
        const userActionHandler = vi.fn();
        const textHandler = vi.fn();
        const statusHandler = vi.fn();

        const response = await processWebhookMessages(request, whatsapp, {
            messageHandlers: new Map([[MessageTypesEnum.Text, textHandler]]),
            statusHandler,
            userActionHandler,
        });

        expect(response.status).toBe(200);
        expect(textHandler).not.toHaveBeenCalled();
        expect(statusHandler).not.toHaveBeenCalled();
        expect(userActionHandler).toHaveBeenCalledOnce();
        expect(userActionHandler.mock.calls[0]?.[1]).toEqual({
            wabaId: 'waba-id',
            phoneNumberId: 'phone-number-id',
            displayPhoneNumber: '15551234567',
            action: {
                action_type: 'landing_page_view',
                timestamp: '1758585600',
                marketing_messages_link_click_data: { tracking_token: 'token-1', click_id: 'click-1' },
            },
        });
    });

    it('dispatches every action in the array, including click events and unknown action types', async () => {
        const { request } = createRequest(
            createUserActionsPayload([
                {
                    action_type: 'marketing_messages_link_click',
                    timestamp: '1758585500',
                    marketing_messages_link_click_data: {
                        click_component: 'cta',
                        product_id: 'sku-1',
                        click_id: 'click-1',
                        tracking_token: 'token-1',
                    },
                },
                // Landing page view with neither correlation key — keys are omitted, not null
                { action_type: 'landing_page_view', timestamp: '1758585600', marketing_messages_link_click_data: {} },
                // Open enum: future action types must still reach the handler
                { action_type: 'some_future_action', timestamp: '1758585700' },
            ]),
        );
        const userActionHandler = vi.fn();

        await processWebhookMessages(request, whatsapp, {
            messageHandlers: new Map(),
            userActionHandler,
        });

        expect(userActionHandler).toHaveBeenCalledTimes(3);
        expect(userActionHandler.mock.calls.map((call) => call[1].action.action_type)).toEqual([
            'marketing_messages_link_click',
            'landing_page_view',
            'some_future_action',
        ]);
        expect(userActionHandler.mock.calls[0]?.[1].action.marketing_messages_link_click_data.click_component).toBe(
            'cta',
        );
        expect(userActionHandler.mock.calls[1]?.[1].action.marketing_messages_link_click_data).toEqual({});
    });

    it('ignores user_actions payloads when no user action handler is registered', async () => {
        const { request } = createRequest(
            createUserActionsPayload([{ action_type: 'landing_page_view', timestamp: '1758585600' }]),
        );
        const textHandler = vi.fn();

        const response = await processWebhookMessages(request, whatsapp, {
            messageHandlers: new Map([[MessageTypesEnum.Text, textHandler]]),
        });

        expect(response.status).toBe(200);
        expect(textHandler).not.toHaveBeenCalled();
    });

    it('keeps processing after a user action handler throws', async () => {
        const { request } = createRequest(
            createUserActionsPayload([
                { action_type: 'landing_page_view', timestamp: '1758585600' },
                { action_type: 'landing_page_view', timestamp: '1758585601' },
            ]),
        );
        const userActionHandler = vi.fn().mockRejectedValueOnce(new Error('boom'));

        const response = await processWebhookMessages(request, whatsapp, {
            messageHandlers: new Map(),
            userActionHandler,
        });

        expect(response.status).toBe(200);
        expect(userActionHandler).toHaveBeenCalledTimes(2);
    });
});
