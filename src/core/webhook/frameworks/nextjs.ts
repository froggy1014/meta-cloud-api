// Next.js Pages Router webhook handler (legacy alias)

export type { WebhookContact, WebhookEvent, WebhookMessage } from '../types';

// Types
export type { BaseApiRequest, BaseApiResponse, NextJsWebhookConfig } from './nextjs-page';
export { nextjsPagesWebhookHandler as webhookHandler } from './nextjs-page';
