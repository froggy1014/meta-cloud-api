// Enhanced Framework-Specific Webhooks (Recommended)
export * from './frameworks/express';
export * from './frameworks/nextjs-page';
export * from './frameworks/nextjs-app';

// Framework interfaces
export type { ExpressRequest, ExpressResponse, ExpressWebhookConfig, NextFunction } from './frameworks/express/express';
export type { NextJsWebhookConfig } from './frameworks/nextjs-page/nextjs-page';

// Core Processor (for advanced usage)
export { WebhookProcessor } from './WebhookProcessor';
export type { WebhookResponse } from './WebhookProcessor';

// Types
export type {
    MessageStatus,
    WebhookContact,
    WebhookEvent,
    WebhookValue,
    MessageWebhookValue,
    StatusWebhookValue,
    WhatsAppMessage,
    StatusWebhook,
} from './types';

// Main SDK class
export { default as WhatsApp } from '../whatsapp/WhatsApp';

// Utils
export * from './utils/generateXHub256Sig';
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
    ProcessedMessage,
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
} from './utils/webhookUtils';
export { constructFullUrl, processFlowRequest, processWebhookMessages } from './utils/webhookUtils';
