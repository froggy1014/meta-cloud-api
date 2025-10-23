import crypto from 'crypto';

import { FlowEndpointRequest } from '../../../api/flow';
import { FlowTypeEnum } from '../../../api/flow/types';
import { WabaConfigType } from '../../../types/config';
import { MessageTypesEnum } from '../../../types/enums';
import { decryptFlowRequest, encryptFlowResponse } from '../../../utils/flowEncryptionUtils';
import { isFlowDataExchangeRequest, isFlowErrorRequest, isFlowPingRequest } from '../../../utils/flowTypeGuards';
import Logger from '../../../utils/logger';
import WhatsApp from '../../whatsapp/WhatsApp';
import { MessageWebhookValue, StatusWebhook, StatusWebhookValue, WebhookValue, WhatsAppMessage } from '../types';

const LIB_NAME = 'WEBHOOK_UTILS';
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true');

/**
 * Processed message with metadata for handlers
 */
export type ProcessedMessage = {
    wabaId: string;
    phoneNumberId: string;
    displayPhoneNumber: string;
    profileName: string;
    message: WhatsAppMessage;
};

/**
 * Processed status with metadata for handlers
 */
export type ProcessedStatus = {
    wabaId: string;
    phoneNumberId: string;
    displayPhoneNumber: string;
    status: StatusWebhook;
};

// Type-specific processed messages for specialized handlers
export type TextProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Text }>;
};

export type ImageProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Image }>;
};

export type VideoProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Video }>;
};

export type AudioProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Audio }>;
};

export type DocumentProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Document }>;
};

export type StickerProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Sticker }>;
};

export type InteractiveProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Interactive }>;
};

export type ButtonProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Button }>;
};

export type LocationProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Location }>;
};

export type ContactsProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Contacts }>;
};

export type ReactionProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Reaction }>;
};

export type OrderProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.Order }>;
};

export type SystemProcessedMessage = ProcessedMessage & {
    message: Extract<WhatsAppMessage, { type: MessageTypesEnum.System }>;
};

export type MessageHandler = (whatsapp: WhatsApp, processed: ProcessedMessage) => void | Promise<void>;
export type StatusHandler = (whatsapp: WhatsApp, processed: ProcessedStatus) => void | Promise<void>;
export type FlowHandler = (whatsapp: WhatsApp, request: FlowEndpointRequest) => any | Promise<any>;

// Type-specific handlers for specialized methods
export type TextMessageHandler = (whatsapp: WhatsApp, processed: TextProcessedMessage) => void | Promise<void>;
export type ImageMessageHandler = (whatsapp: WhatsApp, processed: ImageProcessedMessage) => void | Promise<void>;
export type VideoMessageHandler = (whatsapp: WhatsApp, processed: VideoProcessedMessage) => void | Promise<void>;
export type AudioMessageHandler = (whatsapp: WhatsApp, processed: AudioProcessedMessage) => void | Promise<void>;
export type DocumentMessageHandler = (whatsapp: WhatsApp, processed: DocumentProcessedMessage) => void | Promise<void>;
export type StickerMessageHandler = (whatsapp: WhatsApp, processed: StickerProcessedMessage) => void | Promise<void>;
export type InteractiveMessageHandler = (
    whatsapp: WhatsApp,
    processed: InteractiveProcessedMessage,
) => void | Promise<void>;
export type ButtonMessageHandler = (whatsapp: WhatsApp, processed: ButtonProcessedMessage) => void | Promise<void>;
export type LocationMessageHandler = (whatsapp: WhatsApp, processed: LocationProcessedMessage) => void | Promise<void>;
export type ContactsMessageHandler = (whatsapp: WhatsApp, processed: ContactsProcessedMessage) => void | Promise<void>;
export type ReactionMessageHandler = (whatsapp: WhatsApp, processed: ReactionProcessedMessage) => void | Promise<void>;
export type OrderMessageHandler = (whatsapp: WhatsApp, processed: OrderProcessedMessage) => void | Promise<void>;
export type SystemMessageHandler = (whatsapp: WhatsApp, processed: SystemProcessedMessage) => void | Promise<void>;

/**
 * Process webhook messages
 */
export async function processWebhookMessages(
    request: Request,
    whatsapp: WhatsApp,
    handlers: {
        messageHandlers: Map<MessageTypesEnum, MessageHandler>;
        statusHandler?: StatusHandler;
        preProcessHandler?: MessageHandler;
        postProcessHandler?: MessageHandler;
    },
): Promise<Response> {
    try {
        const body = await request.json();

        // Check this is a WhatsApp Business Account webhook
        if (body.object !== 'whatsapp_business_account') {
            const errorMsg = 'Received webhook for non-WhatsApp event';
            LOGGER.warn(errorMsg);
            return new Response(JSON.stringify({ error: errorMsg }), { status: 404 });
        }

        const errors: string[] = [];

        // Process each entry
        for (const entry of body.entry) {
            try {
                const changes = entry.changes;
                for (const change of changes) {
                    if (change.field === 'messages') {
                        await processMessages(entry.id, change.value, whatsapp, handlers);
                    }
                }
            } catch (error) {
                const errorMsg = `Error processing webhook: ${error}`;
                LOGGER.error(errorMsg, { entry, error });
                errors.push(errorMsg);
            }
        }

        return new Response(errors.length > 0 ? JSON.stringify({ errors }) : null, { status: 200 });
    } catch (error) {
        LOGGER.error('Error processing webhook:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}

/**
 * Create a standard ping response for WhatsApp Flow health checks
 * @returns Flow ping response object
 */
export function createFlowPingResponse() {
    return {
        version: '3.0',
        data: { status: 'active' },
    };
}

/**
 * Create a standard error response for WhatsApp Flow error notifications
 * @returns Acknowledgement response for error notification
 */
export function createFlowErrorResponse() {
    return {
        data: {
            acknowledged: true,
        },
    };
}

/**
 * Handle flow requests
 */
export async function processFlowRequest(
    request: Request,
    config: WabaConfigType,
    whatsapp: WhatsApp,
    flowHandlers: Map<FlowTypeEnum, FlowHandler>,
): Promise<Response> {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-hub-signature-256');

        // Validate request signature
        if (!verifySignature(body, signature, config.WEBHOOK_VERIFICATION_TOKEN || '')) {
            LOGGER.warn('Invalid request signature');
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const data = JSON.parse(body);

        // Decrypt the request and get decrypted AES key and IV
        const { decryptedBody, aesKeyBuffer, initialVectorBuffer } = decryptFlowRequest(data, config);

        // Determine flow type
        const isPing = isFlowPingRequest(decryptedBody);
        const isError = isFlowErrorRequest(decryptedBody);
        const isDataExchange = isFlowDataExchangeRequest(decryptedBody);

        let flowType: FlowTypeEnum;
        if (isPing) {
            flowType = FlowTypeEnum.Ping;
        } else if (isError) {
            flowType = FlowTypeEnum.Error;
        } else if (isDataExchange) {
            flowType = FlowTypeEnum.Change;
        } else {
            flowType = FlowTypeEnum.All;
        }

        // Get the flow handler based on type
        let handler = flowHandlers.get(flowType);

        // For Ping and Error, use default handlers if not registered
        if (!handler) {
            if (flowType === FlowTypeEnum.Ping) {
                handler = () => createFlowPingResponse();
            } else if (flowType === FlowTypeEnum.Error) {
                handler = () => createFlowErrorResponse();
            } else {
                // For Change and other types, try All handler as fallback
                handler = flowHandlers.get(FlowTypeEnum.All);
                if (!handler) {
                    LOGGER.warn('No handler registered for flow type:', { flowType, action: decryptedBody.action });
                    return new Response(JSON.stringify({ error: 'Handler not found' }), { status: 404 });
                }
            }
        }

        // Call the user's handler for the flow type
        const result = await handler(whatsapp, decryptedBody);

        // Return response based on flow type
        if (isError) {
            LOGGER.warn('Flow error notification received', { error: decryptedBody.data });

            // If user handler didn't return a response, use default acknowledgement
            const errorResponse = result || createFlowErrorResponse();

            return new Response(JSON.stringify(errorResponse), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Both ping and data_exchange responses need to be encrypted
        if (isPing || isDataExchange) {
            // Encrypt the response using decrypted AES key and IV
            const encryptedResponse = encryptFlowResponse(result, aesKeyBuffer, initialVectorBuffer);

            // Meta expects the encrypted response as a plain base64 string (not wrapped in JSON)
            return new Response(encryptedResponse, {
                status: 200,
                headers: { 'Content-Type': 'text/plain' },
            });
        }

        LOGGER.warn('Unknown flow request type:', decryptedBody);
        return new Response(JSON.stringify({ error: 'Unknown request type' }), { status: 400 });
    } catch (error) {
        LOGGER.error('Error handling flow request:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}

/**
 * Verify webhook signature
 */
function verifySignature(body: string, signature: string | null, verificationToken: string): boolean {
    if (!signature) {
        LOGGER.warn('Missing signature in request');
        return false;
    }

    const expectedSignature = crypto.createHmac('sha256', verificationToken).update(body).digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature.replace('sha256=', '')), Buffer.from(expectedSignature));
}

/**
 * Constructs a full URL from framework-specific request headers and URL
 * @param headers - Request headers containing host and protocol information
 * @param url - Relative URL path
 * @returns Full URL string
 */
export function constructFullUrl(headers: Record<string, string | string[] | undefined>, url?: string): string {
    const protocol = headers['x-forwarded-proto'] || 'http';
    const host = headers.host || 'localhost';
    const path = url || '/';
    return `${protocol}://${host}${path}`;
}

/**
 * Private helper functions
 */
async function processMessages(
    waba_id: string,
    value: WebhookValue,
    whatsapp: WhatsApp,
    handlers: {
        messageHandlers: Map<MessageTypesEnum, MessageHandler>;
        statusHandler?: StatusHandler;
        preProcessHandler?: MessageHandler;
        postProcessHandler?: MessageHandler;
    },
): Promise<void> {
    const metadata = value.metadata;
    const wabaId = waba_id;
    const displayPhoneNumber = metadata.display_phone_number;
    const phoneNumberId = metadata.phone_number_id;

    // Handle status webhooks
    if ('statuses' in value && value.statuses) {
        const statusValue = value as StatusWebhookValue;
        for (const status of statusValue.statuses) {
            const processed: ProcessedStatus = {
                wabaId,
                phoneNumberId,
                displayPhoneNumber,
                status,
            };

            await executeStatusHandler(handlers.statusHandler, whatsapp, processed);
        }
        return;
    }

    // Handle message webhooks
    if ('messages' in value && value.messages) {
        const messageValue = value as MessageWebhookValue;
        const profileName = messageValue.contacts?.[0]?.profile?.name || '';

        for (const message of messageValue.messages) {
            const processed: ProcessedMessage = {
                wabaId,
                phoneNumberId,
                displayPhoneNumber,
                profileName,
                message,
            };

            const messageType = message.type;

            // Execute handlers in sequence
            await executeMessageHandler(handlers.preProcessHandler, whatsapp, processed, 'pre-process');
            await executeMessageHandler(handlers.messageHandlers.get(messageType), whatsapp, processed, messageType);
            await executeMessageHandler(handlers.postProcessHandler, whatsapp, processed, 'post-process');
        }
    }
}

async function executeMessageHandler(
    handler: MessageHandler | undefined,
    whatsapp: WhatsApp,
    processed: ProcessedMessage,
    handlerType: string,
): Promise<void> {
    if (handler) {
        try {
            await handler(whatsapp, processed);
        } catch (error) {
            LOGGER.error(`Error in ${handlerType} handler:`, { error, messageId: processed.message.id });
        }
    }
}

async function executeStatusHandler(
    handler: StatusHandler | undefined,
    whatsapp: WhatsApp,
    processed: ProcessedStatus,
): Promise<void> {
    if (handler) {
        try {
            await handler(whatsapp, processed);
        } catch (error) {
            LOGGER.error('Error in status handler:', { error, statusId: processed.status.id });
        }
    }
}
