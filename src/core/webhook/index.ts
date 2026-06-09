// Enhanced Framework-Specific Webhooks (Recommended)

// Main SDK class
export { default as WhatsApp } from '../whatsapp/WhatsApp';
export * from './frameworks/express';
// Framework interfaces
export type { ExpressRequest, ExpressResponse, ExpressWebhookConfig, NextFunction } from './frameworks/express/express';
export * from './frameworks/nextjs-app';
export * from './frameworks/nextjs-page';
export type { NextJsWebhookConfig } from './frameworks/nextjs-page/nextjs-page';
// Types
export type {
    MessageStatus,
    MessageWebhookValue,
    StatusWebhook,
    StatusWebhookValue,
    WebhookContact,
    WebhookEvent,
    WebhookValue,
    WhatsAppMessage,
} from './types';
// Message utilities
export { extractMessageText } from './utils/extractMessageText';
// Utils
export * from './utils/generateXHub256Sig';
export type {
    ContactInfo,
    InteractiveReply,
    LocationInfo,
    MediaInfo,
    OrderInfo,
    ReactionInfo,
} from './utils/messageHelpers';
export {
    getContactsInfo,
    getInteractiveReply,
    getLocationInfo,
    // Structured extractors
    getMediaInfo,
    getOrderInfo,
    getReactionInfo,
    isAudioMessage,
    isButtonMessage,
    isButtonReply,
    isContactsMessage,
    isDocumentMessage,
    isImageMessage,
    isInteractiveMessage,
    isListReply,
    isLocationMessage,
    isNfmReply,
    isOrderMessage,
    isReactionMessage,
    isStickerMessage,
    isSystemMessage,
    // Type guards
    isTextMessage,
    isVideoMessage,
} from './utils/messageHelpers';
export type { PaymentMethodSelection } from './utils/paymentHelpers-br';
export {
    getPaymentMethodSelection,
    isOrderDetailsButtonClick,
    isPaymentMethodMessage,
    ORDER_DETAILS_CLICKED_PAYLOAD,
} from './utils/paymentHelpers-br';
export type { PaymentTransactionInfo } from './utils/paymentHelpers-in';
export { getPaymentTransactionInfo, isPaymentTransactionStatus } from './utils/paymentHelpers-in';
export type {
    AudioMessageHandler,
    AudioProcessedMessage,
    ButtonMessageHandler,
    ButtonProcessedMessage,
    ContactsMessageHandler,
    ContactsProcessedMessage,
    DocumentMessageHandler,
    DocumentProcessedMessage,
    FlowHandler,
    ImageMessageHandler,
    ImageProcessedMessage,
    InteractiveMessageHandler,
    InteractiveProcessedMessage,
    LocationMessageHandler,
    LocationProcessedMessage,
    MessageHandler,
    OrderMessageHandler,
    OrderProcessedMessage,
    PaymentMethodHandler,
    PaymentMethodProcessedMessage,
    PaymentStatusHandler,
    ProcessedMessage,
    ProcessedPaymentStatus,
    ProcessedStatus,
    ReactionMessageHandler,
    ReactionProcessedMessage,
    StatusHandler,
    StickerMessageHandler,
    StickerProcessedMessage,
    SystemMessageHandler,
    SystemProcessedMessage,
    TextMessageHandler,
    TextProcessedMessage,
    VideoMessageHandler,
    VideoProcessedMessage,
    WebhookHandlerContext,
} from './utils/webhookUtils';
export { constructFullUrl, processFlowRequest, processWebhookMessages } from './utils/webhookUtils';
export type { WebhookResponse } from './WebhookProcessor';
// Core Processor (for advanced usage)
export { WebhookProcessor } from './WebhookProcessor';
