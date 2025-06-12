import { FlowEndpointRequest } from '@features/flow';
import { FlowTypeEnum } from '@features/flow/types';
import { MessageTypesEnum } from '@shared/types';
import { WabaConfigType } from '@shared/types/config';
import { isFlowDataExchangeRequest, isFlowErrorRequest, isFlowPingRequest } from '@shared/utils/flowTypeGuards';
import Logger from '@shared/utils/logger';
import crypto from 'crypto';
import { WhatsApp } from '../../whatsapp';
import { WebhookMessage, WebhookMessageValue } from '../types';

const LIB_NAME = 'WEBHOOK_UTILS';
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true');

export type MessageHandler = (whatsapp: WhatsApp, message: WebhookMessage) => void | Promise<void>;
export type FlowHandler = (whatsapp: WhatsApp, request: FlowEndpointRequest) => any | Promise<any>;

/**
 * Process webhook messages
 */
export async function processWebhookMessages(
    request: Request,
    whatsapp: WhatsApp,
    handlers: {
        messageHandlers: Map<MessageTypesEnum, MessageHandler>;
        preProcessHandler?: MessageHandler;
        postProcessHandler?: MessageHandler;
    },
): Promise<Response> {
    try {
        const body = await request.json();

        // Check this is a WhatsApp Business Account webhook
        if (body.object !== 'whatsapp_business_account') {
            const errorMsg = 'Received webhook for non-WhatsApp event';
            LOGGER.log(errorMsg);
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
                LOGGER.log(errorMsg);
                errors.push(errorMsg);
            }
        }

        return new Response(errors.length > 0 ? JSON.stringify({ errors }) : null, { status: 200 });
    } catch (error) {
        LOGGER.log(`Error processing webhook: ${error}`);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
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
            LOGGER.log('Invalid request signature');
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const data = JSON.parse(body);

        // Decrypt the request
        const { decryptedBody } = decryptFlowRequest(data, config);

        // Get the flow handler
        const handler = flowHandlers.get(FlowTypeEnum.All);
        if (!handler) {
            LOGGER.log(`No handler registered for flow action: ${decryptedBody.action}`);
            return new Response(JSON.stringify({ error: 'Handler not found' }), { status: 404 });
        }

        // Handle different flow types
        if (isFlowPingRequest(decryptedBody)) {
            return new Response(
                JSON.stringify({
                    version: '3.0',
                    data: { status: 'active' },
                }),
                { status: 200 },
            );
        }

        if (isFlowErrorRequest(decryptedBody)) {
            LOGGER.log(`Flow error: ${JSON.stringify(decryptedBody)}`);
            return new Response(null, { status: 200 });
        }

        if (isFlowDataExchangeRequest(decryptedBody)) {
            const result = await handler(whatsapp, decryptedBody);
            const encryptedResponse = encryptFlowResponse(
                result,
                Buffer.from(data.aes_key, 'base64'),
                Buffer.from(data.initial_vector, 'base64'),
            );

            return new Response(JSON.stringify(encryptedResponse), { status: 200 });
        }

        LOGGER.log(`Unknown flow request type: ${JSON.stringify(decryptedBody)}`);
        return new Response(JSON.stringify({ error: 'Unknown request type' }), { status: 400 });
    } catch (error) {
        LOGGER.log(`Error handling flow request: ${error}`);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}

/**
 * Verify webhook signature
 */
function verifySignature(body: string, signature: string | null, verificationToken: string): boolean {
    if (!signature) return false;

    const expectedSignature = crypto.createHmac('sha256', verificationToken).update(body).digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature.replace('sha256=', '')), Buffer.from(expectedSignature));
}

/**
 * Private helper functions
 */
async function processMessages(
    waba_id: string,
    value: WebhookMessageValue,
    whatsapp: WhatsApp,
    handlers: {
        messageHandlers: Map<MessageTypesEnum, MessageHandler>;
        preProcessHandler?: MessageHandler;
        postProcessHandler?: MessageHandler;
    },
): Promise<void> {
    const metadata = value.metadata;
    const contacts = value.contacts;
    const wabaId = waba_id;
    const displayPhoneNumber = metadata?.display_phone_number || '';
    const phoneNumberId = metadata?.phone_number_id || '';
    const profileName = contacts?.[0]?.profile?.name || '';

    if (value.statuses && value.statuses.length > 0) {
        const statuses = value.statuses;
        for (const status of statuses) {
            const processedStatus: WebhookMessage = {
                wabaId,
                id: status.id,
                from: status.recipient_id,
                timestamp: status.timestamp,
                type: MessageTypesEnum.Statuses,
                phoneNumberId,
                displayPhoneNumber,
                profileName,
                statuses: value.statuses[0],
                originalData: status,
            };

            await executeHandler(
                handlers.messageHandlers.get(MessageTypesEnum.Statuses),
                whatsapp,
                processedStatus,
                MessageTypesEnum.Statuses,
            );
        }
        return;
    }

    if (value.messages && value.messages.length > 0) {
        const messages = value.messages;

        for (const message of messages) {
            const messageType = message.type;

            const processedMessage: WebhookMessage = {
                wabaId,
                id: message.id,
                from: message.from,
                timestamp: message.timestamp,
                type: message.type,
                phoneNumberId,
                displayPhoneNumber,
                profileName,
                originalData: message,
            };

            switch (messageType) {
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
                case MessageTypesEnum.Reaction:
                    processedMessage.reaction = message.reaction;
                    break;
                default:
                    LOGGER.log(`Unknown message type: ${messageType}`);
                    break;
            }

            // Execute handlers in sequence
            await executeHandler(handlers.preProcessHandler, whatsapp, processedMessage, 'pre-process');
            await executeHandler(handlers.messageHandlers.get(messageType), whatsapp, processedMessage, messageType);
            await executeHandler(handlers.postProcessHandler, whatsapp, processedMessage, 'post-process');
        }
    }
}

async function executeHandler(
    handler: MessageHandler | undefined,
    whatsapp: WhatsApp,
    message: WebhookMessage,
    handlerType: string,
): Promise<void> {
    if (handler) {
        try {
            await handler(whatsapp, message);
        } catch (error) {
            LOGGER.log(`Error in ${handlerType} handler: ${error}`);
        }
    }
}

function decryptFlowRequest(
    body: any,
    config: WabaConfigType,
): {
    decryptedBody: FlowEndpointRequest;
    aesKeyBuffer: Buffer;
    initialVectorBuffer: Buffer;
} {
    const { encrypted_aes_key, encrypted_flow_data, initial_vector } = body;

    if (!encrypted_aes_key || !encrypted_flow_data || !initial_vector) {
        throw new Error('Missing required encryption properties');
    }

    const privatePem = config.FLOW_API_PRIVATE_PEM.replace(/\\n/g, '\n');
    const passphrase = config.FLOW_API_PASSPHRASE;

    const privateKey = crypto.createPrivateKey({ key: privatePem, passphrase });
    let decryptedAesKey: Buffer;

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
        throw new Error('Failed to decrypt the request. Please verify your private key.');
    }

    const flowDataBuffer = Buffer.from(encrypted_flow_data, 'base64');
    const initialVectorBuffer = Buffer.from(initial_vector, 'base64');

    const TAG_LENGTH = 16;
    const encrypted_flow_data_body = flowDataBuffer.subarray(0, -TAG_LENGTH);
    const encrypted_flow_data_tag = flowDataBuffer.subarray(-TAG_LENGTH);

    const decipher = crypto.createDecipheriv('aes-128-gcm', decryptedAesKey, initialVectorBuffer);
    decipher.setAuthTag(encrypted_flow_data_tag);

    const decryptedJSONString = Buffer.concat([decipher.update(encrypted_flow_data_body), decipher.final()]).toString(
        'utf-8',
    );

    return {
        decryptedBody: JSON.parse(decryptedJSONString),
        aesKeyBuffer: decryptedAesKey,
        initialVectorBuffer,
    };
}

function encryptFlowResponse(response: any, aesKeyBuffer: Buffer, initialVectorBuffer: Buffer): string {
    const flipped_iv: number[] = [];
    for (const pair of Array.from(initialVectorBuffer.entries())) {
        flipped_iv.push(~pair[1]);
    }

    try {
        const cipher = crypto.createCipheriv('aes-128-gcm', aesKeyBuffer, Buffer.from(flipped_iv));
        return Buffer.concat([
            cipher.update(JSON.stringify(response || {}), 'utf-8'),
            cipher.final(),
            cipher.getAuthTag(),
        ]).toString('base64');
    } catch (error) {
        LOGGER.log('Response encryption error:', error);
        throw new Error('Failed to encrypt response. Internal server error.');
    }
}
