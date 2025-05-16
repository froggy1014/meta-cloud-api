import { MessageTypesEnum, WhatsAppConfig } from './types';
import { WabaConfigType } from './types/config';

import { EventField, WebhookEvent, WebhookMessage } from './types/webhook';
import { importConfig } from './utils';
import Logger from './utils/logger';

const LIB_NAME = 'WEBHOOK';
const LOG_LOCAL = false;
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true' || LOG_LOCAL);

export interface IRequest {
    body: any;
    query: Record<string, any>;
    method?: string;
}
export interface IResponse {
    status: (code: number) => IResponse;
    send: (body: any) => IResponse | void;
    json: (body: any) => IResponse | void;
    end: () => void;
}

/**
 * Webhook handler for WhatsApp Cloud API
 */
export default class WebhookHandler {
    private config: WabaConfigType;
    private messageHandlers: Map<string, (message: WebhookMessage) => void | Promise<void>> = new Map();
    private eventHandlers: Map<string, (event: WebhookEvent) => void | Promise<void>> = new Map();

    /**
     * Create a new WebhookHandler
     * @param config The WhatsApp configuration
     */
    constructor(config: WhatsAppConfig) {
        const configuration = importConfig(config);
        this.config = configuration;
        LOGGER.log('WebhookHandler instantiated!');
    }

    /**
     * Handle a GET request for webhook verification
     */
    public handleVerificationRequest<Req extends IRequest, Res extends IResponse>(req: Req, res: Res): void {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === this.config.WEBHOOK_VERIFICATION_TOKEN) {
            LOGGER.log('Webhook verified successfully');
            res.status(200).send(challenge);
        } else {
            LOGGER.log('Webhook verification failed');
            res.status(403).end();
        }
    }

    /**
     * Handle a POST request for webhook events
     */
    public async handleWebhookRequest<Req extends IRequest, Res extends IResponse>(req: Req, res: Res): Promise<void> {
        const body = req.body;

        // Check this is a WhatsApp Business Account webhook
        if (body.object !== 'whatsapp_business_account') {
            LOGGER.log('Received webhook for non-WhatsApp event');
            res.status(404).end();
            return;
        }

        // Process each entry
        for (const entry of body.entry) {
            try {
                const changes = entry.changes;
                for (const change of changes) {
                    if (change.field === EventField.MESSAGES) {
                        await this.processMessages(change.value);
                    } else {
                        // Handle other event types
                        await this.processEvent(change.field, change.value);
                    }
                }
            } catch (error) {
                LOGGER.log(`Error processing webhook: ${error}`);
            }
        }

        // Always respond with 200 to acknowledge receipt
        res.status(200).end();
    }

    /**
     * Handle webhook requests (both verification and events)
     */
    public handleRequest(req: IRequest, res: IResponse): void | Promise<void> {
        if (req.method === 'GET') {
            return this.handleVerificationRequest(req, res);
        } else if (req.method === 'POST') {
            return this.handleWebhookRequest(req, res);
        } else {
            res.status(405).end(); // Method not allowed
        }
    }

    /**
     * Process incoming messages
     */
    private async processMessages(value: any): Promise<void> {
        // Extract metadata
        const metadata = value.metadata;
        const contacts = value.contacts;
        const displayPhoneNumber = metadata.display_phone_number;
        const phoneNumberId = metadata.phone_number_id;
        const profileName = contacts.profile.name;
        const messages = value.messages as WebhookMessage[];

        // Process messages if present
        if (messages && messages.length > 0) {
            for (const message of messages) {
                const messageType = message.type;

                // Create the base message object
                const processedMessage: WebhookMessage = {
                    id: message.id,
                    from: message.from,
                    timestamp: message.timestamp,
                    type: message.type,
                    phoneNumberId,
                    displayPhoneNumber,
                    profileName,
                    originalData: message,
                };

                // Add type-specific data based on the message type
                switch (message.type) {
                    case MessageTypesEnum.Text:
                        processedMessage.text = message.text;
                        break;
                    case MessageTypesEnum.Image:
                        processedMessage.image = message.image;
                        break;
                    case MessageTypesEnum.Video:
                        processedMessage.video = message.video;
                        break;
                    case MessageTypesEnum.Audio:
                        processedMessage.audio = message.audio;
                        break;
                    case MessageTypesEnum.Document:
                        processedMessage.document = message.document;
                        break;
                    case MessageTypesEnum.Sticker:
                        processedMessage.sticker = message.sticker;
                        break;
                    case MessageTypesEnum.Location:
                        processedMessage.location = message.location;
                        break;
                    case MessageTypesEnum.Contacts:
                        processedMessage.contacts = message.contacts;
                        break;
                    case MessageTypesEnum.Interactive:
                        processedMessage.interactive = message.interactive;
                        break;
                    case MessageTypesEnum.Button:
                        processedMessage.button = message.button;
                        break;
                    case MessageTypesEnum.Order:
                        processedMessage.order = message.order;
                        break;
                    case MessageTypesEnum.System:
                        processedMessage.system = message.system;
                        break;
                    default:
                        // Unknown message type
                        break;
                }

                // Add context if available
                if (message.context) {
                    processedMessage.context = message.context;
                }

                // Add errors if available
                if (message.errors) {
                    processedMessage.errors = message.errors;
                }

                // Dispatch to appropriate message handler
                if (this.messageHandlers.has(messageType)) {
                    const handler = this.messageHandlers.get(messageType);
                    if (handler) {
                        await Promise.resolve(handler(processedMessage));
                    }
                }

                // Also dispatch to general message handler if exists
                if (this.messageHandlers.has('*')) {
                    const handler = this.messageHandlers.get('*');
                    if (handler) {
                        await Promise.resolve(handler(processedMessage));
                    }
                }
            }
        }

        if (value.statuses && value.statuses.length > 0) {
            await this.processEvent(EventField.STATUSES, value);
        }
    }

    private async processEvent(field: string, value: any): Promise<void> {
        const event: WebhookEvent = {
            field,
            value,
        };

        if (this.eventHandlers.has(field)) {
            const handler = this.eventHandlers.get(field);
            if (handler) {
                await Promise.resolve(handler(event));
            }
        }

        if (this.eventHandlers.has('*')) {
            const handler = this.eventHandlers.get('*');
            if (handler) {
                await Promise.resolve(handler(event));
            }
        }
    }

    /**
     * Register a message handler for a specific message type
     * @param type Message type to handle, or '*' for all types
     * @param handler The handler function
     */
    public onMessage(type: MessageTypesEnum, handler: (message: WebhookMessage) => void | Promise<void>): void {
        this.messageHandlers.set(type, handler);
        LOGGER.log(`Registered handler for message type: ${type}`);
    }

    /**
     * Register a general event handler
     * @param field Event field to handle, or '*' for all fields
     * @param handler The handler function
     */
    public onEvent(field: string, handler: (event: WebhookEvent) => void | Promise<void>): void {
        this.eventHandlers.set(field, handler);
        LOGGER.log(`Registered handler for event field: ${field}`);
    }
}
