// Express webhook handler
export { expressWebhookHandler, expressWebhookHandler as webhookHandler } from './express';

// Types
export type { WebhookContact, WebhookEvent, WebhookMessage } from '../../types';
export type { ExpressRequest, ExpressResponse, ExpressWebhookConfig, NextFunction } from './express';
