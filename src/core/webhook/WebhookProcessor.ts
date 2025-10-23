import { FlowTypeEnum } from '../../api/flow/types';
import { importConfig } from '../../config/importConfig';
import { WabaConfigType, WhatsAppConfig } from '../../types/config';
import { MessageTypesEnum } from '../../types/enums';
import Logger from '../../utils/logger';
import { WhatsApp } from '../whatsapp';

import {
    FlowHandler,
    MessageHandler,
    StatusHandler,
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

    getClient(): WhatsApp {
        return this.client;
    }

    getConfig(): WabaConfigType {
        return this.config;
    }
}
