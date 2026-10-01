import type { FlowTypeEnum } from '../../api/flow/types';
import { importConfig } from '../../config/importConfig';
import type { WabaConfigType, WhatsAppConfig } from '../../types/config';
import { MessageTypesEnum, WabaConfigEnum } from '../../types/enums';
import Logger from '../../utils/logger';
import { isDebugEnv } from '../../utils/runtime';
import { WhatsApp } from '../whatsapp';
import { type ResolvedDedupe, resolveDedupe } from './dedupe';
import type { NonMessageWebhookField, WebhookFieldType } from './types';
import {
    type AccountAlertsHandler,
    type AccountReviewUpdateHandler,
    type AccountSettingsUpdateHandler,
    type AccountUpdateHandler,
    type AudioMessageHandler,
    type AutomaticEventsHandler,
    type BusinessCapabilityUpdateHandler,
    type BusinessStatusUpdateHandler,
    type BusinessUsernameUpdatesHandler,
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
    isNonMessageWebhookField,
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
    type RawWebhookHandler,
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
    type UserActionHandler,
    type UserPreferencesHandler,
    type VideoMessageHandler,
    type WebhookFieldHandler,
} from './utils/webhookUtils';

const LOGGER = new Logger('WEBHOOK_PROCESSOR', isDebugEnv());

function assertNonMessageField(field: string, method: 'on' | 'off'): void {
    if (field === 'messages') {
        throw new Error(
            `${method}('messages') is not supported. Use onMessage/onText/... for messages, ` +
                'onStatus for statuses and onUserAction for marketing user actions.',
        );
    }
    if (!isNonMessageWebhookField(field)) {
        throw new Error(`${method}('${field}'): unknown webhook field`);
    }
}

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
    private userActionHandler: UserActionHandler | undefined = undefined;
    private preProcessHandler: MessageHandler | undefined = undefined;
    private postProcessHandler: MessageHandler | undefined = undefined;
    private rawHandler: { handler: RawWebhookHandler; fields?: WebhookFieldType[] } | undefined = undefined;
    private flowHandlers: Map<FlowTypeEnum, FlowHandler> = new Map();

    /** Handlers for every webhook field except `messages`, keyed by field name. */
    private fieldHandlers: Map<NonMessageWebhookField, WebhookFieldHandler<NonMessageWebhookField>> = new Map();

    private verifySignature: boolean;
    private dedupe: ResolvedDedupe | undefined;

    constructor(config: WhatsAppConfig) {
        this.config = importConfig(config);
        this.verifySignature = config.verifyWebhookSignature === true;
        this.dedupe = resolveDedupe(config.dedupe);
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
            const webResponse = await processWebhookMessages(
                request,
                this.client,
                {
                    messageHandlers: this.messageHandlers,
                    statusHandler: this.statusHandler,
                    userActionHandler: this.userActionHandler,
                    preProcessHandler: this.preProcessHandler,
                    postProcessHandler: this.postProcessHandler,
                    rawHandler: this.rawHandler?.handler,
                    rawHandlerFields: this.rawHandler?.fields,
                    fieldHandlers: this.fieldHandlers,
                },
                {
                    appSecret: this.config[WabaConfigEnum.AppSecret],
                    verifySignature: this.verifySignature,
                    dedupe: this.dedupe,
                },
            );

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

    /**
     * Register a handler for marketing message user actions delivered as
     * `user_actions` on the `messages` webhook field (Marketing Messages API
     * for WhatsApp only): `marketing_messages_link_click` and
     * `landing_page_view`. `action_type` is an open enum — ignore unknown values.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/track-landing-page-views
     */
    onUserAction(handler: UserActionHandler): void {
        this.userActionHandler = handler;
        LOGGER.log('Registered user action handler');
    }

    onMessagePreProcess(handler: MessageHandler): void {
        this.preProcessHandler = handler;
        LOGGER.log('Registered pre-process handler');
    }

    onMessagePostProcess(handler: MessageHandler): void {
        this.postProcessHandler = handler;
        LOGGER.log('Registered post-process handler');
    }

    onRaw(handler: RawWebhookHandler, fields?: WebhookFieldType[]): void {
        this.rawHandler = { handler, fields };
        LOGGER.log(`Registered raw webhook handler${fields ? ` for fields: ${fields.join(', ')}` : ''}`);
    }

    onFlow(type: FlowTypeEnum, handler: FlowHandler): void {
        this.flowHandlers.set(type, handler);
        LOGGER.log(`Registered flow handler for ${type}`);
    }

    /**
     * Register a handler for any webhook field except `messages`. The type of
     * `processed.value` follows from the field name. Replaces any handler
     * already registered for that field, including one set with the matching
     * `onXxx` method (for example `onCalls` is `on('calls', handler)`).
     *
     * `messages` is not accepted: use `onMessage`, the typed message methods
     * (`onText`, ...), `onStatus` or `onUserAction`, which split that field
     * into messages, statuses and user actions.
     *
     * @example
     * ```typescript
     * processor.on('calls', async (whatsapp, { value }) => {
     *     for (const call of value.calls) console.log(call.id, call.event);
     * });
     * ```
     */
    on<F extends NonMessageWebhookField>(field: F, handler: WebhookFieldHandler<F>): void {
        assertNonMessageField(field, 'on');
        this.fieldHandlers.set(field, handler as unknown as WebhookFieldHandler<NonMessageWebhookField>);
        LOGGER.log(`Registered ${field} handler`);
    }

    /**
     * Remove the handler for a webhook field registered with `on()` or the
     * matching `onXxx` method. `messages` is not accepted (see {@link on}).
     */
    off(field: NonMessageWebhookField): void {
        assertNonMessageField(field, 'off');
        this.fieldHandlers.delete(field);
        LOGGER.log(`Removed ${field} handler`);
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
        this.on('account_update', handler);
    }

    /**
     * Register a handler for account_review_update webhook field
     * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#account_review_update
     */
    onAccountReviewUpdate(handler: AccountReviewUpdateHandler): void {
        this.on('account_review_update', handler);
    }

    /**
     * Register a handler for account_alerts webhook field
     * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#account_alerts
     */
    onAccountAlerts(handler: AccountAlertsHandler): void {
        this.on('account_alerts', handler);
    }

    /**
     * Register a handler for business_capability_update webhook field
     * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#business_capability_update
     */
    onBusinessCapabilityUpdate(handler: BusinessCapabilityUpdateHandler): void {
        this.on('business_capability_update', handler);
    }

    /**
     * Register a handler for phone_number_name_update webhook field
     * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#phone_number_name_update
     */
    onPhoneNumberNameUpdate(handler: PhoneNumberNameUpdateHandler): void {
        this.on('phone_number_name_update', handler);
    }

    /**
     * Register a handler for phone_number_quality_update webhook field
     * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#phone_number_quality_update
     */
    onPhoneNumberQualityUpdate(handler: PhoneNumberQualityUpdateHandler): void {
        this.on('phone_number_quality_update', handler);
    }

    /**
     * Register a handler for message_template_status_update webhook field
     * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#message_template_status_update
     */
    onMessageTemplateStatusUpdate(handler: MessageTemplateStatusUpdateHandler): void {
        this.on('message_template_status_update', handler);
    }

    /**
     * Register a handler for template_category_update webhook field
     * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#template_category_update
     */
    onTemplateCategoryUpdate(handler: TemplateCategoryUpdateHandler): void {
        this.on('template_category_update', handler);
    }

    /**
     * Register a handler for message_template_quality_update webhook field
     * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#message_template_quality_update
     */
    onMessageTemplateQualityUpdate(handler: MessageTemplateQualityUpdateHandler): void {
        this.on('message_template_quality_update', handler);
    }

    /**
     * Register a handler for flows webhook field
     * @see https://developers.facebook.com/docs/whatsapp/flows/guides/implementingyourflowendpoint#webhooks
     */
    onFlows(handler: FlowsHandler): void {
        this.on('flows', handler);
    }

    /**
     * Register a handler for security webhook field
     * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#security
     */
    onSecurity(handler: SecurityHandler): void {
        this.on('security', handler);
    }

    /**
     * Register a handler for history webhook field
     * @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#history
     */
    onHistory(handler: HistoryHandler): void {
        this.on('history', handler);
    }

    /**
     * Register a handler for smb_message_echoes webhook field
     * @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#smb_message_echoes
     */
    onSmbMessageEchoes(handler: SmbMessageEchoesHandler): void {
        this.on('smb_message_echoes', handler);
    }

    /**
     * Register a handler for smb_app_state_sync webhook field
     * @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#smb_app_state_sync
     */
    onSmbAppStateSync(handler: SmbAppStateSyncHandler): void {
        this.on('smb_app_state_sync', handler);
    }

    /**
     * Register a handler for account_settings_update webhook field
     */
    onAccountSettingsUpdate(handler: AccountSettingsUpdateHandler): void {
        this.on('account_settings_update', handler);
    }

    /**
     * Register a handler for automatic_events webhook field
     */
    onAutomaticEvents(handler: AutomaticEventsHandler): void {
        this.on('automatic_events', handler);
    }

    /**
     * Register a handler for business_status_update webhook field
     */
    onBusinessStatusUpdate(handler: BusinessStatusUpdateHandler): void {
        this.on('business_status_update', handler);
    }

    /**
     * Register a handler for business_username_updates webhook field.
     * Check `value.context === 'revoked'` to tell a Meta revocation from a change the business made.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/business-scoped-user-ids#business_username_updates-webhook
     */
    onBusinessUsernameUpdates(handler: BusinessUsernameUpdatesHandler): void {
        this.on('business_username_updates', handler);
    }

    /**
     * Register a handler for calls webhook field
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/reference/
     */
    onCalls(handler: CallsHandler): void {
        this.on('calls', handler);
    }

    /**
     * Register a handler for group_lifecycle_update webhook field
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
     */
    onGroupLifecycleUpdate(handler: GroupLifecycleUpdateHandler): void {
        this.on('group_lifecycle_update', handler);
    }

    /**
     * Register a handler for group_participants_update webhook field
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
     */
    onGroupParticipantsUpdate(handler: GroupParticipantsUpdateHandler): void {
        this.on('group_participants_update', handler);
    }

    /**
     * Register a handler for group_settings_update webhook field
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
     */
    onGroupSettingsUpdate(handler: GroupSettingsUpdateHandler): void {
        this.on('group_settings_update', handler);
    }

    /**
     * Register a handler for group_status_update webhook field
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
     */
    onGroupStatusUpdate(handler: GroupStatusUpdateHandler): void {
        this.on('group_status_update', handler);
    }

    /**
     * Register a handler for message_echoes webhook field
     * @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#message_echoes
     */
    onMessageEchoes(handler: MessageEchoesHandler): void {
        this.on('message_echoes', handler);
    }

    /**
     * Register a handler for message_template_components_update webhook field
     */
    onMessageTemplateComponentsUpdate(handler: MessageTemplateComponentsUpdateHandler): void {
        this.on('message_template_components_update', handler);
    }

    /**
     * Register a handler for messaging_handovers webhook field
     */
    onMessagingHandovers(handler: MessagingHandoversHandler): void {
        this.on('messaging_handovers', handler);
    }

    /**
     * Register a handler for partner_solutions webhook field
     */
    onPartnerSolutions(handler: PartnerSolutionsHandler): void {
        this.on('partner_solutions', handler);
    }

    /**
     * Register a handler for payment_configuration_update webhook field
     */
    onPaymentConfigurationUpdate(handler: PaymentConfigurationUpdateHandler): void {
        this.on('payment_configuration_update', handler);
    }

    /**
     * Register a handler for standby webhook field
     */
    onStandby(handler: StandbyHandler): void {
        this.on('standby', handler);
    }

    /**
     * Register a handler for template_correct_category_detection webhook field
     */
    onTemplateCorrectCategoryDetection(handler: TemplateCorrectCategoryDetectionHandler): void {
        this.on('template_correct_category_detection', handler);
    }

    /**
     * Register a handler for tracking_events webhook field
     */
    onTrackingEvents(handler: TrackingEventsHandler): void {
        this.on('tracking_events', handler);
    }

    /**
     * Register a handler for user_preferences webhook field
     */
    onUserPreferences(handler: UserPreferencesHandler): void {
        this.on('user_preferences', handler);
    }

    // ============================================================================
    // Handler removal methods
    // ============================================================================

    /**
     * Remove a registered message handler by type
     */
    offMessage(type: MessageTypesEnum | string): void {
        this.messageHandlers.delete(type as MessageTypesEnum);
        LOGGER.log(`Removed message handler for ${type}`);
    }

    /**
     * Remove the pre-process handler
     */
    offMessagePreProcess(): void {
        this.preProcessHandler = undefined;
        LOGGER.log('Removed pre-process handler');
    }

    /**
     * Remove the post-process handler
     */
    offMessagePostProcess(): void {
        this.postProcessHandler = undefined;
        LOGGER.log('Removed post-process handler');
    }

    /**
     * Remove the status handler
     */
    offStatus(): void {
        this.statusHandler = undefined;
        LOGGER.log('Removed status handler');
    }

    /**
     * Remove the user action handler
     */
    offUserAction(): void {
        this.userActionHandler = undefined;
        LOGGER.log('Removed user action handler');
    }

    /**
     * Remove the raw webhook handler
     */
    offRaw(): void {
        this.rawHandler = undefined;
        LOGGER.log('Removed raw webhook handler');
    }

    /**
     * Remove a registered flow handler by type
     */
    offFlow(type: FlowTypeEnum): void {
        this.flowHandlers.delete(type);
        LOGGER.log(`Removed flow handler for ${type}`);
    }

    /**
     * Remove all registered handlers
     */
    removeAllHandlers(): void {
        this.messageHandlers.clear();
        this.statusHandler = undefined;
        this.userActionHandler = undefined;
        this.preProcessHandler = undefined;
        this.postProcessHandler = undefined;
        this.rawHandler = undefined;
        this.flowHandlers.clear();

        this.fieldHandlers.clear();

        LOGGER.log('Removed all handlers');
    }

    getClient(): WhatsApp {
        return this.client;
    }

    getConfig(): WabaConfigType {
        return this.config;
    }
}
