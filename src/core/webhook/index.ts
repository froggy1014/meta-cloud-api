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
export type { MessageStatus, WebhookContact, WebhookEvent, WebhookMessage } from './types';

// Main SDK class
export { default as WhatsApp } from '../whatsapp/WhatsApp';

// Message builders (for webhook handlers)
export * from '../../api/messages/builders';

// Utils
export * from './utils/generateXHub256Sig';
export * from './utils/webhookUtils';
export type { MessageHandler } from './utils/webhookUtils';
