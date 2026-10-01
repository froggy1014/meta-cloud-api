import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import Logger from '../../../utils/logger';
import type {
    AccountUpdateWebhookValue,
    CallsWebhookValue,
    NonMessageWebhookField,
    WebhookFieldType,
    WebhookFieldValueMap,
} from '../types';
import {
    type AccountUpdateHandler,
    type CallsHandler,
    processWebhookMessages,
    WEBHOOK_FIELD_REGISTRY,
    type WebhookFieldHandler,
    type WebhookFieldHandlerOptions,
} from '../utils/webhookUtils';
import { WebhookProcessor } from '../WebhookProcessor';

vi.mock('../../whatsapp', () => ({
    WhatsApp: class MockWhatsApp {},
}));

const createProcessor = () =>
    new WebhookProcessor({
        accessToken: 'test-token',
        phoneNumberId: 123456789,
        webhookVerificationToken: 'test-verify-token',
    });

const webhookRequest = (field: string, value: unknown) =>
    new Request('https://example.com/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            object: 'whatsapp_business_account',
            entry: [{ id: 'WABA_ID', changes: [{ field, value }] }],
        }),
    });

type FieldWrapper = {
    [K in keyof WebhookProcessor]: K extends `on${string}` ? K : never;
}[keyof WebhookProcessor];

// One entry per registry field. A field added to WebhookFieldValueMap without a
// wrapper entry here fails type checking, and the runtime check below fails too.
const WRAPPERS: { [F in NonMessageWebhookField]: FieldWrapper } = {
    account_update: 'onAccountUpdate',
    account_review_update: 'onAccountReviewUpdate',
    account_alerts: 'onAccountAlerts',
    account_settings_update: 'onAccountSettingsUpdate',
    automatic_events: 'onAutomaticEvents',
    business_capability_update: 'onBusinessCapabilityUpdate',
    business_status_update: 'onBusinessStatusUpdate',
    business_username_updates: 'onBusinessUsernameUpdates',
    calls: 'onCalls',
    flows: 'onFlows',
    group_lifecycle_update: 'onGroupLifecycleUpdate',
    group_participants_update: 'onGroupParticipantsUpdate',
    group_settings_update: 'onGroupSettingsUpdate',
    group_status_update: 'onGroupStatusUpdate',
    history: 'onHistory',
    message_echoes: 'onMessageEchoes',
    message_template_components_update: 'onMessageTemplateComponentsUpdate',
    message_template_quality_update: 'onMessageTemplateQualityUpdate',
    message_template_status_update: 'onMessageTemplateStatusUpdate',
    messaging_handovers: 'onMessagingHandovers',
    partner_solutions: 'onPartnerSolutions',
    payment_configuration_update: 'onPaymentConfigurationUpdate',
    phone_number_name_update: 'onPhoneNumberNameUpdate',
    phone_number_quality_update: 'onPhoneNumberQualityUpdate',
    security: 'onSecurity',
    smb_app_state_sync: 'onSmbAppStateSync',
    smb_message_echoes: 'onSmbMessageEchoes',
    standby: 'onStandby',
    template_category_update: 'onTemplateCategoryUpdate',
    template_correct_category_detection: 'onTemplateCorrectCategoryDetection',
    tracking_events: 'onTrackingEvents',
    user_preferences: 'onUserPreferences',
};

const FIELDS = Object.keys(WEBHOOK_FIELD_REGISTRY) as NonMessageWebhookField[];

describe('webhook field registry', () => {
    it('covers every webhook field except messages', () => {
        expect(FIELDS).toHaveLength(32);
        expect(FIELDS).not.toContain('messages');
        expect([...FIELDS].sort()).toEqual(Object.keys(WRAPPERS).sort());
    });

    describe.each(FIELDS)('%s', (field) => {
        const value = { marker: field };

        it('dispatches to a handler registered with on()', async () => {
            const processor = createProcessor();
            const handler = vi.fn();
            processor.on(field, handler);

            const response = await processor.processWebhook(webhookRequest(field, value));

            expect(response.status).toBe(200);
            expect(handler).toHaveBeenCalledOnce();
            expect(handler.mock.calls[0]?.[1]).toEqual({ wabaId: 'WABA_ID', value });
            expect(handler.mock.calls[0]?.[2]).toMatchObject({ method: 'POST', url: 'https://example.com/webhook' });
        });

        it('dispatches to the onXxx wrapper exactly like on()', async () => {
            const viaOn = vi.fn();
            const viaWrapper = vi.fn();
            const a = createProcessor();
            const b = createProcessor();
            a.on(field, viaOn);
            (b[WRAPPERS[field]] as (handler: unknown) => void)(viaWrapper);

            await a.processWebhook(webhookRequest(field, value));
            await b.processWebhook(webhookRequest(field, value));

            expect(viaWrapper).toHaveBeenCalledOnce();
            expect(viaWrapper.mock.calls[0]?.[1]).toEqual(viaOn.mock.calls[0]?.[1]);
        });

        it('dispatches to the named handler option of processWebhookMessages', async () => {
            const handler = vi.fn();
            const options = { [WEBHOOK_FIELD_REGISTRY[field]]: handler } as WebhookFieldHandlerOptions;

            const response = await processWebhookMessages(webhookRequest(field, value), {} as never, {
                messageHandlers: new Map(),
                ...options,
            });

            expect(response.status).toBe(200);
            expect(handler).toHaveBeenCalledWith({}, { wabaId: 'WABA_ID', value }, expect.any(Object));
        });

        it('stops dispatching after off()', async () => {
            const processor = createProcessor();
            const handler = vi.fn();
            (processor[WRAPPERS[field]] as (handler: unknown) => void)(handler);
            processor.off(field);

            await processor.processWebhook(webhookRequest(field, value));

            expect(handler).not.toHaveBeenCalled();
        });

        it('only calls the handler for its own field', async () => {
            const processor = createProcessor();
            const handler = vi.fn();
            processor.on(field, handler);
            const other = FIELDS.find((f) => f !== field) as NonMessageWebhookField;

            await processor.processWebhook(webhookRequest(other, value));

            expect(handler).not.toHaveBeenCalled();
        });
    });
});

describe('WebhookProcessor.on / off', () => {
    it('replaces the handler set with the onXxx wrapper', async () => {
        const processor = createProcessor();
        const first = vi.fn();
        const second = vi.fn();
        processor.onCalls(first);
        processor.on('calls', second);

        await processor.processWebhook(webhookRequest('calls', { calls: [] }));

        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledOnce();
    });

    it('is cleared by removeAllHandlers', async () => {
        const processor = createProcessor();
        const handler = vi.fn();
        processor.on('security', handler);
        processor.removeAllHandlers();

        await processor.processWebhook(webhookRequest('security', {}));

        expect(handler).not.toHaveBeenCalled();
    });

    it('rejects messages and unknown fields', () => {
        const processor = createProcessor();
        expect(() => processor.on('messages' as never, vi.fn())).toThrow(/onMessage/);
        expect(() => processor.off('messages' as never)).toThrow(/onMessage/);
        expect(() => processor.on('not_a_field' as never, vi.fn())).toThrow(/unknown webhook field/);
    });

    it('keeps handler errors from failing the webhook', async () => {
        const processor = createProcessor();
        processor.on('calls', () => {
            throw new Error('boom');
        });

        const response = await processor.processWebhook(webhookRequest('calls', { calls: [] }));

        expect(response.status).toBe(200);
    });

    it('logs unhandled webhook fields and still returns 200', async () => {
        const warn = vi.spyOn(Logger.prototype, 'warn');
        const processor = createProcessor();

        const response = await processor.processWebhook(webhookRequest('brand_new_field', {}));

        expect(response.status).toBe(200);
        expect(warn).toHaveBeenCalledWith('Unhandled webhook field: brand_new_field');
        warn.mockRestore();
    });

    it('prefers fieldHandlers over the named option in processWebhookMessages', async () => {
        const named = vi.fn();
        const mapped = vi.fn();

        await processWebhookMessages(webhookRequest('calls', { calls: [] }), {} as never, {
            messageHandlers: new Map(),
            callsHandler: named,
            fieldHandlers: new Map([['calls', mapped]]),
        });

        expect(mapped).toHaveBeenCalledOnce();
        expect(named).not.toHaveBeenCalled();
    });
});

describe('field handler types', () => {
    it('infers processed.value from the field name', () => {
        const processor = createProcessor();
        processor.on('calls', (_wa, processed) => {
            expectTypeOf(processed.value).toEqualTypeOf<CallsWebhookValue['value']>();
            expectTypeOf(processed.wabaId).toEqualTypeOf<string>();
        });
        processor.on('account_update', (_wa, { value }) => {
            expectTypeOf(value).toEqualTypeOf<AccountUpdateWebhookValue['value']>();
        });
    });

    it('maps every non-message field and nothing else', () => {
        expectTypeOf<NonMessageWebhookField>().toEqualTypeOf<Exclude<WebhookFieldType, 'messages'>>();
        expectTypeOf<WebhookFieldValueMap['calls']>().toEqualTypeOf<CallsWebhookValue['value']>();
    });

    it('rejects messages and mismatched handlers at compile time', () => {
        const processor = createProcessor();
        expectTypeOf(processor.on).parameter(0).toEqualTypeOf<NonMessageWebhookField>();
        // @ts-expect-error messages has dedicated handlers
        expect(() => processor.on('messages', vi.fn())).toThrow();
        const callsOnly = (_wa: unknown, _processed: { wabaId: string; value: CallsWebhookValue['value'] }) => {};
        // @ts-expect-error a calls handler does not fit account_update
        processor.on('account_update', callsOnly);
    });

    it('keeps the legacy handler types equal to the generic ones', () => {
        expectTypeOf<CallsHandler>().toEqualTypeOf<WebhookFieldHandler<'calls'>>();
        expectTypeOf<AccountUpdateHandler>().toEqualTypeOf<WebhookFieldHandler<'account_update'>>();
    });
});
