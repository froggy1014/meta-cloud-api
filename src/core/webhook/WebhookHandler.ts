import { MessageTypesEnum } from '@shared/types';
import { WabaConfigType, WhatsAppConfig } from '@shared/types/config';

import { FlowTypeEnum } from '@features/flow/types';
import { importConfig } from '@shared/config/importConfig';
import Logger from '@shared/utils/logger';
import { WhatsApp } from '../whatsapp';
import {
    FlowHandler,
    MessageHandler,
    processFlowRequest,
    processWebhookMessages,
    verifyWebhook,
    WebhookRequest,
    WebhookResponse,
} from './utils/webhookUtils';

const LIB_NAME = 'WEBHOOK';
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true');

/**
 * Framework-agnostic WebhookHandler using pure functions
 */
export class WebhookHandler {
    private config: WabaConfigType;
    private client: WhatsApp;
    private messageHandlers: Map<MessageTypesEnum, MessageHandler> = new Map();
    private preProcessHandler: MessageHandler | undefined = undefined;
    private postProcessHandler: MessageHandler | undefined = undefined;
    private flowHandlers: Map<FlowTypeEnum, FlowHandler> = new Map();

    constructor(config: WhatsAppConfig) {
        this.config = importConfig(config);
        this.client = new WhatsApp(config);
        LOGGER.log('WebhookHandler instantiated!');
    }

    /**
     * Handle webhook verification (framework-agnostic)
     */
    public handleVerification = (request: Pick<WebhookRequest, 'query'>): WebhookResponse => {
        return verifyWebhook(request, this.config.WEBHOOK_VERIFICATION_TOKEN || '');
    };

    /**
     * Handle webhook messages (framework-agnostic)
     */
    public handleWebhook = async (request: WebhookRequest): Promise<WebhookResponse> => {
        return processWebhookMessages(request, this.client, {
            messageHandlers: this.messageHandlers,
            preProcessHandler: this.preProcessHandler,
            postProcessHandler: this.postProcessHandler,
        });
    };

    /**
     * Handle flow requests (framework-agnostic)
     */
    public handleFlow = async (request: WebhookRequest): Promise<WebhookResponse> => {
        return processFlowRequest(request, this.config, this.client, this.flowHandlers);
    };

    /**
     * Register a message handler for a specific message type
     */
    public onMessage(type: MessageTypesEnum, handler: MessageHandler): void {
        this.messageHandlers.set(type, handler);
        LOGGER.log(`Registered message handler for ${type}`);
    }

    /**
     * Register a pre-process handler that runs before all message handlers
     */
    public onMessagePreProcess(handler: MessageHandler): void {
        this.preProcessHandler = handler;
        LOGGER.log('Registered pre-process handler');
    }

    /**
     * Register a post-process handler that runs after all message handlers
     */
    public onMessagePostProcess(handler: MessageHandler): void {
        this.postProcessHandler = handler;
        LOGGER.log('Registered post-process handler');
    }

    /**
     * Register a flow handler for a specific flow type
     */
    public onFlow(type: FlowTypeEnum, handler: FlowHandler): void {
        this.flowHandlers.set(type, handler);
        LOGGER.log(`Registered flow handler for ${type}`);
    }
}
