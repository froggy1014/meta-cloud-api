import type { FlowEndpointRequest } from '../../../api/flow';
import { FlowTypeEnum } from '../../../api/flow/types';
import type { DedupeStore, WabaConfigType } from '../../../types/config';
import { MessageTypesEnum, WabaConfigEnum } from '../../../types/enums';
import { decryptFlowRequestAsync, encryptFlowResponseAsync } from '../../../utils/flowEncryptionUtils';
import { isFlowDataExchangeRequest, isFlowErrorRequest, isFlowPingRequest } from '../../../utils/flowTypeGuards';
import Logger from '../../../utils/logger';
import { hmacSha256Hex, isDebugEnv, requireNodeCrypto, timingSafeEqualString } from '../../../utils/runtime';
import type WhatsApp from '../../whatsapp/WhatsApp';
import { DEFAULT_DEDUPE_TTL_SECONDS } from '../dedupe';
import type {
    ConversationContext,
    MessageWebhookValue,
    NonMessageWebhookField,
    StatusWebhook,
    StatusWebhookValue,
    UserAction,
    UserActionsWebhookValue,
    WebhookFieldType,
    WebhookFieldValueMap,
    WebhookPayload,
    WebhookValue,
    WhatsAppMessage,
} from '../types';

const LIB_NAME = 'WEBHOOK_UTILS';
const LOGGER = new Logger(LIB_NAME, isDebugEnv());

/**
 * Processed message with metadata for handlers
 */
export type ProcessedMessage = {
    wabaId: string;
    phoneNumberId: string;
    displayPhoneNumber: string;
    profileName: string;
    message: WhatsAppMessage;
    /**
     * The message ID extracted from the appropriate location based on message type.
     * For most messages, this comes from message.id
     * For certain types like nfm_reply, this comes from message.context.id
     */
    messageId: string;
    /**
     * AI-generated conversation summary from `value.conversation_context`, present
     * under Conversation Routing when a thread is assigned to you without standby
     * history. Optional; never parse `summary.text`.
     */
    conversationContext?: ConversationContext;
};

/**
 * Processed status with metadata for handlers
 */
export type ProcessedStatus = {
    wabaId: string;
    phoneNumberId: string;
    displayPhoneNumber: string;
    status: StatusWebhook;
};

/**
 * Processed marketing message user action (link click or landing page view)
 * delivered as `user_actions` on the `messages` field. Marketing Messages API
 * for WhatsApp only. Branch on `action.action_type` and ignore unknown values.
 */
export type ProcessedUserAction = {
    wabaId: string;
    phoneNumberId: string;
    displayPhoneNumber: string;
    action: UserAction;
};

/**
 * What a handler for a non-`messages` webhook field receives: the WhatsApp
 * Business Account id and the change's `value`, typed by field name.
 */
export type ProcessedWebhookField<F extends NonMessageWebhookField> = {
    wabaId: string;
    value: WebhookFieldValueMap[F];
};

/**
 * Processed webhook field types for specialized handlers
 */
export type ProcessedAccountUpdate = ProcessedWebhookField<'account_update'>;
export type ProcessedAccountReviewUpdate = ProcessedWebhookField<'account_review_update'>;
export type ProcessedAccountAlerts = ProcessedWebhookField<'account_alerts'>;
export type ProcessedBusinessCapabilityUpdate = ProcessedWebhookField<'business_capability_update'>;
export type ProcessedPhoneNumberNameUpdate = ProcessedWebhookField<'phone_number_name_update'>;
export type ProcessedPhoneNumberQualityUpdate = ProcessedWebhookField<'phone_number_quality_update'>;
export type ProcessedMessageTemplateStatusUpdate = ProcessedWebhookField<'message_template_status_update'>;
export type ProcessedTemplateCategoryUpdate = ProcessedWebhookField<'template_category_update'>;
export type ProcessedMessageTemplateQualityUpdate = ProcessedWebhookField<'message_template_quality_update'>;
export type ProcessedFlows = ProcessedWebhookField<'flows'>;
export type ProcessedSecurity = ProcessedWebhookField<'security'>;
export type ProcessedHistory = ProcessedWebhookField<'history'>;
export type ProcessedSmbMessageEchoes = ProcessedWebhookField<'smb_message_echoes'>;
export type ProcessedSmbAppStateSync = ProcessedWebhookField<'smb_app_state_sync'>;
export type ProcessedAccountSettingsUpdate = ProcessedWebhookField<'account_settings_update'>;
export type ProcessedAutomaticEvents = ProcessedWebhookField<'automatic_events'>;
export type ProcessedBusinessStatusUpdate = ProcessedWebhookField<'business_status_update'>;
export type ProcessedBusinessUsernameUpdates = ProcessedWebhookField<'business_username_updates'>;
export type ProcessedCalls = ProcessedWebhookField<'calls'>;
export type ProcessedGroupLifecycleUpdate = ProcessedWebhookField<'group_lifecycle_update'>;
export type ProcessedGroupParticipantsUpdate = ProcessedWebhookField<'group_participants_update'>;
export type ProcessedGroupSettingsUpdate = ProcessedWebhookField<'group_settings_update'>;
export type ProcessedGroupStatusUpdate = ProcessedWebhookField<'group_status_update'>;
export type ProcessedMessageEchoes = ProcessedWebhookField<'message_echoes'>;
export type ProcessedMessageTemplateComponentsUpdate = ProcessedWebhookField<'message_template_components_update'>;
export type ProcessedMessagingHandovers = ProcessedWebhookField<'messaging_handovers'>;
export type ProcessedPartnerSolutions = ProcessedWebhookField<'partner_solutions'>;
export type ProcessedPaymentConfigurationUpdate = ProcessedWebhookField<'payment_configuration_update'>;
export type ProcessedStandby = ProcessedWebhookField<'standby'>;
export type ProcessedTemplateCorrectCategoryDetection = ProcessedWebhookField<'template_correct_category_detection'>;
export type ProcessedTrackingEvents = ProcessedWebhookField<'tracking_events'>;
export type ProcessedUserPreferences = ProcessedWebhookField<'user_preferences'>;

// Type-specific processed messages for specialized handlers
export type TextProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Text }>;
};

export type ImageProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Image }>;
};

export type VideoProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Video }>;
};

export type AudioProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Audio }>;
};

export type DocumentProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Document }>;
};

export type StickerProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Sticker }>;
};

export type InteractiveProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Interactive }>;
};

export type ButtonProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Button }>;
};

export type LocationProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Location }>;
};

export type ContactsProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Contacts }>;
};

export type ReactionProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Reaction }>;
};

export type OrderProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Order }>;
};

export type SystemProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.System }>;
};

/**
 * Original HTTP request context for WhatsApp webhook handlers.
 *
 * The `rawBody` and `headers` values preserve the incoming webhook request so
 * callers can forward or verify the request according to Meta's request syntax.
 *
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/create-webhook-endpoint/#request-syntax-1
 */
export type WebhookHandlerContext = {
    /** Original request headers from the incoming webhook request. */
    headers: Headers;
    /** Original request body string before JSON parsing or field filtering. */
    rawBody: string;
    /** Original request method. */
    method: string;
    /** Original request URL. */
    url: string;
};

type WebhookHandler<TProcessed, TReturn = void> = (
    whatsapp: WhatsApp,
    processed: TProcessed,
    context: WebhookHandlerContext,
) => TReturn | Promise<TReturn>;

export type MessageHandler = WebhookHandler<ProcessedMessage>;
export type StatusHandler = WebhookHandler<ProcessedStatus>;
export type UserActionHandler = WebhookHandler<ProcessedUserAction>;
export type FlowHandler = WebhookHandler<FlowEndpointRequest, any>;
export type RawWebhookHandler = WebhookHandler<WebhookPayload>;

/** Handler for a non-`messages` webhook field; `processed.value` is typed by the field name. */
export type WebhookFieldHandler<F extends NonMessageWebhookField> = WebhookHandler<ProcessedWebhookField<F>>;

/** Registered field handlers keyed by field name, as kept by `WebhookProcessor`. */
export type WebhookFieldHandlerMap = ReadonlyMap<NonMessageWebhookField, AnyWebhookFieldHandler>;

/**
 * Field handler with the field type erased, for storage in a map. `on()`
 * guarantees each stored handler matches its key.
 */
// biome-ignore lint/suspicious/noExplicitAny: the value type depends on the map key
type AnyWebhookFieldHandler = WebhookHandler<{ wabaId: string; value: any }>;

// Webhook field handlers
export type AccountUpdateHandler = WebhookFieldHandler<'account_update'>;
export type AccountReviewUpdateHandler = WebhookFieldHandler<'account_review_update'>;
export type AccountAlertsHandler = WebhookFieldHandler<'account_alerts'>;
export type BusinessCapabilityUpdateHandler = WebhookFieldHandler<'business_capability_update'>;
export type PhoneNumberNameUpdateHandler = WebhookFieldHandler<'phone_number_name_update'>;
export type PhoneNumberQualityUpdateHandler = WebhookFieldHandler<'phone_number_quality_update'>;
export type MessageTemplateStatusUpdateHandler = WebhookFieldHandler<'message_template_status_update'>;
export type TemplateCategoryUpdateHandler = WebhookFieldHandler<'template_category_update'>;
export type MessageTemplateQualityUpdateHandler = WebhookFieldHandler<'message_template_quality_update'>;
export type FlowsHandler = WebhookFieldHandler<'flows'>;
export type SecurityHandler = WebhookFieldHandler<'security'>;
export type HistoryHandler = WebhookFieldHandler<'history'>;
export type SmbMessageEchoesHandler = WebhookFieldHandler<'smb_message_echoes'>;
export type SmbAppStateSyncHandler = WebhookFieldHandler<'smb_app_state_sync'>;
export type AccountSettingsUpdateHandler = WebhookFieldHandler<'account_settings_update'>;
export type AutomaticEventsHandler = WebhookFieldHandler<'automatic_events'>;
export type BusinessStatusUpdateHandler = WebhookFieldHandler<'business_status_update'>;
export type BusinessUsernameUpdatesHandler = WebhookFieldHandler<'business_username_updates'>;
export type CallsHandler = WebhookFieldHandler<'calls'>;
export type GroupLifecycleUpdateHandler = WebhookFieldHandler<'group_lifecycle_update'>;
export type GroupParticipantsUpdateHandler = WebhookFieldHandler<'group_participants_update'>;
export type GroupSettingsUpdateHandler = WebhookFieldHandler<'group_settings_update'>;
export type GroupStatusUpdateHandler = WebhookFieldHandler<'group_status_update'>;
export type MessageEchoesHandler = WebhookFieldHandler<'message_echoes'>;
export type MessageTemplateComponentsUpdateHandler = WebhookFieldHandler<'message_template_components_update'>;
export type MessagingHandoversHandler = WebhookFieldHandler<'messaging_handovers'>;
export type PartnerSolutionsHandler = WebhookFieldHandler<'partner_solutions'>;
export type PaymentConfigurationUpdateHandler = WebhookFieldHandler<'payment_configuration_update'>;
export type StandbyHandler = WebhookFieldHandler<'standby'>;
export type TemplateCorrectCategoryDetectionHandler = WebhookFieldHandler<'template_correct_category_detection'>;
export type TrackingEventsHandler = WebhookFieldHandler<'tracking_events'>;
export type UserPreferencesHandler = WebhookFieldHandler<'user_preferences'>;

// Type-specific handlers for specialized methods
export type TextMessageHandler = WebhookHandler<TextProcessedMessage>;
export type ImageMessageHandler = WebhookHandler<ImageProcessedMessage>;
export type VideoMessageHandler = WebhookHandler<VideoProcessedMessage>;
export type AudioMessageHandler = WebhookHandler<AudioProcessedMessage>;
export type DocumentMessageHandler = WebhookHandler<DocumentProcessedMessage>;
export type StickerMessageHandler = WebhookHandler<StickerProcessedMessage>;
export type InteractiveMessageHandler = WebhookHandler<InteractiveProcessedMessage>;
export type ButtonMessageHandler = WebhookHandler<ButtonProcessedMessage>;
export type LocationMessageHandler = WebhookHandler<LocationProcessedMessage>;
export type ContactsMessageHandler = WebhookHandler<ContactsProcessedMessage>;
export type ReactionMessageHandler = WebhookHandler<ReactionProcessedMessage>;
export type OrderMessageHandler = WebhookHandler<OrderProcessedMessage>;
export type SystemMessageHandler = WebhookHandler<SystemProcessedMessage>;

/**
 * Named handler options accepted by {@link processWebhookMessages}, one per
 * webhook field except `messages`. Kept for backward compatibility; new code
 * can pass `fieldHandlers` instead.
 */
export type WebhookFieldHandlerOptions = {
    accountUpdateHandler?: AccountUpdateHandler;
    accountReviewUpdateHandler?: AccountReviewUpdateHandler;
    accountAlertsHandler?: AccountAlertsHandler;
    businessCapabilityUpdateHandler?: BusinessCapabilityUpdateHandler;
    phoneNumberNameUpdateHandler?: PhoneNumberNameUpdateHandler;
    phoneNumberQualityUpdateHandler?: PhoneNumberQualityUpdateHandler;
    messageTemplateStatusUpdateHandler?: MessageTemplateStatusUpdateHandler;
    templateCategoryUpdateHandler?: TemplateCategoryUpdateHandler;
    messageTemplateQualityUpdateHandler?: MessageTemplateQualityUpdateHandler;
    flowsHandler?: FlowsHandler;
    securityHandler?: SecurityHandler;
    historyHandler?: HistoryHandler;
    smbMessageEchoesHandler?: SmbMessageEchoesHandler;
    smbAppStateSyncHandler?: SmbAppStateSyncHandler;
    accountSettingsUpdateHandler?: AccountSettingsUpdateHandler;
    automaticEventsHandler?: AutomaticEventsHandler;
    businessStatusUpdateHandler?: BusinessStatusUpdateHandler;
    businessUsernameUpdatesHandler?: BusinessUsernameUpdatesHandler;
    callsHandler?: CallsHandler;
    groupLifecycleUpdateHandler?: GroupLifecycleUpdateHandler;
    groupParticipantsUpdateHandler?: GroupParticipantsUpdateHandler;
    groupSettingsUpdateHandler?: GroupSettingsUpdateHandler;
    groupStatusUpdateHandler?: GroupStatusUpdateHandler;
    messageEchoesHandler?: MessageEchoesHandler;
    messageTemplateComponentsUpdateHandler?: MessageTemplateComponentsUpdateHandler;
    messagingHandoversHandler?: MessagingHandoversHandler;
    partnerSolutionsHandler?: PartnerSolutionsHandler;
    paymentConfigurationUpdateHandler?: PaymentConfigurationUpdateHandler;
    standbyHandler?: StandbyHandler;
    templateCorrectCategoryDetectionHandler?: TemplateCorrectCategoryDetectionHandler;
    trackingEventsHandler?: TrackingEventsHandler;
    userPreferencesHandler?: UserPreferencesHandler;
};

/** The {@link WebhookFieldHandlerOptions} key whose handler type matches field `F`. */
type HandlerOptionKeyFor<F extends NonMessageWebhookField> = {
    [K in keyof WebhookFieldHandlerOptions]-?: NonNullable<WebhookFieldHandlerOptions[K]> extends WebhookFieldHandler<F>
        ? K
        : never;
}[keyof WebhookFieldHandlerOptions];

/**
 * Registry of every webhook field except `messages`, mapping each field to its
 * named handler option. Dispatch is driven by this table: a field listed here
 * is routed to its handler, anything else is logged as unhandled. Adding a
 * field to `WebhookFieldValueMap` without an entry here fails type checking.
 */
export const WEBHOOK_FIELD_REGISTRY = {
    account_update: 'accountUpdateHandler',
    account_review_update: 'accountReviewUpdateHandler',
    account_alerts: 'accountAlertsHandler',
    account_settings_update: 'accountSettingsUpdateHandler',
    automatic_events: 'automaticEventsHandler',
    business_capability_update: 'businessCapabilityUpdateHandler',
    business_status_update: 'businessStatusUpdateHandler',
    business_username_updates: 'businessUsernameUpdatesHandler',
    calls: 'callsHandler',
    flows: 'flowsHandler',
    group_lifecycle_update: 'groupLifecycleUpdateHandler',
    group_participants_update: 'groupParticipantsUpdateHandler',
    group_settings_update: 'groupSettingsUpdateHandler',
    group_status_update: 'groupStatusUpdateHandler',
    history: 'historyHandler',
    message_echoes: 'messageEchoesHandler',
    message_template_components_update: 'messageTemplateComponentsUpdateHandler',
    message_template_quality_update: 'messageTemplateQualityUpdateHandler',
    message_template_status_update: 'messageTemplateStatusUpdateHandler',
    messaging_handovers: 'messagingHandoversHandler',
    partner_solutions: 'partnerSolutionsHandler',
    payment_configuration_update: 'paymentConfigurationUpdateHandler',
    phone_number_name_update: 'phoneNumberNameUpdateHandler',
    phone_number_quality_update: 'phoneNumberQualityUpdateHandler',
    security: 'securityHandler',
    smb_app_state_sync: 'smbAppStateSyncHandler',
    smb_message_echoes: 'smbMessageEchoesHandler',
    standby: 'standbyHandler',
    template_category_update: 'templateCategoryUpdateHandler',
    template_correct_category_detection: 'templateCorrectCategoryDetectionHandler',
    tracking_events: 'trackingEventsHandler',
    user_preferences: 'userPreferencesHandler',
} as const satisfies { [F in NonMessageWebhookField]: HandlerOptionKeyFor<F> };

/** True when `field` is a webhook field other than `messages` that the SDK knows. */
export function isNonMessageWebhookField(field: string): field is NonMessageWebhookField {
    return Object.hasOwn(WEBHOOK_FIELD_REGISTRY, field);
}

/**
 * Dedupe keys for non-`messages` fields that carry a natural id. Fields not
 * listed here are never deduped. A change is a duplicate only when its whole
 * set of ids was seen before.
 */
const FIELD_DEDUPE_KEYS: { [F in NonMessageWebhookField]?: (value: WebhookFieldValueMap[F]) => string | undefined } = {
    calls: (value) =>
        joinDedupeIds(
            'calls',
            mapArray(value?.calls, (call) =>
                call?.id ? `${call.id}:${call.event}${call.call_status ? `:${call.call_status}` : ''}` : undefined,
            ),
        ),
    smb_message_echoes: (value) =>
        joinDedupeIds(
            'smb_message_echoes',
            mapArray(value?.message_echoes, (echo) => echo?.id),
        ),
    message_echoes: (value) =>
        joinDedupeIds(
            'message_echoes',
            mapArray(value?.messaging, (entry) => entry?.message?.mid),
        ),
};

function mapArray<T>(
    items: T[] | undefined,
    fn: (item: T) => string | undefined,
): Array<string | undefined> | undefined {
    return Array.isArray(items) ? items.map(fn) : undefined;
}

function joinDedupeIds(prefix: string, ids: Array<string | undefined> | undefined): string | undefined {
    if (!ids || ids.length === 0 || ids.some((id) => !id)) return undefined;
    return `${prefix}:${ids.join(',')}`;
}

/** Dedupe key for one change of a non-`messages` field, or undefined when it has no natural id. */
export function getWebhookFieldDedupeKey<F extends NonMessageWebhookField>(
    field: F,
    value: WebhookFieldValueMap[F],
): string | undefined {
    const keyFn = FIELD_DEDUPE_KEYS[field] as ((value: WebhookFieldValueMap[F]) => string | undefined) | undefined;
    return keyFn?.(value);
}

/** Dedupe settings for {@link processWebhookMessages}. */
export type WebhookDedupeOptions = {
    store: DedupeStore;
    /** Defaults to 86400 (24 hours). */
    ttlSeconds?: number;
};

/** Options for {@link processWebhookMessages}. */
export type ProcessWebhookOptions = WebhookSignatureOptions & {
    /** Skip handlers for deliveries already seen. Duplicates still get a 200 response. */
    dedupe?: WebhookDedupeOptions;
};

type ResolvedDedupeOptions = { store: DedupeStore; ttlSeconds: number };

/**
 * Claim a dedupe key. Resolves true when the delivery was already seen.
 * Store errors fail open: the delivery is processed and the error is logged.
 */
async function isDuplicateDelivery(
    dedupe: ResolvedDedupeOptions | undefined,
    key: string | undefined,
): Promise<boolean> {
    if (!dedupe || !key) return false;
    try {
        const stored = await dedupe.store.setIfAbsent(key, dedupe.ttlSeconds);
        if (!stored) {
            LOGGER.log(`Skipping duplicate webhook delivery: ${key}`);
            return true;
        }
        return false;
    } catch (error) {
        LOGGER.error('Dedupe store failed; processing the webhook anyway:', { key, error });
        return false;
    }
}

/**
 * Process webhook messages
 */
export async function processWebhookMessages(
    request: Request,
    whatsapp: WhatsApp,
    handlers: {
        messageHandlers: Map<MessageTypesEnum, MessageHandler>;
        statusHandler?: StatusHandler;
        userActionHandler?: UserActionHandler;
        preProcessHandler?: MessageHandler;
        postProcessHandler?: MessageHandler;
        rawHandler?: RawWebhookHandler;
        rawHandlerFields?: WebhookFieldType[];
        /**
         * Handlers for non-`messages` fields keyed by field name. Takes
         * precedence over the named `xxxHandler` option for the same field.
         */
        fieldHandlers?: WebhookFieldHandlerMap;
    } & WebhookFieldHandlerOptions,
    options: ProcessWebhookOptions = {},
): Promise<Response> {
    try {
        const rawBody = await request.text();

        if (options.verifySignature) {
            if (!options.appSecret) {
                LOGGER.error('verifyWebhookSignature is on but appSecret is not configured; rejecting webhook');
                return new Response(JSON.stringify({ error: 'Webhook signature verification misconfigured' }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            if (
                !(await verifyWebhookSignature(rawBody, request.headers.get('x-hub-signature-256'), options.appSecret))
            ) {
                LOGGER.warn('Rejected webhook with missing or invalid X-Hub-Signature-256');
                return new Response(JSON.stringify({ error: 'Invalid signature' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        const body = JSON.parse(rawBody);
        const context: WebhookHandlerContext = {
            headers: request.headers,
            rawBody,
            method: request.method,
            url: request.url,
        };
        const dedupe: ResolvedDedupeOptions | undefined = options.dedupe
            ? { store: options.dedupe.store, ttlSeconds: options.dedupe.ttlSeconds ?? DEFAULT_DEDUPE_TTL_SECONDS }
            : undefined;

        if (handlers.rawHandler) {
            const { rawHandler, rawHandlerFields } = handlers;
            let payload = body as WebhookPayload;
            if (rawHandlerFields && rawHandlerFields.length > 0) {
                const filtered: WebhookPayload = {
                    ...payload,
                    entry: payload.entry
                        .map((entry) => ({
                            ...entry,
                            changes: entry.changes.filter((change) =>
                                rawHandlerFields.includes(change.field as WebhookFieldType),
                            ),
                        }))
                        .filter((entry) => entry.changes.length > 0),
                };
                if (filtered.entry.length === 0) {
                    payload = null as any;
                } else {
                    payload = filtered;
                }
            }
            if (payload) {
                await rawHandler(whatsapp, payload, context);
            }
        }

        // Check this is a WhatsApp Business Account webhook
        if (body.object !== 'whatsapp_business_account') {
            const errorMsg = 'Received webhook for non-WhatsApp event';
            LOGGER.warn(errorMsg);
            return new Response(JSON.stringify({ error: errorMsg }), { status: 404 });
        }

        const errors: string[] = [];

        // Process each entry
        for (const entry of body.entry) {
            try {
                const changes = entry.changes;
                for (const change of changes) {
                    const field: string = change.field;
                    if (field === 'messages') {
                        await processMessages(entry.id, change.value, whatsapp, handlers, context, dedupe);
                    } else if (isNonMessageWebhookField(field)) {
                        const handler =
                            handlers.fieldHandlers?.get(field) ??
                            (handlers[WEBHOOK_FIELD_REGISTRY[field]] as AnyWebhookFieldHandler | undefined);
                        await processWebhookField(
                            entry.id,
                            { field, value: change.value },
                            handler,
                            whatsapp,
                            context,
                            dedupe,
                        );
                    } else {
                        LOGGER.warn(`Unhandled webhook field: ${change.field}`);
                    }
                }
            } catch (error) {
                const errorMsg = `Error processing webhook: ${error}`;
                LOGGER.error(errorMsg, { entry, error });
                errors.push(errorMsg);
            }
        }

        return new Response(errors.length > 0 ? JSON.stringify({ errors }) : null, { status: 200 });
    } catch (error) {
        LOGGER.error('Error processing webhook:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}

/**
 * Create a standard ping response for WhatsApp Flow health checks
 * @returns Flow ping response object
 */
export function createFlowPingResponse() {
    return {
        version: '3.0',
        data: { status: 'active' },
    };
}

/**
 * Create a standard error response for WhatsApp Flow error notifications
 * @returns Acknowledgement response for error notification
 */
export function createFlowErrorResponse() {
    return {
        data: {
            acknowledged: true,
        },
    };
}

/**
 * Handle flow requests
 */
export async function processFlowRequest(
    request: Request,
    config: WabaConfigType,
    whatsapp: WhatsApp,
    flowHandlers: Map<FlowTypeEnum, FlowHandler>,
): Promise<Response> {
    try {
        const body = await request.text();
        const context: WebhookHandlerContext = {
            headers: request.headers,
            rawBody: body,
            method: request.method,
            url: request.url,
        };
        const signature = request.headers.get('x-hub-signature-256');

        // Meta signs Flow requests with the App Secret. Older versions of this SDK
        // keyed the HMAC with the webhook verification token, which never matches
        // a real Meta request; that key is kept only as a fallback when no App
        // Secret is configured.
        const signingKey = config[WabaConfigEnum.AppSecret] || config.WEBHOOK_VERIFICATION_TOKEN || '';
        if (!config[WabaConfigEnum.AppSecret]) {
            LOGGER.warn('appSecret not configured; verifying Flow signature with the webhook verification token');
        }
        if (!(await verifyWebhookSignature(body, signature, signingKey))) {
            LOGGER.warn('Invalid request signature');
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const data = JSON.parse(body);

        // Decrypt the request and get decrypted AES key and IV
        const { decryptedBody, aesKeyBuffer, initialVectorBuffer } = await decryptFlowRequestAsync(data, config);

        // Determine flow type
        const isPing = isFlowPingRequest(decryptedBody);
        const isError = isFlowErrorRequest(decryptedBody);
        const isDataExchange = isFlowDataExchangeRequest(decryptedBody);

        let flowType: FlowTypeEnum;
        if (isPing) {
            flowType = FlowTypeEnum.Ping;
        } else if (isError) {
            flowType = FlowTypeEnum.Error;
        } else if (isDataExchange) {
            flowType = FlowTypeEnum.Change;
        } else {
            flowType = FlowTypeEnum.All;
        }

        // Get the flow handler based on type
        let handler = flowHandlers.get(flowType);

        // For Ping and Error, use default handlers if not registered
        if (!handler) {
            if (flowType === FlowTypeEnum.Ping) {
                handler = () => createFlowPingResponse();
            } else if (flowType === FlowTypeEnum.Error) {
                handler = () => createFlowErrorResponse();
            } else {
                // For Change and other types, try All handler as fallback
                handler = flowHandlers.get(FlowTypeEnum.All);
                if (!handler) {
                    LOGGER.warn('No handler registered for flow type:', { flowType, action: decryptedBody.action });
                    return new Response(JSON.stringify({ error: 'Handler not found' }), { status: 404 });
                }
            }
        }

        // Call the user's handler for the flow type
        const result = await handler(whatsapp, decryptedBody, context);

        // Return response based on flow type
        if (isError) {
            LOGGER.warn('Flow error notification received', { error: decryptedBody.data });

            // If user handler didn't return a response, use default acknowledgement
            const errorResponse = result || createFlowErrorResponse();

            return new Response(JSON.stringify(errorResponse), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Both ping and data_exchange responses need to be encrypted
        if (isPing || isDataExchange) {
            // Encrypt the response using decrypted AES key and IV
            const encryptedResponse = await encryptFlowResponseAsync(result, aesKeyBuffer, initialVectorBuffer);

            // Meta expects the encrypted response as a plain base64 string (not wrapped in JSON)
            return new Response(encryptedResponse, {
                status: 200,
                headers: { 'Content-Type': 'text/plain' },
            });
        }

        LOGGER.warn('Unknown flow request type:', decryptedBody);
        return new Response(JSON.stringify({ error: 'Unknown request type' }), { status: 400 });
    } catch (error) {
        LOGGER.error('Error handling flow request:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}

export type WebhookSignatureOptions = {
    /** Meta App Secret used as the HMAC key. */
    appSecret?: string;
    /** When true, reject requests without a valid `X-Hub-Signature-256`. */
    verifySignature?: boolean;
};

/**
 * Check an `X-Hub-Signature-256` header (`sha256=<hex>`) against the raw
 * request body using Web Crypto, so it works on every runtime. Constant-time;
 * resolves to false instead of throwing on malformed or wrong-length input.
 */
export async function verifyWebhookSignature(
    rawBody: string,
    signatureHeader: string | null,
    appSecret: string,
): Promise<boolean> {
    if (!signatureHeader || !appSecret) return false;
    const provided = signatureHeader.startsWith('sha256=') ? signatureHeader.slice(7) : signatureHeader;
    const expected = await hmacSha256Hex(appSecret, rawBody);
    return timingSafeEqualString(provided.toLowerCase(), expected);
}

/**
 * Synchronous variant of {@link verifyWebhookSignature}. Needs `node:crypto`
 * (Node.js >= 20.12, Bun, Deno); prefer the async variant on edge runtimes.
 */
export function isValidWebhookSignature(rawBody: string, signatureHeader: string | null, appSecret: string): boolean {
    if (!signatureHeader || !appSecret) return false;
    const crypto = requireNodeCrypto('isValidWebhookSignature');
    const provided = signatureHeader.startsWith('sha256=') ? signatureHeader.slice(7) : signatureHeader;
    const expected = crypto.createHmac('sha256', appSecret).update(rawBody, 'utf8').digest('hex');
    return timingSafeEqualString(provided.toLowerCase(), expected);
}

/**
 * Constructs a full URL from framework-specific request headers and URL
 * @param headers - Request headers containing host and protocol information
 * @param url - Relative URL path
 * @returns Full URL string
 */
export function constructFullUrl(headers: Record<string, string | string[] | undefined>, url?: string): string {
    const protocol = headers['x-forwarded-proto'] || 'http';
    const host = headers.host || 'localhost';
    const path = url || '/';
    return `${protocol}://${host}${path}`;
}

/**
 * Extract message ID based on message type
 * Some message types (like nfm_reply) have ID in context instead of root level
 */
function extractMessageId(message: WhatsAppMessage): string {
    // If message has id at root level, use it
    if (message.id) {
        return message.id;
    }

    // For interactive and button messages, check context.id
    if (message.type === MessageTypesEnum.Interactive || message.type === MessageTypesEnum.Button) {
        if ('context' in message && message.context?.id) {
            return message.context.id;
        }
    }

    // Fallback to empty string if no ID found
    return '';
}

/**
 * Private helper functions
 */
async function processMessages(
    waba_id: string,
    value: WebhookValue,
    whatsapp: WhatsApp,
    handlers: {
        messageHandlers: Map<MessageTypesEnum, MessageHandler>;
        statusHandler?: StatusHandler;
        userActionHandler?: UserActionHandler;
        preProcessHandler?: MessageHandler;
        postProcessHandler?: MessageHandler;
    },
    context: WebhookHandlerContext,
    dedupe?: ResolvedDedupeOptions,
): Promise<void> {
    const metadata = value.metadata;
    const wabaId = waba_id;
    const displayPhoneNumber = metadata.display_phone_number;
    const phoneNumberId = metadata.phone_number_id;

    // Handle marketing message user actions (link clicks, landing page views)
    if ('user_actions' in value && value.user_actions) {
        const userActionsValue = value as UserActionsWebhookValue;
        for (const action of userActionsValue.user_actions) {
            const processed: ProcessedUserAction = {
                wabaId,
                phoneNumberId,
                displayPhoneNumber,
                action,
            };

            await executeUserActionHandler(handlers.userActionHandler, whatsapp, processed, context);
        }
        return;
    }

    // Handle status webhooks
    if ('statuses' in value && value.statuses) {
        const statusValue = value as StatusWebhookValue;
        for (const status of statusValue.statuses) {
            if (!handlers.statusHandler) continue;
            if (await isDuplicateDelivery(dedupe, status.id ? `status:${status.id}:${status.status}` : undefined)) {
                continue;
            }
            const processed: ProcessedStatus = {
                wabaId,
                phoneNumberId,
                displayPhoneNumber,
                status,
            };

            await executeStatusHandler(handlers.statusHandler, whatsapp, processed, context);
        }
        return;
    }

    // Handle message webhooks
    if ('messages' in value && value.messages) {
        const messageValue = value as MessageWebhookValue;
        const profileName = messageValue.contacts?.[0]?.profile?.name || '';

        for (const message of messageValue.messages) {
            const processed: ProcessedMessage = {
                wabaId,
                phoneNumberId,
                displayPhoneNumber,
                profileName,
                message,
                messageId: extractMessageId(message),
                ...(messageValue.conversation_context && { conversationContext: messageValue.conversation_context }),
            };

            const messageType = message.type;
            const messageHandler = handlers.messageHandlers.get(messageType);
            if (!handlers.preProcessHandler && !messageHandler && !handlers.postProcessHandler) continue;
            if (await isDuplicateDelivery(dedupe, processed.messageId ? `message:${processed.messageId}` : undefined)) {
                continue;
            }

            // Execute handlers in sequence
            await executeMessageHandler(handlers.preProcessHandler, whatsapp, processed, context, 'pre-process');
            await executeMessageHandler(messageHandler, whatsapp, processed, context, messageType);
            await executeMessageHandler(handlers.postProcessHandler, whatsapp, processed, context, 'post-process');
        }
    }
}

async function executeMessageHandler(
    handler: MessageHandler | undefined,
    whatsapp: WhatsApp,
    processed: ProcessedMessage,
    context: WebhookHandlerContext,
    handlerType: string,
): Promise<void> {
    if (handler) {
        try {
            await handler(whatsapp, processed, context);
        } catch (error) {
            LOGGER.error(`Error in ${handlerType} handler:`, { error, messageId: processed.messageId });
        }
    }
}

async function executeStatusHandler(
    handler: StatusHandler | undefined,
    whatsapp: WhatsApp,
    processed: ProcessedStatus,
    context: WebhookHandlerContext,
): Promise<void> {
    if (handler) {
        try {
            await handler(whatsapp, processed, context);
        } catch (error) {
            LOGGER.error('Error in status handler:', { error, statusId: processed.status.id });
        }
    }
}

async function executeUserActionHandler(
    handler: UserActionHandler | undefined,
    whatsapp: WhatsApp,
    processed: ProcessedUserAction,
    context: WebhookHandlerContext,
): Promise<void> {
    if (handler) {
        try {
            await handler(whatsapp, processed, context);
        } catch (error) {
            LOGGER.error('Error in user action handler:', { error, actionType: processed.action.action_type });
        }
    }
}

/**
 * Generic webhook field processor
 * Processes webhook fields other than 'messages'
 */
async function processWebhookField<F extends NonMessageWebhookField>(
    wabaId: string,
    webhookValue: { field: F; value: WebhookFieldValueMap[F] },
    handler: WebhookFieldHandler<F> | AnyWebhookFieldHandler | undefined,
    whatsapp: WhatsApp,
    context: WebhookHandlerContext,
    dedupe?: ResolvedDedupeOptions,
): Promise<void> {
    if (!handler) return;
    if (await isDuplicateDelivery(dedupe, getWebhookFieldDedupeKey(webhookValue.field, webhookValue.value))) return;
    try {
        await handler(
            whatsapp,
            {
                wabaId,
                value: webhookValue.value,
            },
            context,
        );
    } catch (error) {
        LOGGER.error(`Error in ${webhookValue.field} handler:`, { error, wabaId });
    }
}
