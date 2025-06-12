import { FlowTypeEnum } from '@features/flow/types';
import { importConfig } from '@shared/config/importConfig';
import { MessageTypesEnum } from '@shared/types';
import { WabaConfigType, WhatsAppConfig } from '@shared/types/config';
import Logger from '@shared/utils/logger';
import crypto from 'crypto';
import { WhatsApp } from '../whatsapp';
import { FlowHandler, MessageHandler, processFlowRequest, processWebhookMessages } from './utils/webhookUtils';

const LIB_NAME = 'WEBHOOK';
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true');

/**
 * WebhookHandler based on Web Standard API
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
     * Handle webhook requests using Web Standard API
     */
    public async handleWebhook(request: Request): Promise<Response> {
        try {
            // Handle GET request (verification)
            if (request.method === 'GET') {
                const url = new URL(request.url);
                const mode = url.searchParams.get('hub.mode');
                const token = url.searchParams.get('hub.verify_token');
                const challenge = url.searchParams.get('hub.challenge');

                if (mode === 'subscribe' && token === this.config.WEBHOOK_VERIFICATION_TOKEN) {
                    return new Response(challenge, { status: 200 });
                }
                return new Response(null, { status: 403 });
            }

            // Handle POST request (webhook)
            if (request.method === 'POST') {
                return processWebhookMessages(request, this.client, {
                    messageHandlers: this.messageHandlers,
                    preProcessHandler: this.preProcessHandler,
                    postProcessHandler: this.postProcessHandler,
                });
            }

            return new Response(null, { status: 405 });
        } catch (error) {
            LOGGER.log(`Error handling webhook: ${error}`);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
        }
    }

    /**
     * Handle flow requests
     */
    public async handleFlow(request: Request): Promise<Response> {
        try {
            return processFlowRequest(request, this.config, this.client, this.flowHandlers);
        } catch (error) {
            LOGGER.log(`Error handling flow: ${error}`);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
        }
    }

    /**
     * Verify webhook signature
     */
    private verifySignature(body: string, signature: string | null): boolean {
        if (!signature) return false;

        const expectedSignature = crypto
            .createHmac('sha256', this.config.WEBHOOK_VERIFICATION_TOKEN)
            .update(body)
            .digest('hex');

        return crypto.timingSafeEqual(Buffer.from(signature.replace('sha256=', '')), Buffer.from(expectedSignature));
    }

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
