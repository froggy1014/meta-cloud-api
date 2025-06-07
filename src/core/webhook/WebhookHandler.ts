import { MessageTypesEnum } from '@shared/types';
import { WabaConfigType, WhatsAppConfig } from '@shared/types/config';
import { IncomingMessage } from 'http';

import { FlowEndpointRequest } from '@features/flow';
import { isFlowDataExchangeRequest, isFlowErrorRequest, isFlowPingRequest } from '@shared/utils/flowTypeGuards';
import Logger from '@shared/utils/logger';
import crypto from 'crypto';
import { WhatsApp } from '../whatsapp';

import { FlowTypeEnum } from '@features/flow/types';
import { importConfig } from '@shared/config/importConfig';
import { EventField, WebhookEvent, WebhookMessage } from './types';
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
                    try {
                        await this.preProcessHandler(this.client, processedMessage);
                    } catch (error) {
                        LOGGER.log(`Error in pre-process handler: ${error}`);
                    }
                }

                // 2. Execute type-specific message handler if registered
                const handler = this.messageHandlers.get(messageType);
                if (handler) {
                    try {
                        await handler(this.client, processedMessage);
                    } catch (error) {
                        LOGGER.log(`Error in message handler for ${messageType}: ${error}`);
                    }
                }

                // 3. Execute post-processing handler if exists
                if (this.postProcessHandler) {
                    try {
                        await this.postProcessHandler(this.client, processedMessage);
                    } catch (error) {
                        LOGGER.log(`Error in post-process handler: ${error}`);
                    }
                }
            }
        }
    }

    /**
     * Process other webhook events
     */
    private async processEvent(field: string, value: any): Promise<void> {
        const event: WebhookEvent = {
            field,
            value,
            timestamp: Date.now(),
        };

        const handler = this.eventHandlers.get(field);
        if (handler) {
            try {
                await handler(event);
            } catch (error) {
                LOGGER.log(`Error in event handler for ${field}: ${error}`);
            }
        }
    }

    /**
     * Register a message handler for a specific message type
     */
    public onMessage(
        type: MessageTypesEnum,
        handler: (whatsapp: WhatsApp, message: WebhookMessage) => void | Promise<void>,
    ): void {
        this.messageHandlers.set(type, handler);
        LOGGER.log(`Registered message handler for ${type}`);
    }

    /**
     * Register an event handler for a specific field
     */
    public onEvent(field: string, handler: (event: WebhookEvent) => void | Promise<void>): void {
        this.eventHandlers.set(field, handler);
        LOGGER.log(`Registered event handler for ${field}`);
    }

    /**
     * Register a pre-process handler that runs before all message handlers
     */
    public onMessagePreProcess(handler: (whatsapp: WhatsApp, message: WebhookMessage) => void | Promise<void>): void {
        this.preProcessHandler = handler;
        LOGGER.log('Registered pre-process handler');
    }

    /**
     * Register a post-process handler that runs after all message handlers
     */
    public onMessagePostProcess(handler: (whatsapp: WhatsApp, message: WebhookMessage) => void | Promise<void>): void {
        this.postProcessHandler = handler;
        LOGGER.log('Registered post-process handler');
    }

    public async handleFlowRequest<Req extends IRequest & { rawBody: string }, Res extends IResponse>(
        req: Req,
        res: Res,
    ): Promise<void> {
        try {
            // Validate request signature
            if (!this.isRequestSignatureValid(req)) {
                LOGGER.log('Invalid request signature');
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const body = JSON.parse(req.rawBody);

            // Decrypt the request
            const { decryptedBody } = this.decryptRequest(body);

            // Get the flow handler
            const handler = this.flowHandlers.get(FlowTypeEnum.All);
            if (!handler) {
                LOGGER.log(`No handler registered for flow action: ${decryptedBody.action}`);
                res.status(404).json({ error: 'Handler not found' });
                return;
            }

            // Handle different flow types
            if (isFlowPingRequest(decryptedBody)) {
                // For ping requests, just respond with version
                const response = {
                    version: '3.0',
                    data: {
                        status: 'active',
                    },
                };
                res.status(200).json(response);
                return;
            }

            if (isFlowErrorRequest(decryptedBody)) {
                LOGGER.log(`Flow error: ${JSON.stringify(decryptedBody)}`);
                res.status(200).json({});
                return;
            }

            if (isFlowDataExchangeRequest(decryptedBody)) {
                // Process data exchange request
                const result = await handler(this.client, decryptedBody);

                // Encrypt and send response
                const encryptedResponse = this.encryptResponse(
                    result,
                    Buffer.from(body.aes_key, 'base64'),
                    Buffer.from(body.initial_vector, 'base64'),
                );

                res.status(200).json(encryptedResponse);
                return;
            }

            // Unknown flow type
            LOGGER.log(`Unknown flow request type: ${JSON.stringify(decryptedBody)}`);
            res.status(400).json({ error: 'Unknown request type' });
        } catch (error) {
            LOGGER.log(`Error handling flow request: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Validate the request signature
     */
    public isRequestSignatureValid(req: IRequest & { rawBody: string }): boolean {
        const signature = req.headers['x-hub-signature-256'] as string;
        if (!signature) {
            return false;
        }

        const expectedSignature = crypto
            .createHmac('sha256', this.config.WEBHOOK_VERIFICATION_TOKEN || '')
            .update(req.rawBody, 'utf8')
            .digest('hex');

        const formattedExpectedSignature = `sha256=${expectedSignature}`;

        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(formattedExpectedSignature));
    }

    /**
     * Decrypt a flow request
     */
    public decryptRequest(body: any): {
        decryptedBody: FlowEndpointRequest;
        aesKeyBuffer: Buffer;
        initialVectorBuffer: Buffer;
    } {
        LOGGER.log('Received body for decryption:', JSON.stringify(body, null, 2));

        const { encrypted_aes_key, encrypted_flow_data, initial_vector } = body;

        if (!encrypted_aes_key) {
            throw new Error('Missing required property: encrypted_aes_key');
        }
        if (!encrypted_flow_data) {
            throw new Error('Missing required property: encrypted_flow_data');
        }
        if (!initial_vector) {
            throw new Error('Missing required property: initial_vector');
        }

        LOGGER.log('Received body for privatePem:', JSON.stringify(this.config.FLOW_API_PRIVATE_PEM, null, 2));
        LOGGER.log('Received body for passphrase:', JSON.stringify(this.config.FLOW_API_PASSPHRASE, null, 2));

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

    /**
     * Encrypt a flow response
     */
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
     * Register a flow handler for a specific flow type
     */
    public onFlow(
        type: FlowTypeEnum,
        handler: (whatsapp: WhatsApp, request: FlowEndpointRequest) => any | Promise<any>,
    ): void {
        this.flowHandlers.set(type, handler);
        LOGGER.log(`Registered flow handler for ${type}`);
    }
}
