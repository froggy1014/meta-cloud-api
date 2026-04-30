import crypto from 'node:crypto';

import type { FlowEndpointRequest } from '../../../api/flow';
import { FlowTypeEnum } from '../../../api/flow/types';
import type { WabaConfigType } from '../../../types/config';
import { MessageTypesEnum } from '../../../types/enums';
import { decryptFlowRequest, encryptFlowResponse } from '../../../utils/flowEncryptionUtils';
import { isFlowDataExchangeRequest, isFlowErrorRequest, isFlowPingRequest } from '../../../utils/flowTypeGuards';
import Logger from '../../../utils/logger';
import type WhatsApp from '../../whatsapp/WhatsApp';
import type {
    AccountAlertsWebhookValue,
    AccountReviewUpdateWebhookValue,
    AccountSettingsUpdateWebhookValue,
    AccountUpdateWebhookValue,
    AutomaticEventsWebhookValue,
    BusinessCapabilityUpdateWebhookValue,
    BusinessStatusUpdateWebhookValue,
    CallsWebhookValue,
    FlowsWebhookValue,
    GroupLifecycleUpdateWebhookValue,
    GroupParticipantsUpdateWebhookValue,
    GroupSettingsUpdateWebhookValue,
    GroupStatusUpdateWebhookValue,
    HistoryWebhookValue,
    MessageEchoesWebhookValue,
    MessageTemplateComponentsUpdateWebhookValue,
    MessageTemplateQualityUpdateWebhookValue,
    MessageTemplateStatusUpdateWebhookValue,
    MessageWebhookValue,
    MessagingHandoversWebhookValue,
    PartnerSolutionsWebhookValue,
    PaymentConfigurationUpdateWebhookValue,
    PhoneNumberNameUpdateWebhookValue,
    PhoneNumberQualityUpdateWebhookValue,
    SecurityWebhookValue,
    SmbAppStateSyncWebhookValue,
    SmbMessageEchoesWebhookValue,
    StandbyWebhookValue,
    StatusWebhook,
    StatusWebhookValue,
    TemplateCategoryUpdateWebhookValue,
    TemplateCorrectCategoryDetectionWebhookValue,
    TrackingEventsWebhookValue,
    UserPreferencesWebhookValue,
    WebhookFieldType,
    WebhookPayload,
    WebhookValue,
    WhatsAppMessage,
} from '../types';

const LIB_NAME = 'WEBHOOK_UTILS';
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true');

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
 * Processed webhook field types for specialized handlers
 */
export type ProcessedAccountUpdate = {
    wabaId: string;
    value: AccountUpdateWebhookValue['value'];
};

export type ProcessedAccountReviewUpdate = {
    wabaId: string;
    value: AccountReviewUpdateWebhookValue['value'];
};

export type ProcessedAccountAlerts = {
    wabaId: string;
    value: AccountAlertsWebhookValue['value'];
};

export type ProcessedBusinessCapabilityUpdate = {
    wabaId: string;
    value: BusinessCapabilityUpdateWebhookValue['value'];
};

export type ProcessedPhoneNumberNameUpdate = {
    wabaId: string;
    value: PhoneNumberNameUpdateWebhookValue['value'];
};

export type ProcessedPhoneNumberQualityUpdate = {
    wabaId: string;
    value: PhoneNumberQualityUpdateWebhookValue['value'];
};

export type ProcessedMessageTemplateStatusUpdate = {
    wabaId: string;
    value: MessageTemplateStatusUpdateWebhookValue['value'];
};

export type ProcessedTemplateCategoryUpdate = {
    wabaId: string;
    value: TemplateCategoryUpdateWebhookValue['value'];
};

export type ProcessedMessageTemplateQualityUpdate = {
    wabaId: string;
    value: MessageTemplateQualityUpdateWebhookValue['value'];
};

export type ProcessedFlows = {
    wabaId: string;
    value: FlowsWebhookValue['value'];
};

export type ProcessedSecurity = {
    wabaId: string;
    value: SecurityWebhookValue['value'];
};

export type ProcessedHistory = {
    wabaId: string;
    value: HistoryWebhookValue['value'];
};

export type ProcessedSmbMessageEchoes = {
    wabaId: string;
    value: SmbMessageEchoesWebhookValue['value'];
};

export type ProcessedSmbAppStateSync = {
    wabaId: string;
    value: SmbAppStateSyncWebhookValue['value'];
};

export type ProcessedAccountSettingsUpdate = {
    wabaId: string;
    value: AccountSettingsUpdateWebhookValue['value'];
};

export type ProcessedAutomaticEvents = {
    wabaId: string;
    value: AutomaticEventsWebhookValue['value'];
};

export type ProcessedBusinessStatusUpdate = {
    wabaId: string;
    value: BusinessStatusUpdateWebhookValue['value'];
};

export type ProcessedCalls = {
    wabaId: string;
    value: CallsWebhookValue['value'];
};

export type ProcessedGroupLifecycleUpdate = {
    wabaId: string;
    value: GroupLifecycleUpdateWebhookValue['value'];
};

export type ProcessedGroupParticipantsUpdate = {
    wabaId: string;
    value: GroupParticipantsUpdateWebhookValue['value'];
};

export type ProcessedGroupSettingsUpdate = {
    wabaId: string;
    value: GroupSettingsUpdateWebhookValue['value'];
};

export type ProcessedGroupStatusUpdate = {
    wabaId: string;
    value: GroupStatusUpdateWebhookValue['value'];
};

export type ProcessedMessageEchoes = {
    wabaId: string;
    value: MessageEchoesWebhookValue['value'];
};

export type ProcessedMessageTemplateComponentsUpdate = {
    wabaId: string;
    value: MessageTemplateComponentsUpdateWebhookValue['value'];
};

export type ProcessedMessagingHandovers = {
    wabaId: string;
    value: MessagingHandoversWebhookValue['value'];
};

export type ProcessedPartnerSolutions = {
    wabaId: string;
    value: PartnerSolutionsWebhookValue['value'];
};

export type ProcessedPaymentConfigurationUpdate = {
    wabaId: string;
    value: PaymentConfigurationUpdateWebhookValue['value'];
};

export type ProcessedStandby = {
    wabaId: string;
    value: StandbyWebhookValue['value'];
};

export type ProcessedTemplateCorrectCategoryDetection = {
    wabaId: string;
    value: TemplateCorrectCategoryDetectionWebhookValue['value'];
};

export type ProcessedTrackingEvents = {
    wabaId: string;
    value: TrackingEventsWebhookValue['value'];
};

export type ProcessedUserPreferences = {
    wabaId: string;
    value: UserPreferencesWebhookValue['value'];
};

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
export type FlowHandler = WebhookHandler<FlowEndpointRequest, any>;
export type RawWebhookHandler = WebhookHandler<WebhookPayload>;

// Webhook field handlers
export type AccountUpdateHandler = WebhookHandler<ProcessedAccountUpdate>;
export type AccountReviewUpdateHandler = WebhookHandler<ProcessedAccountReviewUpdate>;
export type AccountAlertsHandler = WebhookHandler<ProcessedAccountAlerts>;
export type BusinessCapabilityUpdateHandler = WebhookHandler<ProcessedBusinessCapabilityUpdate>;
export type PhoneNumberNameUpdateHandler = WebhookHandler<ProcessedPhoneNumberNameUpdate>;
export type PhoneNumberQualityUpdateHandler = WebhookHandler<ProcessedPhoneNumberQualityUpdate>;
export type MessageTemplateStatusUpdateHandler = WebhookHandler<ProcessedMessageTemplateStatusUpdate>;
export type TemplateCategoryUpdateHandler = WebhookHandler<ProcessedTemplateCategoryUpdate>;
export type MessageTemplateQualityUpdateHandler = WebhookHandler<ProcessedMessageTemplateQualityUpdate>;
export type FlowsHandler = WebhookHandler<ProcessedFlows>;
export type SecurityHandler = WebhookHandler<ProcessedSecurity>;
export type HistoryHandler = WebhookHandler<ProcessedHistory>;
export type SmbMessageEchoesHandler = WebhookHandler<ProcessedSmbMessageEchoes>;
export type SmbAppStateSyncHandler = WebhookHandler<ProcessedSmbAppStateSync>;
export type AccountSettingsUpdateHandler = WebhookHandler<ProcessedAccountSettingsUpdate>;
export type AutomaticEventsHandler = WebhookHandler<ProcessedAutomaticEvents>;
export type BusinessStatusUpdateHandler = WebhookHandler<ProcessedBusinessStatusUpdate>;
export type CallsHandler = WebhookHandler<ProcessedCalls>;
export type GroupLifecycleUpdateHandler = WebhookHandler<ProcessedGroupLifecycleUpdate>;
export type GroupParticipantsUpdateHandler = WebhookHandler<ProcessedGroupParticipantsUpdate>;
export type GroupSettingsUpdateHandler = WebhookHandler<ProcessedGroupSettingsUpdate>;
export type GroupStatusUpdateHandler = WebhookHandler<ProcessedGroupStatusUpdate>;
export type MessageEchoesHandler = WebhookHandler<ProcessedMessageEchoes>;
export type MessageTemplateComponentsUpdateHandler = WebhookHandler<ProcessedMessageTemplateComponentsUpdate>;
export type MessagingHandoversHandler = WebhookHandler<ProcessedMessagingHandovers>;
export type PartnerSolutionsHandler = WebhookHandler<ProcessedPartnerSolutions>;
export type PaymentConfigurationUpdateHandler = WebhookHandler<ProcessedPaymentConfigurationUpdate>;
export type StandbyHandler = WebhookHandler<ProcessedStandby>;
export type TemplateCorrectCategoryDetectionHandler = WebhookHandler<ProcessedTemplateCorrectCategoryDetection>;
export type TrackingEventsHandler = WebhookHandler<ProcessedTrackingEvents>;
export type UserPreferencesHandler = WebhookHandler<ProcessedUserPreferences>;

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
 * Process webhook messages
 */
export async function processWebhookMessages(
    request: Request,
    whatsapp: WhatsApp,
    handlers: {
        messageHandlers: Map<MessageTypesEnum, MessageHandler>;
        statusHandler?: StatusHandler;
        preProcessHandler?: MessageHandler;
        postProcessHandler?: MessageHandler;
        rawHandler?: RawWebhookHandler;
        rawHandlerFields?: WebhookFieldType[];
        // Webhook field handlers
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
    },
): Promise<Response> {
    try {
        const rawBody = await request.text();
        const body = JSON.parse(rawBody);
        const context: WebhookHandlerContext = {
            headers: request.headers,
            rawBody,
            method: request.method,
            url: request.url,
        };

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
                    if (change.field === 'messages') {
                        await processMessages(entry.id, change.value, whatsapp, handlers, context);
                    } else if (change.field === 'account_update') {
                        await processWebhookField(
                            entry.id,
                            change as AccountUpdateWebhookValue,
                            handlers.accountUpdateHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'account_review_update') {
                        await processWebhookField(
                            entry.id,
                            change as AccountReviewUpdateWebhookValue,
                            handlers.accountReviewUpdateHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'account_alerts') {
                        await processWebhookField(
                            entry.id,
                            change as AccountAlertsWebhookValue,
                            handlers.accountAlertsHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'business_capability_update') {
                        await processWebhookField(
                            entry.id,
                            change as BusinessCapabilityUpdateWebhookValue,
                            handlers.businessCapabilityUpdateHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'phone_number_name_update') {
                        await processWebhookField(
                            entry.id,
                            change as PhoneNumberNameUpdateWebhookValue,
                            handlers.phoneNumberNameUpdateHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'phone_number_quality_update') {
                        await processWebhookField(
                            entry.id,
                            change as PhoneNumberQualityUpdateWebhookValue,
                            handlers.phoneNumberQualityUpdateHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'message_template_status_update') {
                        await processWebhookField(
                            entry.id,
                            change as MessageTemplateStatusUpdateWebhookValue,
                            handlers.messageTemplateStatusUpdateHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'template_category_update') {
                        await processWebhookField(
                            entry.id,
                            change as TemplateCategoryUpdateWebhookValue,
                            handlers.templateCategoryUpdateHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'message_template_quality_update') {
                        await processWebhookField(
                            entry.id,
                            change as MessageTemplateQualityUpdateWebhookValue,
                            handlers.messageTemplateQualityUpdateHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'flows') {
                        await processWebhookField(
                            entry.id,
                            change as FlowsWebhookValue,
                            handlers.flowsHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'security') {
                        await processWebhookField(
                            entry.id,
                            change as SecurityWebhookValue,
                            handlers.securityHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'history') {
                        await processWebhookField(
                            entry.id,
                            change as HistoryWebhookValue,
                            handlers.historyHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'smb_message_echoes') {
                        await processWebhookField(
                            entry.id,
                            change as SmbMessageEchoesWebhookValue,
                            handlers.smbMessageEchoesHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'smb_app_state_sync') {
                        await processWebhookField(
                            entry.id,
                            change as SmbAppStateSyncWebhookValue,
                            handlers.smbAppStateSyncHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'account_settings_update') {
                        await processWebhookField(
                            entry.id,
                            change as AccountSettingsUpdateWebhookValue,
                            handlers.accountSettingsUpdateHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'automatic_events') {
                        await processWebhookField(
                            entry.id,
                            change as AutomaticEventsWebhookValue,
                            handlers.automaticEventsHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'business_status_update') {
                        await processWebhookField(
                            entry.id,
                            change as BusinessStatusUpdateWebhookValue,
                            handlers.businessStatusUpdateHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'calls') {
                        await processWebhookField(
                            entry.id,
                            change as CallsWebhookValue,
                            handlers.callsHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'group_lifecycle_update') {
                        await processWebhookField(
                            entry.id,
                            change as GroupLifecycleUpdateWebhookValue,
                            handlers.groupLifecycleUpdateHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'group_participants_update') {
                        await processWebhookField(
                            entry.id,
                            change as GroupParticipantsUpdateWebhookValue,
                            handlers.groupParticipantsUpdateHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'group_settings_update') {
                        await processWebhookField(
                            entry.id,
                            change as GroupSettingsUpdateWebhookValue,
                            handlers.groupSettingsUpdateHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'group_status_update') {
                        await processWebhookField(
                            entry.id,
                            change as GroupStatusUpdateWebhookValue,
                            handlers.groupStatusUpdateHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'message_echoes') {
                        await processWebhookField(
                            entry.id,
                            change as MessageEchoesWebhookValue,
                            handlers.messageEchoesHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'message_template_components_update') {
                        await processWebhookField(
                            entry.id,
                            change as MessageTemplateComponentsUpdateWebhookValue,
                            handlers.messageTemplateComponentsUpdateHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'messaging_handovers') {
                        await processWebhookField(
                            entry.id,
                            change as MessagingHandoversWebhookValue,
                            handlers.messagingHandoversHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'partner_solutions') {
                        await processWebhookField(
                            entry.id,
                            change as PartnerSolutionsWebhookValue,
                            handlers.partnerSolutionsHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'payment_configuration_update') {
                        await processWebhookField(
                            entry.id,
                            change as PaymentConfigurationUpdateWebhookValue,
                            handlers.paymentConfigurationUpdateHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'standby') {
                        await processWebhookField(
                            entry.id,
                            change as StandbyWebhookValue,
                            handlers.standbyHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'template_correct_category_detection') {
                        await processWebhookField(
                            entry.id,
                            change as TemplateCorrectCategoryDetectionWebhookValue,
                            handlers.templateCorrectCategoryDetectionHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'tracking_events') {
                        await processWebhookField(
                            entry.id,
                            change as TrackingEventsWebhookValue,
                            handlers.trackingEventsHandler,
                            whatsapp,
                            context,
                        );
                    } else if (change.field === 'user_preferences') {
                        await processWebhookField(
                            entry.id,
                            change as UserPreferencesWebhookValue,
                            handlers.userPreferencesHandler,
                            whatsapp,
                            context,
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

        // Validate request signature
        if (!verifySignature(body, signature, config.WEBHOOK_VERIFICATION_TOKEN || '')) {
            LOGGER.warn('Invalid request signature');
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const data = JSON.parse(body);

        // Decrypt the request and get decrypted AES key and IV
        const { decryptedBody, aesKeyBuffer, initialVectorBuffer } = decryptFlowRequest(data, config);

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
            const encryptedResponse = encryptFlowResponse(result, aesKeyBuffer, initialVectorBuffer);

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

/**
 * Verify webhook signature
 */
function verifySignature(body: string, signature: string | null, verificationToken: string): boolean {
    if (!signature) {
        LOGGER.warn('Missing signature in request');
        return false;
    }

    const expectedSignature = crypto.createHmac('sha256', verificationToken).update(body).digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature.replace('sha256=', '')), Buffer.from(expectedSignature));
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
        preProcessHandler?: MessageHandler;
        postProcessHandler?: MessageHandler;
    },
    context: WebhookHandlerContext,
): Promise<void> {
    const metadata = value.metadata;
    const wabaId = waba_id;
    const displayPhoneNumber = metadata.display_phone_number;
    const phoneNumberId = metadata.phone_number_id;

    // Handle status webhooks
    if ('statuses' in value && value.statuses) {
        const statusValue = value as StatusWebhookValue;
        for (const status of statusValue.statuses) {
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
            };

            const messageType = message.type;

            // Execute handlers in sequence
            await executeMessageHandler(handlers.preProcessHandler, whatsapp, processed, context, 'pre-process');
            await executeMessageHandler(
                handlers.messageHandlers.get(messageType),
                whatsapp,
                processed,
                context,
                messageType,
            );
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

/**
 * Generic webhook field processor
 * Processes webhook fields other than 'messages'
 */
async function processWebhookField<T extends { field: string; value: any }>(
    wabaId: string,
    webhookValue: T,
    handler:
        | ((
              whatsapp: WhatsApp,
              processed: { wabaId: string; value: T['value'] },
              context: WebhookHandlerContext,
          ) => void | Promise<void>)
        | undefined,
    whatsapp: WhatsApp,
    context: WebhookHandlerContext,
): Promise<void> {
    if (handler) {
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
}
