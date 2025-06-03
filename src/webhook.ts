import { IncomingMessage } from 'http';
import { FlowEndpointRequest, FlowTypeEnum, MessageTypesEnum, WhatsAppConfig } from './types';
import { WabaConfigType } from './types/config';

import crypto from 'crypto';
import { EventField, WebhookEvent, WebhookMessage } from './types/webhook';
import { importConfig } from './utils';
import { isFlowDataExchangeRequest, isFlowErrorRequest, isFlowPingRequest } from './utils/flowTypeGuards';
import Logger from './utils/logger';
import WhatsApp from './whatsapp';
const LIB_NAME = 'WEBHOOK';
const LOG_LOCAL = false;
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true' || LOG_LOCAL);

export interface IRequest extends IncomingMessage {
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
    private client: WhatsApp;
    private messageHandlers: Map<
        MessageTypesEnum,
        (whatsapp: WhatsApp, message: WebhookMessage) => void | Promise<void>
    > = new Map();
    private eventHandlers: Map<string, (event: WebhookEvent) => void | Promise<void>> = new Map();
    private preProcessHandler: ((whatsapp: WhatsApp, message: WebhookMessage) => void | Promise<void>) | null = null;
    private postProcessHandler: ((whatsapp: WhatsApp, message: WebhookMessage) => void | Promise<void>) | null = null;
    private flowHandlers: Map<FlowTypeEnum, (whatsapp: WhatsApp, request: FlowEndpointRequest) => any | Promise<any>> =
        new Map();

    /**
     * Create a new WebhookHandler
     * @param config The WhatsApp configuration
     */
    constructor(config: WhatsAppConfig) {
        const configuration = importConfig(config);
        this.config = configuration;
        this.client = new WhatsApp(config);
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
        const displayPhoneNumber = metadata.display_phone_number;
        const phoneNumberId = metadata.phone_number_id;
        const profileName = value.contacts[0].profile.name;
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

                // 1. Execute pre-processing handler if exists
                if (this.preProcessHandler) {
                    await Promise.resolve(this.preProcessHandler(this.client, processedMessage));
                }

                // 2. Dispatch to appropriate message handler
                if (this.messageHandlers.has(messageType)) {
                    const handler = this.messageHandlers.get(messageType);
                    if (handler) {
                        await Promise.resolve(handler(this.client, processedMessage));
                    }
                }

                // Also dispatch to general message handler if exists
                if (this.messageHandlers.has(MessageTypesEnum['*'])) {
                    const handler = this.messageHandlers.get(MessageTypesEnum['*']);
                    if (handler) {
                        await Promise.resolve(handler(this.client, processedMessage));
                    }
                }

                // 3. Execute post-processing handler if exists
                if (this.postProcessHandler) {
                    await Promise.resolve(this.postProcessHandler(this.client, processedMessage));
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
    public onMessage(
        type: MessageTypesEnum,
        handler: (whatsapp: WhatsApp, message: WebhookMessage) => void | Promise<void>,
    ): void {
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

    /**
     * Register a pre-processing handler for all messages
     * @param handler The handler function
     */
    public onMessagePreProcess(handler: (whatsapp: WhatsApp, message: WebhookMessage) => void | Promise<void>): void {
        this.preProcessHandler = handler;
        LOGGER.log('Registered pre-processing handler for all messages');
    }

    /**
     * Register a post-processing handler for all messages
     * @param handler The handler function
     */
    public onMessagePostProcess(handler: (whatsapp: WhatsApp, message: WebhookMessage) => void | Promise<void>): void {
        this.postProcessHandler = handler;
        LOGGER.log('Registered post-processing handler for all messages');
    }

    public async handleFlowRequest<Req extends IRequest & { rawBody: string }, Res extends IResponse>(
        req: Req,
        res: Res,
    ): Promise<void> {
        if (!this.isRequestSignatureValid(req)) {
            res.status(403).end();
            return;
        }

        let flowRequestData: {
            decryptedBody: FlowEndpointRequest;
            aesKeyBuffer: Buffer;
            initialVectorBuffer: Buffer;
        };

        try {
            flowRequestData = this.decryptRequest(req.body);
        } catch (error) {
            LOGGER.error(error);
            if (error instanceof Error) {
                res.status(421).send(error.message);
                return;
            }

            res.status(500).send('internal server error, please check with logs');
            return;
        }

        const { decryptedBody, aesKeyBuffer, initialVectorBuffer } = flowRequestData;

        // Determine flow type
        let flowType: FlowTypeEnum | undefined = undefined;

        if (isFlowPingRequest(decryptedBody)) {
            flowType = FlowTypeEnum.Ping;
        } else if (isFlowDataExchangeRequest(decryptedBody)) {
            flowType = FlowTypeEnum.Change;
        } else if (isFlowErrorRequest(decryptedBody)) {
            flowType = FlowTypeEnum.Error;
        }

        // If we have a registered handler for this flow type, use it
        if (flowType && this.flowHandlers.has(flowType)) {
            const handler = this.flowHandlers.get(flowType);
            if (handler) {
                const response = await Promise.resolve(handler(this.client, decryptedBody));
                const encryptedResponse = this.encryptResponse(response, aesKeyBuffer, initialVectorBuffer);
                res.status(200).send(encryptedResponse);
                return;
            }
        }

        // If we have a catch-all handler, use it
        if (this.flowHandlers.has(FlowTypeEnum.All)) {
            const handler = this.flowHandlers.get(FlowTypeEnum.All);
            if (handler) {
                const response = await Promise.resolve(handler(this.client, decryptedBody));
                const encryptedResponse = this.encryptResponse(response, aesKeyBuffer, initialVectorBuffer);
                res.status(200).send(encryptedResponse);
                return;
            }
        }

        // No handler found, send an empty response
        // Add an empty response here for consistency
        LOGGER.log('No handler found, sending an empty response body: ', decryptedBody);
        const encryptedResponse = this.encryptResponse({}, aesKeyBuffer, initialVectorBuffer);
        res.status(200).send(encryptedResponse);
    }

    public isRequestSignatureValid(req: IRequest & { rawBody: string }): boolean {
        const appSecret = this.config.M4D_APP_SECRET;

        if (!appSecret) {
            LOGGER.warn('App Secret is not set up. Please Add M4D_APP_SECRET or configuration');
            return false;
        }

        const signatureHeader = req.headers['x-hub-signature-256'];

        if (!signatureHeader || typeof signatureHeader !== 'string') {
            LOGGER.warn('x-hub-signature-256 header is missing');
            return false;
        }

        const signatureBuffer = Buffer.from(signatureHeader.replace('sha256=', ''), 'utf-8');
        const hmac = crypto.createHmac('sha256', appSecret);

        const digestString = hmac.update(req.rawBody).digest('hex');
        const digestBuffer = Buffer.from(digestString, 'utf-8');

        // Note: This is corrected from the original code which had inverted logic
        if (!crypto.timingSafeEqual(digestBuffer, signatureBuffer)) {
            LOGGER.error('Error: Request Signature did not match');
            return false;
        }
        return true;
    }

    public decryptRequest(body: any): {
        decryptedBody: FlowEndpointRequest;
        aesKeyBuffer: Buffer;
        initialVectorBuffer: Buffer;
    } {
        const { encrypted_aes_key, encrypted_flow_data, initial_vector } = body;

        const privatePem = this.config.FLOW_API_PRIVATE_PEM.replace(/\\n/g, '\n');
        const passphrase = this.config.FLOW_API_PASSPHRASE;

        const privateKey = crypto.createPrivateKey({ key: privatePem, passphrase });
        let decryptedAesKey = null;
        try {
            decryptedAesKey = crypto.privateDecrypt(
                {
                    key: privateKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256',
                },
                Buffer.from(encrypted_aes_key, 'base64'),
            );
        } catch (error) {
            LOGGER.error(error);
            /*
          Failed to decrypt. Please verify your private key.
          If you change your public key. You need to return HTTP status code 421 to refresh the public key on the client
          */
            throw new Error('Failed to decrypt the request. Please verify your private key.');
        }

        // decrypt flow data
        const flowDataBuffer = Buffer.from(encrypted_flow_data, 'base64');
        const initialVectorBuffer = Buffer.from(initial_vector, 'base64');

        const TAG_LENGTH = 16;
        const encrypted_flow_data_body = flowDataBuffer.subarray(0, -TAG_LENGTH);
        const encrypted_flow_data_tag = flowDataBuffer.subarray(-TAG_LENGTH);

        const decipher = crypto.createDecipheriv('aes-128-gcm', decryptedAesKey, initialVectorBuffer);
        decipher.setAuthTag(encrypted_flow_data_tag);

        const decryptedJSONString = Buffer.concat([
            decipher.update(encrypted_flow_data_body),
            decipher.final(),
        ]).toString('utf-8');

        return {
            decryptedBody: JSON.parse(decryptedJSONString),
            aesKeyBuffer: decryptedAesKey,
            initialVectorBuffer,
        };
    }

    private encryptResponse(response: any, aesKeyBuffer: Buffer, initialVectorBuffer: Buffer) {
        const flipped_iv: number[] = [];
        for (const pair of Array.from(initialVectorBuffer.entries())) {
            flipped_iv.push(~pair[1]);
        }

        try {
            // encrypt response data
            const cipher = crypto.createCipheriv('aes-128-gcm', aesKeyBuffer, Buffer.from(flipped_iv));
            return Buffer.concat([
                cipher.update(JSON.stringify(response || {}), 'utf-8'),
                cipher.final(),
                cipher.getAuthTag(),
            ]).toString('base64');
        } catch (error) {
            LOGGER.error('Response encryption error:', error);
            throw new Error('Failed to encrypt response. Internal server error.');
        }
    }

    /**
     * Register a Flow action handler for a specific flow type
     * @param type The flow type to handle (ping, change, error), or '*' for all types
     * @param handler The handler function that receives the WhatsApp client and the Flow request
     */
    public onFlow(
        type: FlowTypeEnum,
        handler: (whatsapp: WhatsApp, request: FlowEndpointRequest) => any | Promise<any>,
    ): void {
        this.flowHandlers.set(type, handler);
        LOGGER.log(`Registered handler for Flow type: ${type}`);
    }
}
