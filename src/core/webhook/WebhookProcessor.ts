import { FlowTypeEnum } from '../../api/flow/types';
import { importConfig } from '../../config/importConfig';
import { WabaConfigType, WhatsAppConfig } from '../../types/config';
import { MessageTypesEnum } from '../../types/enums';
import Logger from '../../utils/logger';
import { WhatsApp } from '../whatsapp';

import {
    AudioMessageHandler,
    ButtonMessageHandler,
    ContactsMessageHandler,
    DocumentMessageHandler,
    FlowHandler,
    ImageMessageHandler,
    InteractiveMessageHandler,
    LocationMessageHandler,
    MessageHandler,
    OrderMessageHandler,
    ReactionMessageHandler,
    StatusHandler,
    StickerMessageHandler,
    SystemMessageHandler,
    TextMessageHandler,
    VideoMessageHandler,
    processFlowRequest,
    processWebhookMessages,
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

    onMessage(type: MessageTypesEnum, handler: MessageHandler): void {
        if (type === ('statuses' as MessageTypesEnum)) {
            throw new Error(
                'MessageTypesEnum.Statuses is deprecated. Use onStatus(handler) instead of onMessage(MessageTypesEnum.Statuses, handler)',
            );
        }
        this.messageHandlers.set(type, handler);
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

    getClient(): WhatsApp {
        return this.client;
    }

    getConfig(): WabaConfigType {
        return this.config;
    }
}
