import crypto from 'node:crypto';

import type { FlowEndpointRequest } from '../../../api/flow';
import { FlowTypeEnum } from '../../../api/flow/types';
import type { WabaConfigType } from '../../../types/config';
import { MessageTypesEnum } from '../../../types/enums';
import { decryptFlowRequest, encryptFlowResponse } from '../../../utils/flowEncryptionUtils';
import { isFlowDataExchangeRequest, isFlowErrorRequest, isFlowPingRequest } from '../../../utils/flowTypeGuards';
import Logger from '../../../utils/logger';
import type WhatsApp from '../../whatsapp/WhatsApp';
import type {
    AccountAlertsWebhookValue,
    AccountReviewUpdateWebhookValue,
    AccountUpdateWebhookValue,
    BusinessCapabilityUpdateWebhookValue,
    FlowsWebhookValue,
    HistoryWebhookValue,
    MessageTemplateQualityUpdateWebhookValue,
    MessageTemplateStatusUpdateWebhookValue,
    MessageWebhookValue,
    PhoneNumberNameUpdateWebhookValue,
    PhoneNumberQualityUpdateWebhookValue,
    SecurityWebhookValue,
    SmbAppStateSyncWebhookValue,
    SmbMessageEchoesWebhookValue,
    StatusWebhook,
    StatusWebhookValue,
    TemplateCategoryUpdateWebhookValue,
    WebhookValue,
    WhatsAppMessage,
} from '../types';

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
    /**
     * The message ID extracted from the appropriate location based on message type.
     * For most messages, this comes from message.id
     * For certain types like nfm_reply, this comes from message.context.id
     */
    messageId: string;
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

/**
 * Processed webhook field types for specialized handlers
 */
export type ProcessedAccountUpdate = {
    wabaId: string;
    value: AccountUpdateWebhookValue['value'];
};

export type ProcessedAccountReviewUpdate = {
    wabaId: string;
    value: AccountReviewUpdateWebhookValue['value'];
};

export type ProcessedAccountAlerts = {
    wabaId: string;
    value: AccountAlertsWebhookValue['value'];
};

export type ProcessedBusinessCapabilityUpdate = {
    wabaId: string;
    value: BusinessCapabilityUpdateWebhookValue['value'];
};

export type ProcessedPhoneNumberNameUpdate = {
    wabaId: string;
    value: PhoneNumberNameUpdateWebhookValue['value'];
};

export type ProcessedPhoneNumberQualityUpdate = {
    wabaId: string;
    value: PhoneNumberQualityUpdateWebhookValue['value'];
};

export type ProcessedMessageTemplateStatusUpdate = {
    wabaId: string;
    value: MessageTemplateStatusUpdateWebhookValue['value'];
};

export type ProcessedTemplateCategoryUpdate = {
    wabaId: string;
    value: TemplateCategoryUpdateWebhookValue['value'];
};

export type ProcessedMessageTemplateQualityUpdate = {
    wabaId: string;
    value: MessageTemplateQualityUpdateWebhookValue['value'];
};

export type ProcessedFlows = {
    wabaId: string;
    value: FlowsWebhookValue['value'];
};

export type ProcessedSecurity = {
    wabaId: string;
    value: SecurityWebhookValue['value'];
};

export type ProcessedHistory = {
    wabaId: string;
    value: HistoryWebhookValue['value'];
};

export type ProcessedSmbMessageEchoes = {
    wabaId: string;
    value: SmbMessageEchoesWebhookValue['value'];
};

export type ProcessedSmbAppStateSync = {
    wabaId: string;
    value: SmbAppStateSyncWebhookValue['value'];
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

// Webhook field handlers
export type AccountUpdateHandler = (whatsapp: WhatsApp, processed: ProcessedAccountUpdate) => void | Promise<void>;
export type AccountReviewUpdateHandler = (
    whatsapp: WhatsApp,
    processed: ProcessedAccountReviewUpdate,
) => void | Promise<void>;
export type AccountAlertsHandler = (whatsapp: WhatsApp, processed: ProcessedAccountAlerts) => void | Promise<void>;
export type BusinessCapabilityUpdateHandler = (
    whatsapp: WhatsApp,
    processed: ProcessedBusinessCapabilityUpdate,
) => void | Promise<void>;
export type PhoneNumberNameUpdateHandler = (
    whatsapp: WhatsApp,
    processed: ProcessedPhoneNumberNameUpdate,
) => void | Promise<void>;
export type PhoneNumberQualityUpdateHandler = (
    whatsapp: WhatsApp,
    processed: ProcessedPhoneNumberQualityUpdate,
) => void | Promise<void>;
export type MessageTemplateStatusUpdateHandler = (
    whatsapp: WhatsApp,
    processed: ProcessedMessageTemplateStatusUpdate,
) => void | Promise<void>;
export type TemplateCategoryUpdateHandler = (
    whatsapp: WhatsApp,
    processed: ProcessedTemplateCategoryUpdate,
) => void | Promise<void>;
export type MessageTemplateQualityUpdateHandler = (
    whatsapp: WhatsApp,
    processed: ProcessedMessageTemplateQualityUpdate,
) => void | Promise<void>;
export type FlowsHandler = (whatsapp: WhatsApp, processed: ProcessedFlows) => void | Promise<void>;
export type SecurityHandler = (whatsapp: WhatsApp, processed: ProcessedSecurity) => void | Promise<void>;
export type HistoryHandler = (whatsapp: WhatsApp, processed: ProcessedHistory) => void | Promise<void>;
export type SmbMessageEchoesHandler = (
    whatsapp: WhatsApp,
    processed: ProcessedSmbMessageEchoes,
) => void | Promise<void>;
export type SmbAppStateSyncHandler = (whatsapp: WhatsApp, processed: ProcessedSmbAppStateSync) => void | Promise<void>;

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
        // Webhook field handlers
        accountUpdateHandler?: AccountUpdateHandler;
        accountReviewUpdateHandler?: AccountReviewUpdateHandler;
        accountAlertsHandler?: AccountAlertsHandler;
        businessCapabilityUpdateHandler?: BusinessCapabilityUpdateHandler;
        phoneNumberNameUpdateHandler?: PhoneNumberNameUpdateHandler;
        phoneNumberQualityUpdateHandler?: PhoneNumberQualityUpdateHandler;
        messageTemplateStatusUpdateHandler?: MessageTemplateStatusUpdateHandler;
        templateCategoryUpdateHandler?: TemplateCategoryUpdateHandler;
        messageTemplateQualityUpdateHandler?: MessageTemplateQualityUpdateHandler;
        flowsHandler?: FlowsHandler;
        securityHandler?: SecurityHandler;
        historyHandler?: HistoryHandler;
        smbMessageEchoesHandler?: SmbMessageEchoesHandler;
        smbAppStateSyncHandler?: SmbAppStateSyncHandler;
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
                    } else if (change.field === 'account_update') {
                        await processWebhookField(
                            entry.id,
                            change as AccountUpdateWebhookValue,
                            handlers.accountUpdateHandler,
                            whatsapp,
                        );
                    } else if (change.field === 'account_review_update') {
                        await processWebhookField(
                            entry.id,
                            change as AccountReviewUpdateWebhookValue,
                            handlers.accountReviewUpdateHandler,
                            whatsapp,
                        );
                    } else if (change.field === 'account_alerts') {
                        await processWebhookField(
                            entry.id,
                            change as AccountAlertsWebhookValue,
                            handlers.accountAlertsHandler,
                            whatsapp,
                        );
                    } else if (change.field === 'business_capability_update') {
                        await processWebhookField(
                            entry.id,
                            change as BusinessCapabilityUpdateWebhookValue,
                            handlers.businessCapabilityUpdateHandler,
                            whatsapp,
                        );
                    } else if (change.field === 'phone_number_name_update') {
                        await processWebhookField(
                            entry.id,
                            change as PhoneNumberNameUpdateWebhookValue,
                            handlers.phoneNumberNameUpdateHandler,
                            whatsapp,
                        );
                    } else if (change.field === 'phone_number_quality_update') {
                        await processWebhookField(
                            entry.id,
                            change as PhoneNumberQualityUpdateWebhookValue,
                            handlers.phoneNumberQualityUpdateHandler,
                            whatsapp,
                        );
                    } else if (change.field === 'message_template_status_update') {
                        await processWebhookField(
                            entry.id,
                            change as MessageTemplateStatusUpdateWebhookValue,
                            handlers.messageTemplateStatusUpdateHandler,
                            whatsapp,
                        );
                    } else if (change.field === 'template_category_update') {
                        await processWebhookField(
                            entry.id,
                            change as TemplateCategoryUpdateWebhookValue,
                            handlers.templateCategoryUpdateHandler,
                            whatsapp,
                        );
                    } else if (change.field === 'message_template_quality_update') {
                        await processWebhookField(
                            entry.id,
                            change as MessageTemplateQualityUpdateWebhookValue,
                            handlers.messageTemplateQualityUpdateHandler,
                            whatsapp,
                        );
                    } else if (change.field === 'flows') {
                        await processWebhookField(
                            entry.id,
                            change as FlowsWebhookValue,
                            handlers.flowsHandler,
                            whatsapp,
                        );
                    } else if (change.field === 'security') {
                        await processWebhookField(
                            entry.id,
                            change as SecurityWebhookValue,
                            handlers.securityHandler,
                            whatsapp,
                        );
                    } else if (change.field === 'history') {
                        await processWebhookField(
                            entry.id,
                            change as HistoryWebhookValue,
                            handlers.historyHandler,
                            whatsapp,
                        );
                    } else if (change.field === 'smb_message_echoes') {
                        await processWebhookField(
                            entry.id,
                            change as SmbMessageEchoesWebhookValue,
                            handlers.smbMessageEchoesHandler,
                            whatsapp,
                        );
                    } else if (change.field === 'smb_app_state_sync') {
                        await processWebhookField(
                            entry.id,
                            change as SmbAppStateSyncWebhookValue,
                            handlers.smbAppStateSyncHandler,
                            whatsapp,
                        );
                    } else {
                        LOGGER.warn(`Unhandled webhook field: ${change.field}`);
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
 * Extract message ID based on message type
 * Some message types (like nfm_reply) have ID in context instead of root level
 */
function extractMessageId(message: WhatsAppMessage): string {
    // If message has id at root level, use it
    if (message.id) {
        return message.id;
    }

    // For interactive and button messages, check context.id
    if (message.type === MessageTypesEnum.Interactive || message.type === MessageTypesEnum.Button) {
        const msgWithContext = message as any;
        if (msgWithContext.context?.id) {
            return msgWithContext.context.id;
        }
    }

    // Fallback to empty string if no ID found
    return '';
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
                messageId: extractMessageId(message),
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
            LOGGER.error(`Error in ${handlerType} handler:`, { error, messageId: processed.messageId });
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

/**
 * Generic webhook field processor
 * Processes webhook fields other than 'messages'
 */
async function processWebhookField<T extends { field: string; value: any }>(
    wabaId: string,
    webhookValue: T,
    handler:
        | ((whatsapp: WhatsApp, processed: { wabaId: string; value: T['value'] }) => void | Promise<void>)
        | undefined,
    whatsapp: WhatsApp,
): Promise<void> {
    if (handler) {
        try {
            await handler(whatsapp, {
                wabaId,
                value: webhookValue.value,
            });
        } catch (error) {
            LOGGER.error(`Error in ${webhookValue.field} handler:`, { error, wabaId });
        }
    }
}
