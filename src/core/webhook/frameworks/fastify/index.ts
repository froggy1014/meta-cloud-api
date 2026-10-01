// Fastify webhook handler

export type { WebhookContact, WebhookEvent, WebhookMessage } from '../../types';

// Types
export type {
    FastifyWebhookConfig,
    FastifyWebhookHandlers,
    FastifyWebhookReply,
    FastifyWebhookRequest,
} from './fastify';
export { fastifyWebhookHandler } from './fastify';
