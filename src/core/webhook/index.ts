// Enhanced Framework-Specific Webhooks (Recommended)
export { webhookHandler as ExpressWebhook } from './frameworks/express';
export { webhookHandler as NextJsWebhook } from './frameworks/nextjs';

// Framework interfaces
export type { ExpressRequest, ExpressResponse, ExpressWebhookConfig, NextFunction } from './frameworks/express';
export type { NextJsWebhookConfig } from './frameworks/nextjs';

// Core Processor (for advanced usage)
export { WebhookProcessor } from './WebhookProcessor';
export type { WebhookResponse } from './WebhookProcessor';

// Types
export type { MessageStatus, WebhookContact, WebhookEvent, WebhookMessage } from './types';

// Utils
export * from './utils/generateXHub256Sig';
export * from './utils/webhookUtils';
