// Docs: https://fastify.dev/docs/latest/Reference/ContentTypeParser/
import type { WhatsAppConfig } from '../../../../types/config';
import { constructFullUrl } from '../../utils/webhookUtils';
import { WebhookProcessor, type WebhookResponse } from '../../WebhookProcessor';

// Fastify-like interfaces to avoid a direct Fastify dependency
export interface FastifyWebhookRequest {
    method: string;
    url: string;
    headers: Record<string, string | string[] | undefined>;
    body?: unknown;
    query?: unknown;
    /**
     * The unparsed request body. Fastify does not keep it by default: set it in
     * a content-type parser or with the `fastify-raw-body` plugin. Required for
     * `verifyWebhookSignature: true`, because re-serializing the parsed body
     * does not reproduce the bytes Meta signed.
     */
    rawBody?: string | Uint8Array;
}

export interface FastifyWebhookReply {
    code(statusCode: number): FastifyWebhookReply;
    header(name: string, value: string): FastifyWebhookReply;
    send(payload?: any): FastifyWebhookReply;
}

export interface FastifyWebhookConfig extends WhatsAppConfig {
    // Fastify specific config (currently none, but interface reserved for future use)
}

/** The object returned by {@link fastifyWebhookHandler}. */
export type FastifyWebhookHandlers = ReturnType<typeof createHandlers>;

// Singleton cache keyed by phoneNumberId
const handlerCache = new Map<string, FastifyWebhookHandlers>();

function getCacheKey(config: FastifyWebhookConfig): string {
    return `fastify:${config.phoneNumberId ?? 'default'}`;
}

function sendResult(reply: FastifyWebhookReply, result: WebhookResponse): FastifyWebhookReply {
    reply.code(result.status);
    for (const [name, value] of Object.entries(result.headers)) {
        reply.header(name, value);
    }
    return reply.send(result.body);
}

function sendInternalError(reply: FastifyWebhookReply): FastifyWebhookReply {
    return reply
        .code(500)
        .header('Content-Type', 'application/json')
        .send(JSON.stringify({ error: 'Internal Server Error' }));
}

function getQueryParam(query: unknown, name: string): string | null {
    if (typeof query !== 'object' || query === null) return null;
    const value = (query as Record<string, unknown>)[name];
    if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : null;
    return typeof value === 'string' ? value : null;
}

function toHeaders(headers: FastifyWebhookRequest['headers']): Headers {
    const result = new Headers();
    for (const [name, value] of Object.entries(headers)) {
        if (value === undefined) continue;
        // The body is re-sent from memory, so the original framing headers no longer apply.
        if (name === 'content-length' || name === 'transfer-encoding') continue;
        result.set(name, Array.isArray(value) ? value.join(', ') : value);
    }
    return result;
}

function getBody(request: FastifyWebhookRequest): string | Uint8Array | undefined {
    if (request.rawBody !== undefined) return request.rawBody;
    if (request.body === undefined || request.body === null) return undefined;
    // Fallback: re-serialize the parsed body. Signature verification only
    // passes if this reproduces Meta's bytes exactly, so provide `rawBody`.
    return typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
}

function toWebRequest(request: FastifyWebhookRequest): Request {
    const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : getBody(request);
    return new Request(constructFullUrl(request.headers, request.url), {
        method: request.method,
        headers: toHeaders(request.headers),
        body: body as BodyInit | undefined,
    });
}

/**
 * Fastify webhook handler.
 *
 * @example
 * const wa = fastifyWebhookHandler(config);
 * wa.processor.onText(async (whatsapp, { message }) => { ... });
 * app.get('/webhook', wa.GET);
 * app.post('/webhook', wa.POST);
 * app.post('/flow', wa.flow);
 */
export function fastifyWebhookHandler(config: FastifyWebhookConfig): FastifyWebhookHandlers {
    const key = getCacheKey(config);
    const cached = handlerCache.get(key);
    if (cached) return cached;

    const handlers = createHandlers(config, key);
    handlerCache.set(key, handlers);
    return handlers;
}

function createHandlers(config: FastifyWebhookConfig, key: string) {
    const processor = new WebhookProcessor(config);

    const GET = async (request: FastifyWebhookRequest, reply: FastifyWebhookReply): Promise<FastifyWebhookReply> => {
        try {
            const result = await processor.processVerification(
                getQueryParam(request.query, 'hub.mode'),
                getQueryParam(request.query, 'hub.verify_token'),
                getQueryParam(request.query, 'hub.challenge'),
            );
            return sendResult(reply, result);
        } catch (error) {
            console.error('Webhook verification error:', error);
            return sendInternalError(reply);
        }
    };

    const POST = async (request: FastifyWebhookRequest, reply: FastifyWebhookReply): Promise<FastifyWebhookReply> => {
        try {
            return sendResult(reply, await processor.processWebhook(toWebRequest(request)));
        } catch (error) {
            console.error('Webhook processing error:', error);
            return sendInternalError(reply);
        }
    };

    const handlers = {
        GET,
        POST,

        // Auto-routing webhook handler (`app.route({ method: ['GET', 'POST'], url, handler: wa.webhook })`)
        webhook: async (request: FastifyWebhookRequest, reply: FastifyWebhookReply): Promise<FastifyWebhookReply> => {
            switch (request.method.toUpperCase()) {
                case 'GET':
                    return GET(request, reply);
                case 'POST':
                    return POST(request, reply);
                default:
                    return reply
                        .code(405)
                        .header('Content-Type', 'application/json')
                        .header('Allow', 'GET, POST')
                        .send(JSON.stringify({ error: 'Method Not Allowed' }));
            }
        },

        // Flow handler
        flow: async (request: FastifyWebhookRequest, reply: FastifyWebhookReply): Promise<FastifyWebhookReply> => {
            try {
                return sendResult(reply, await processor.processFlow(toWebRequest(request)));
            } catch (error) {
                console.error('Flow processing error:', error);
                return sendInternalError(reply);
            }
        },

        // Expose processor for handler registration
        processor,

        /**
         * Destroy this handler instance: removes all registered handlers
         * and clears it from the singleton cache so the next call creates a fresh instance.
         */
        destroy: () => {
            processor.removeAllHandlers();
            handlerCache.delete(key);
        },
    };

    return handlers;
}
