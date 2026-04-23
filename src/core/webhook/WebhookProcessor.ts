import type { FlowTypeEnum } from '../../api/flow/types';
import { importConfig } from '../../config/importConfig';
import type { WabaConfigType, WhatsAppConfig } from '../../types/config';
import { MessageTypesEnum } from '../../types/enums';
import Logger from '../../utils/logger';
import { WhatsApp } from '../whatsapp';

import {
    type AccountAlertsHandler,
    type AccountReviewUpdateHandler,
    type AccountSettingsUpdateHandler,
    type AccountUpdateHandler,
    type AudioMessageHandler,
    type AutomaticEventsHandler,
    type BusinessCapabilityUpdateHandler,
    type BusinessStatusUpdateHandler,
    type ButtonMessageHandler,
    type CallsHandler,
    type ContactsMessageHandler,
    type DocumentMessageHandler,
    type FlowHandler,
    type FlowsHandler,
    type GroupLifecycleUpdateHandler,
    type GroupParticipantsUpdateHandler,
    type GroupSettingsUpdateHandler,
    type GroupStatusUpdateHandler,
    type HistoryHandler,
    type ImageMessageHandler,
    type InteractiveMessageHandler,
    type LocationMessageHandler,
    type MessageEchoesHandler,
    type MessageHandler,
    type MessageTemplateComponentsUpdateHandler,
    type MessageTemplateQualityUpdateHandler,
    type MessageTemplateStatusUpdateHandler,
    type MessagingHandoversHandler,
    type OrderMessageHandler,
    type PartnerSolutionsHandler,
    type PaymentConfigurationUpdateHandler,
    type PhoneNumberNameUpdateHandler,
    type PhoneNumberQualityUpdateHandler,
    processFlowRequest,
    processWebhookMessages,
    type ReactionMessageHandler,
    type SecurityHandler,
    type SmbAppStateSyncHandler,
    type SmbMessageEchoesHandler,
    type StandbyHandler,
    type StatusHandler,
    type StickerMessageHandler,
    type SystemMessageHandler,
    type TemplateCategoryUpdateHandler,
    type TemplateCorrectCategoryDetectionHandler,
    type TextMessageHandler,
    type TrackingEventsHandler,
    type UserPreferencesHandler,
    type VideoMessageHandler,
} from './utils/webhookUtils';

const LOGGER = new Logger('WEBHOOK_PROCESSOR', process.env.DEBUG === 'true');

export interface WebhookResponse {
    status: number;
    body: string;
    headers: Record<string, string>;
}

export class WebhookProcessor {
    private config: WabaConfigType;
    private client: WhatsApp;
    private messageHandlers: Map<MessageTypesEnum, MessageHandler> = new Map();
    private statusHandler: StatusHandler | undefined = undefined;
    private preProcessHandler: MessageHandler | undefined = undefined;
    private postProcessHandler: MessageHandler | undefined = undefined;
    private flowHandlers: Map<FlowTypeEnum, FlowHandler> = new Map();

    // Webhook field handlers
    private accountUpdateHandler: AccountUpdateHandler | undefined = undefined;
    private accountReviewUpdateHandler: AccountReviewUpdateHandler | undefined = undefined;
    private accountAlertsHandler: AccountAlertsHandler | undefined = undefined;
    private businessCapabilityUpdateHandler: BusinessCapabilityUpdateHandler | undefined = undefined;
    private phoneNumberNameUpdateHandler: PhoneNumberNameUpdateHandler | undefined = undefined;
    private phoneNumberQualityUpdateHandler: PhoneNumberQualityUpdateHandler | undefined = undefined;
    private messageTemplateStatusUpdateHandler: MessageTemplateStatusUpdateHandler | undefined = undefined;
    private templateCategoryUpdateHandler: TemplateCategoryUpdateHandler | undefined = undefined;
    private messageTemplateQualityUpdateHandler: MessageTemplateQualityUpdateHandler | undefined = undefined;
    private flowsHandler: FlowsHandler | undefined = undefined;
    private securityHandler: SecurityHandler | undefined = undefined;
    private historyHandler: HistoryHandler | undefined = undefined;
    private smbMessageEchoesHandler: SmbMessageEchoesHandler | undefined = undefined;
    private smbAppStateSyncHandler: SmbAppStateSyncHandler | undefined = undefined;
    private accountSettingsUpdateHandler: AccountSettingsUpdateHandler | undefined = undefined;
    private automaticEventsHandler: AutomaticEventsHandler | undefined = undefined;
    private businessStatusUpdateHandler: BusinessStatusUpdateHandler | undefined = undefined;
    private callsHandler: CallsHandler | undefined = undefined;
    private groupLifecycleUpdateHandler: GroupLifecycleUpdateHandler | undefined = undefined;
    private groupParticipantsUpdateHandler: GroupParticipantsUpdateHandler | undefined = undefined;
    private groupSettingsUpdateHandler: GroupSettingsUpdateHandler | undefined = undefined;
    private groupStatusUpdateHandler: GroupStatusUpdateHandler | undefined = undefined;
    private messageEchoesHandler: MessageEchoesHandler | undefined = undefined;
    private messageTemplateComponentsUpdateHandler: MessageTemplateComponentsUpdateHandler | undefined = undefined;
    private messagingHandoversHandler: MessagingHandoversHandler | undefined = undefined;
    private partnerSolutionsHandler: PartnerSolutionsHandler | undefined = undefined;
    private paymentConfigurationUpdateHandler: PaymentConfigurationUpdateHandler | undefined = undefined;
    private standbyHandler: StandbyHandler | undefined = undefined;
    private templateCorrectCategoryDetectionHandler: TemplateCorrectCategoryDetectionHandler | undefined = undefined;
    private trackingEventsHandler: TrackingEventsHandler | undefined = undefined;
    private userPreferencesHandler: UserPreferencesHandler | undefined = undefined;

    constructor(config: WhatsAppConfig) {
        this.config = importConfig(config);
        this.client = new WhatsApp(config);
        LOGGER.log('WebhookProcessor instantiated');
    }

    async processVerification(
        mode: string | null,
        token: string | null,
        challenge: string | null,
    ): Promise<WebhookResponse> {
        if (mode === 'subscribe' && token === this.config.WEBHOOK_VERIFICATION_TOKEN) {
            return {
                status: 200,
                body: challenge || '',
                headers: { 'Content-Type': 'text/plain' },
            };
        }

        return {
            status: 403,
            body: JSON.stringify({ error: 'Forbidden' }),
            headers: { 'Content-Type': 'application/json' },
        };
    }

    async processWebhook(request: Request): Promise<WebhookResponse> {
        try {
            const webResponse = await processWebhookMessages(request, this.client, {
                messageHandlers: this.messageHandlers,
                statusHandler: this.statusHandler,
                preProcessHandler: this.preProcessHandler,
                postProcessHandler: this.postProcessHandler,
                // Webhook field handlers
                accountUpdateHandler: this.accountUpdateHandler,
                accountReviewUpdateHandler: this.accountReviewUpdateHandler,
                accountAlertsHandler: this.accountAlertsHandler,
                businessCapabilityUpdateHandler: this.businessCapabilityUpdateHandler,
                phoneNumberNameUpdateHandler: this.phoneNumberNameUpdateHandler,
                phoneNumberQualityUpdateHandler: this.phoneNumberQualityUpdateHandler,
                messageTemplateStatusUpdateHandler: this.messageTemplateStatusUpdateHandler,
                templateCategoryUpdateHandler: this.templateCategoryUpdateHandler,
                messageTemplateQualityUpdateHandler: this.messageTemplateQualityUpdateHandler,
                flowsHandler: this.flowsHandler,
                securityHandler: this.securityHandler,
                historyHandler: this.historyHandler,
                smbMessageEchoesHandler: this.smbMessageEchoesHandler,
                smbAppStateSyncHandler: this.smbAppStateSyncHandler,
                accountSettingsUpdateHandler: this.accountSettingsUpdateHandler,
                automaticEventsHandler: this.automaticEventsHandler,
                businessStatusUpdateHandler: this.businessStatusUpdateHandler,
                callsHandler: this.callsHandler,
                groupLifecycleUpdateHandler: this.groupLifecycleUpdateHandler,
                groupParticipantsUpdateHandler: this.groupParticipantsUpdateHandler,
                groupSettingsUpdateHandler: this.groupSettingsUpdateHandler,
                groupStatusUpdateHandler: this.groupStatusUpdateHandler,
                messageEchoesHandler: this.messageEchoesHandler,
                messageTemplateComponentsUpdateHandler: this.messageTemplateComponentsUpdateHandler,
                messagingHandoversHandler: this.messagingHandoversHandler,
                partnerSolutionsHandler: this.partnerSolutionsHandler,
                paymentConfigurationUpdateHandler: this.paymentConfigurationUpdateHandler,
                standbyHandler: this.standbyHandler,
                templateCorrectCategoryDetectionHandler: this.templateCorrectCategoryDetectionHandler,
                trackingEventsHandler: this.trackingEventsHandler,
                userPreferencesHandler: this.userPreferencesHandler,
            });

            const body = await webResponse.text();
            const contentType = webResponse.headers.get('content-type') || 'application/json';

            return {
                status: webResponse.status,
                body,
                headers: { 'Content-Type': contentType },
            };
        } catch (error) {
            LOGGER.log(`Error processing webhook: ${error}`);
            return {
                status: 500,
                body: JSON.stringify({ error: 'Internal Server Error' }),
                headers: { 'Content-Type': 'application/json' },
            };
        }
    }

    async processFlow(request: Request): Promise<WebhookResponse> {
        try {
            const webResponse = await processFlowRequest(request, this.config, this.client, this.flowHandlers);
            const body = await webResponse.text();
            const contentType = webResponse.headers.get('content-type') || 'text/plain';

            return {
                status: webResponse.status,
                body,
                headers: { 'Content-Type': contentType },
            };
        } catch (error) {
            LOGGER.log(`Error processing flow: ${error}`);
            return {
                status: 500,
                body: JSON.stringify({ error: 'Internal Server Error' }),
                headers: { 'Content-Type': 'application/json' },
            };
        }
    }

    onMessage(type: MessageTypesEnum | string, handler: MessageHandler): void {
        if (type === ('statuses' as MessageTypesEnum)) {
            throw new Error(
                'MessageTypesEnum.Statuses is deprecated. Use onStatus(handler) instead of onMessage(MessageTypesEnum.Statuses, handler)',
            );
        }
        this.messageHandlers.set(type as MessageTypesEnum, handler);
        LOGGER.log(`Registered message handler for ${type}`);
    }

    onStatus(handler: StatusHandler): void {
        this.statusHandler = handler;
        LOGGER.log('Registered status handler');
    }

    onMessagePreProcess(handler: MessageHandler): void {
        this.preProcessHandler = handler;
        LOGGER.log('Registered pre-process handler');
    }

    onMessagePostProcess(handler: MessageHandler): void {
        this.postProcessHandler = handler;
        LOGGER.log('Registered post-process handler');
    }

    onFlow(type: FlowTypeEnum, handler: FlowHandler): void {
        this.flowHandlers.set(type, handler);
        LOGGER.log(`Registered flow handler for ${type}`);
    }

    // ============================================================================
    // Specialized type-safe message handlers
    // ============================================================================

    /**
     * Register a handler for text messages
     * @param handler Type-safe handler that receives text messages with guaranteed text field
     */
    onText(handler: TextMessageHandler): void {
        this.messageHandlers.set(MessageTypesEnum.Text, handler as MessageHandler);
        LOGGER.log('Registered text message handler');
    }

    /**
     * Register a handler for image messages
     * @param handler Type-safe handler that receives image messages with guaranteed image field
     */
    onImage(handler: ImageMessageHandler): void {
        this.messageHandlers.set(MessageTypesEnum.Image, handler as MessageHandler);
        LOGGER.log('Registered image message handler');
    }

    /**
     * Register a handler for video messages
     * @param handler Type-safe handler that receives video messages with guaranteed video field
     */
    onVideo(handler: VideoMessageHandler): void {
        this.messageHandlers.set(MessageTypesEnum.Video, handler as MessageHandler);
        LOGGER.log('Registered video message handler');
    }

    /**
     * Register a handler for audio messages
     * @param handler Type-safe handler that receives audio messages with guaranteed audio field
     */
    onAudio(handler: AudioMessageHandler): void {
        this.messageHandlers.set(MessageTypesEnum.Audio, handler as MessageHandler);
        LOGGER.log('Registered audio message handler');
    }

    /**
     * Register a handler for document messages
     * @param handler Type-safe handler that receives document messages with guaranteed document field
     */
    onDocument(handler: DocumentMessageHandler): void {
        this.messageHandlers.set(MessageTypesEnum.Document, handler as MessageHandler);
        LOGGER.log('Registered document message handler');
    }

    /**
     * Register a handler for sticker messages
     * @param handler Type-safe handler that receives sticker messages with guaranteed sticker field
     */
    onSticker(handler: StickerMessageHandler): void {
        this.messageHandlers.set(MessageTypesEnum.Sticker, handler as MessageHandler);
        LOGGER.log('Registered sticker message handler');
    }

    /**
     * Register a handler for interactive messages (buttons, lists, flows)
     * @param handler Type-safe handler that receives interactive messages with guaranteed interactive field
     */
    onInteractive(handler: InteractiveMessageHandler): void {
        this.messageHandlers.set(MessageTypesEnum.Interactive, handler as MessageHandler);
        LOGGER.log('Registered interactive message handler');
    }

    /**
     * Register a handler for button messages
     * @param handler Type-safe handler that receives button messages with guaranteed button field
     */
    onButton(handler: ButtonMessageHandler): void {
        this.messageHandlers.set(MessageTypesEnum.Button, handler as MessageHandler);
        LOGGER.log('Registered button message handler');
    }

    /**
     * Register a handler for location messages
     * @param handler Type-safe handler that receives location messages with guaranteed location field
     */
    onLocation(handler: LocationMessageHandler): void {
        this.messageHandlers.set(MessageTypesEnum.Location, handler as MessageHandler);
        LOGGER.log('Registered location message handler');
    }

    /**
     * Register a handler for contact messages
     * @param handler Type-safe handler that receives contact messages with guaranteed contacts field
     */
    onContacts(handler: ContactsMessageHandler): void {
        this.messageHandlers.set(MessageTypesEnum.Contacts, handler as MessageHandler);
        LOGGER.log('Registered contacts message handler');
    }

    /**
     * Register a handler for reaction messages
     * @param handler Type-safe handler that receives reaction messages with guaranteed reaction field
     */
    onReaction(handler: ReactionMessageHandler): void {
        this.messageHandlers.set(MessageTypesEnum.Reaction, handler as MessageHandler);
        LOGGER.log('Registered reaction message handler');
    }

    /**
     * Register a handler for order messages
     * @param handler Type-safe handler that receives order messages with guaranteed order field
     */
    onOrder(handler: OrderMessageHandler): void {
        this.messageHandlers.set(MessageTypesEnum.Order, handler as MessageHandler);
        LOGGER.log('Registered order message handler');
    }

    /**
     * Register a handler for system messages
     * @param handler Type-safe handler that receives system messages with guaranteed system field
     */
    onSystem(handler: SystemMessageHandler): void {
        this.messageHandlers.set(MessageTypesEnum.System, handler as MessageHandler);
        LOGGER.log('Registered system message handler');
    }

    // ============================================================================
    // Webhook field handlers
    // @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account
    // ============================================================================

    /**
     * Register a handler for account_update webhook field
     * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#account_update
     */
    onAccountUpdate(handler: AccountUpdateHandler): void {
        this.accountUpdateHandler = handler;
        LOGGER.log('Registered account_update handler');
    }

    /**
     * Register a handler for account_review_update webhook field
     * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#account_review_update
     */
    onAccountReviewUpdate(handler: AccountReviewUpdateHandler): void {
        this.accountReviewUpdateHandler = handler;
        LOGGER.log('Registered account_review_update handler');
    }

    /**
     * Register a handler for account_alerts webhook field
     * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#account_alerts
     */
    onAccountAlerts(handler: AccountAlertsHandler): void {
        this.accountAlertsHandler = handler;
        LOGGER.log('Registered account_alerts handler');
    }

    /**
     * Register a handler for business_capability_update webhook field
     * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#business_capability_update
     */
    onBusinessCapabilityUpdate(handler: BusinessCapabilityUpdateHandler): void {
        this.businessCapabilityUpdateHandler = handler;
        LOGGER.log('Registered business_capability_update handler');
    }

    /**
     * Register a handler for phone_number_name_update webhook field
     * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#phone_number_name_update
     */
    onPhoneNumberNameUpdate(handler: PhoneNumberNameUpdateHandler): void {
        this.phoneNumberNameUpdateHandler = handler;
        LOGGER.log('Registered phone_number_name_update handler');
    }

    /**
     * Register a handler for phone_number_quality_update webhook field
     * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#phone_number_quality_update
     */
    onPhoneNumberQualityUpdate(handler: PhoneNumberQualityUpdateHandler): void {
        this.phoneNumberQualityUpdateHandler = handler;
        LOGGER.log('Registered phone_number_quality_update handler');
    }

    /**
     * Register a handler for message_template_status_update webhook field
     * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#message_template_status_update
     */
    onMessageTemplateStatusUpdate(handler: MessageTemplateStatusUpdateHandler): void {
        this.messageTemplateStatusUpdateHandler = handler;
        LOGGER.log('Registered message_template_status_update handler');
    }

    /**
     * Register a handler for template_category_update webhook field
     * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#template_category_update
     */
    onTemplateCategoryUpdate(handler: TemplateCategoryUpdateHandler): void {
        this.templateCategoryUpdateHandler = handler;
        LOGGER.log('Registered template_category_update handler');
    }

    /**
     * Register a handler for message_template_quality_update webhook field
     * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#message_template_quality_update
     */
    onMessageTemplateQualityUpdate(handler: MessageTemplateQualityUpdateHandler): void {
        this.messageTemplateQualityUpdateHandler = handler;
        LOGGER.log('Registered message_template_quality_update handler');
    }

    /**
     * Register a handler for flows webhook field
     * @see https://developers.facebook.com/docs/whatsapp/flows/guides/implementingyourflowendpoint#webhooks
     */
    onFlows(handler: FlowsHandler): void {
        this.flowsHandler = handler;
        LOGGER.log('Registered flows handler');
    }

    /**
     * Register a handler for security webhook field
     * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#security
     */
    onSecurity(handler: SecurityHandler): void {
        this.securityHandler = handler;
        LOGGER.log('Registered security handler');
    }

    /**
     * Register a handler for history webhook field
     * @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#history
     */
    onHistory(handler: HistoryHandler): void {
        this.historyHandler = handler;
        LOGGER.log('Registered history handler');
    }

    /**
     * Register a handler for smb_message_echoes webhook field
     * @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#smb_message_echoes
     */
    onSmbMessageEchoes(handler: SmbMessageEchoesHandler): void {
        this.smbMessageEchoesHandler = handler;
        LOGGER.log('Registered smb_message_echoes handler');
    }

    /**
     * Register a handler for smb_app_state_sync webhook field
     * @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#smb_app_state_sync
     */
    onSmbAppStateSync(handler: SmbAppStateSyncHandler): void {
        this.smbAppStateSyncHandler = handler;
        LOGGER.log('Registered smb_app_state_sync handler');
    }

    /**
     * Register a handler for account_settings_update webhook field
     */
    onAccountSettingsUpdate(handler: AccountSettingsUpdateHandler): void {
        this.accountSettingsUpdateHandler = handler;
        LOGGER.log('Registered account_settings_update handler');
    }

    /**
     * Register a handler for automatic_events webhook field
     */
    onAutomaticEvents(handler: AutomaticEventsHandler): void {
        this.automaticEventsHandler = handler;
        LOGGER.log('Registered automatic_events handler');
    }

    /**
     * Register a handler for business_status_update webhook field
     */
    onBusinessStatusUpdate(handler: BusinessStatusUpdateHandler): void {
        this.businessStatusUpdateHandler = handler;
        LOGGER.log('Registered business_status_update handler');
    }

    /**
     * Register a handler for calls webhook field
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/reference/
     */
    onCalls(handler: CallsHandler): void {
        this.callsHandler = handler;
        LOGGER.log('Registered calls handler');
    }

    /**
     * Register a handler for group_lifecycle_update webhook field
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
     */
    onGroupLifecycleUpdate(handler: GroupLifecycleUpdateHandler): void {
        this.groupLifecycleUpdateHandler = handler;
        LOGGER.log('Registered group_lifecycle_update handler');
    }

    /**
     * Register a handler for group_participants_update webhook field
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
     */
    onGroupParticipantsUpdate(handler: GroupParticipantsUpdateHandler): void {
        this.groupParticipantsUpdateHandler = handler;
        LOGGER.log('Registered group_participants_update handler');
    }

    /**
     * Register a handler for group_settings_update webhook field
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
     */
    onGroupSettingsUpdate(handler: GroupSettingsUpdateHandler): void {
        this.groupSettingsUpdateHandler = handler;
        LOGGER.log('Registered group_settings_update handler');
    }

    /**
     * Register a handler for group_status_update webhook field
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
     */
    onGroupStatusUpdate(handler: GroupStatusUpdateHandler): void {
        this.groupStatusUpdateHandler = handler;
        LOGGER.log('Registered group_status_update handler');
    }

    /**
     * Register a handler for message_echoes webhook field
     * @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#message_echoes
     */
    onMessageEchoes(handler: MessageEchoesHandler): void {
        this.messageEchoesHandler = handler;
        LOGGER.log('Registered message_echoes handler');
    }

    /**
     * Register a handler for message_template_components_update webhook field
     */
    onMessageTemplateComponentsUpdate(handler: MessageTemplateComponentsUpdateHandler): void {
        this.messageTemplateComponentsUpdateHandler = handler;
        LOGGER.log('Registered message_template_components_update handler');
    }

    /**
     * Register a handler for messaging_handovers webhook field
     */
    onMessagingHandovers(handler: MessagingHandoversHandler): void {
        this.messagingHandoversHandler = handler;
        LOGGER.log('Registered messaging_handovers handler');
    }

    /**
     * Register a handler for partner_solutions webhook field
     */
    onPartnerSolutions(handler: PartnerSolutionsHandler): void {
        this.partnerSolutionsHandler = handler;
        LOGGER.log('Registered partner_solutions handler');
    }

    /**
     * Register a handler for payment_configuration_update webhook field
     */
    onPaymentConfigurationUpdate(handler: PaymentConfigurationUpdateHandler): void {
        this.paymentConfigurationUpdateHandler = handler;
        LOGGER.log('Registered payment_configuration_update handler');
    }

    /**
     * Register a handler for standby webhook field
     */
    onStandby(handler: StandbyHandler): void {
        this.standbyHandler = handler;
        LOGGER.log('Registered standby handler');
    }

    /**
     * Register a handler for template_correct_category_detection webhook field
     */
    onTemplateCorrectCategoryDetection(handler: TemplateCorrectCategoryDetectionHandler): void {
        this.templateCorrectCategoryDetectionHandler = handler;
        LOGGER.log('Registered template_correct_category_detection handler');
    }

    /**
     * Register a handler for tracking_events webhook field
     */
    onTrackingEvents(handler: TrackingEventsHandler): void {
        this.trackingEventsHandler = handler;
        LOGGER.log('Registered tracking_events handler');
    }

    /**
     * Register a handler for user_preferences webhook field
     */
    onUserPreferences(handler: UserPreferencesHandler): void {
        this.userPreferencesHandler = handler;
        LOGGER.log('Registered user_preferences handler');
    }

    getClient(): WhatsApp {
        return this.client;
    }

    getConfig(): WabaConfigType {
        return this.config;
    }
}
