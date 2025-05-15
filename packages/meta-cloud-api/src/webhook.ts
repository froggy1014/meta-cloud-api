import { Server } from 'http';
import { WabaConfigType } from './types/config';

import { EventField, MessageType, WebhookEvent, WebhookMessage } from './types/webhook';
import Logger from './utils/logger';

const LIB_NAME = 'WEBHOOK';
const LOG_LOCAL = false;
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true' || LOG_LOCAL);

/**
 * Generic HTTP request interface that works across frameworks
 */
export interface IRequest {
    body: any;
    query: Record<string, any>;
    method: string;
}

/**
 * Generic HTTP response interface that works across frameworks
 */
export interface IResponse {
    status: (code: number) => IResponse;
    send: (body: any) => IResponse | void;
    json: (body: any) => IResponse | void;
    end: () => void;
}

/**
 * Express adapter for the WebhookHandler
 */
export const expressAdapter = {
    createRequest: (req: any): IRequest => ({
        body: req.body,
        query: req.query,
        method: req.method,
    }),
    createResponse: (res: any): IResponse => ({
        status: (code: number) => {
            res.status(code);
            return res;
        },
        send: (body: any) => res.send(body),
        json: (body: any) => res.json(body),
        end: () => res.end(),
    }),
};

/**
 * Next.js adapter for the WebhookHandler
 */
export const nextJsAdapter = {
    createRequest: (req: any): IRequest => ({
        body: req.body,
        query: req.query,
        method: req.method,
    }),
    createResponse: (res: any): IResponse => ({
        status: (code: number) => {
            res.status(code);
            return res;
        },
        send: (body: any) => res.send(body),
        json: (body: any) => res.json(body),
        end: () => res.end(),
    }),
};

/**
 * Webhook handler for WhatsApp Cloud API
 */
export default class WebhookHandler {
    private server?: Server;
    private config: WabaConfigType;
    private callbackUrl: string;
    private verifyToken: string;
    private messageHandlers: Map<string, (message: WebhookMessage) => void | Promise<void>> = new Map();
    private eventHandlers: Map<string, (event: WebhookEvent) => void | Promise<void>> = new Map();

    /**
     * Create a new WebhookHandler
     * @param config The WhatsApp configuration
     * @param callbackUrl The public URL for the webhook
     * @param verifyToken The verification token for the webhook
     */
    constructor(config: WabaConfigType, callbackUrl: string, verifyToken: string) {
        this.config = config;
        this.callbackUrl = callbackUrl;
        this.verifyToken = verifyToken;
        LOGGER.log('WebhookHandler instantiated!');
    }

    /**
     * Handle a GET request for webhook verification
     */
    public handleVerificationRequest(req: IRequest, res: IResponse): void {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === this.verifyToken) {
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
    public async handleWebhookRequest(req: IRequest, res: IResponse): Promise<void> {
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
     * Initialize the webhook with an Express app (legacy support)
     * @param app Express application instance
     * @param path The path to listen on, defaults to /webhook
     */
    public initialize(app: any, path: string = '/webhook'): void {
        // Set up middleware to handle requests
        app.all(path, async (req: any, res: any) => {
            const request = expressAdapter.createRequest(req);
            const response = expressAdapter.createResponse(res);
            await this.handleRequest(request, response);
        });

        LOGGER.log(`Webhook initialized at path: ${path}`);
    }

    /**
     * Process incoming messages
     */
    private async processMessages(value: any): Promise<void> {
        // Extract metadata
        const metadata = value.metadata;
        const phoneNumberId = metadata.phone_number_id;

        // Process messages if present
        if (value.messages && value.messages.length > 0) {
            for (const message of value.messages) {
                const messageType = message.type as MessageType;

                // Create the base message object
                const processedMessage: WebhookMessage = {
                    id: message.id,
                    from: message.from,
                    timestamp: message.timestamp,
                    type: messageType,
                    phoneNumberId,
                    originalData: message,
                };

                // Add type-specific data based on the message type
                switch (messageType) {
                    case MessageType.TEXT:
                        processedMessage.text = message.text;
                        break;
                    case MessageType.IMAGE:
                        processedMessage.image = message.image;
                        break;
                    case MessageType.VIDEO:
                        processedMessage.video = message.video;
                        break;
                    case MessageType.AUDIO:
                        processedMessage.audio = message.audio;
                        break;
                    case MessageType.DOCUMENT:
                        processedMessage.document = message.document;
                        break;
                    case MessageType.STICKER:
                        processedMessage.sticker = message.sticker;
                        break;
                    case MessageType.LOCATION:
                        processedMessage.location = message.location;
                        break;
                    case MessageType.CONTACTS:
                        processedMessage.contacts = message.contacts;
                        break;
                    case MessageType.INTERACTIVE:
                        processedMessage.interactive = message.interactive;
                        break;
                    case MessageType.BUTTON:
                        processedMessage.button = message.button;
                        break;
                    case MessageType.ORDER:
                        processedMessage.order = message.order;
                        break;
                    case MessageType.SYSTEM:
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

        // Process status messages if present
        if (value.statuses && value.statuses.length > 0) {
            // Process as events
            await this.processEvent(EventField.STATUSES, value);
        }
    }

    /**
     * Process other webhook events
     */
    private async processEvent(field: string, value: any): Promise<void> {
        const event: WebhookEvent = {
            field,
            value,
        };

        // Dispatch to appropriate event handler
        if (this.eventHandlers.has(field)) {
            const handler = this.eventHandlers.get(field);
            if (handler) {
                await Promise.resolve(handler(event));
            }
        }

        // Also dispatch to general event handler if exists
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
    public onMessage(type: string, handler: (message: WebhookMessage) => void | Promise<void>): void {
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
