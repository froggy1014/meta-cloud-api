// Docs: https://hono.dev/docs/api/context
import type { WhatsAppConfig } from '../../../../types/config';
import { WebhookProcessor, type WebhookResponse } from '../../WebhookProcessor';

/**
 * The part of Hono's `Context` this adapter uses, typed locally so `hono` is
 * not a dependency. Any Hono `Context` satisfies it: `c.req.raw` is the
 * underlying web `Request`.
 */
export interface HonoWebhookContext {
    req: {
        raw: Request;
        /** Hono's cached body reader, used when middleware already consumed `raw`. */
        text?: () => Promise<string>;
    };
}

export interface HonoWebhookConfig extends WhatsAppConfig {
    // Hono specific config (currently none, but interface reserved for future use)
}

/** The object returned by {@link honoWebhookHandler}. */
export type HonoWebhookHandlers = ReturnType<typeof createHandlers>;

// Singleton cache keyed by phoneNumberId
const handlerCache = new Map<string, HonoWebhookHandlers>();

function getCacheKey(config: HonoWebhookConfig): string {
    return `hono:${config.phoneNumberId ?? 'default'}`;
}

function toResponse(result: WebhookResponse): Response {
    return new Response(result.body, { status: result.status, headers: result.headers });
}

function internalError(): Response {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
}

/**
 * Return the web Request for this context. If middleware already read the body
 * (e.g. `await c.req.json()`), rebuild the request from Hono's body cache.
 */
async function getRequest(c: HonoWebhookContext): Promise<Request> {
    const raw = c.req.raw;
    if (!raw.bodyUsed || !c.req.text) return raw;
    return new Request(raw.url, { method: raw.method, headers: raw.headers, body: await c.req.text() });
}

/**
 * Hono webhook handler. Works on every runtime Hono runs on (Node.js, Bun,
 * Deno, Cloudflare Workers, Vercel Edge).
 *
 * @example
 * const wa = honoWebhookHandler(config);
 * wa.processor.onText(async (whatsapp, { message }) => { ... });
 * app.get('/webhook', wa.GET);
 * app.post('/webhook', wa.POST);
 * app.post('/flow', wa.flow);
 */
export function honoWebhookHandler(config: HonoWebhookConfig): HonoWebhookHandlers {
    const key = getCacheKey(config);
    const cached = handlerCache.get(key);
    if (cached) return cached;

    const handlers = createHandlers(config, key);
    handlerCache.set(key, handlers);
    return handlers;
}

function createHandlers(config: HonoWebhookConfig, key: string) {
    const processor = new WebhookProcessor(config);

    const GET = async (c: HonoWebhookContext): Promise<Response> => {
        try {
            const { searchParams } = new URL(c.req.raw.url);
            const result = await processor.processVerification(
                searchParams.get('hub.mode'),
                searchParams.get('hub.verify_token'),
                searchParams.get('hub.challenge'),
            );
            return toResponse(result);
        } catch (error) {
            console.error('Webhook verification error:', error);
            return internalError();
        }
    };

    const POST = async (c: HonoWebhookContext): Promise<Response> => {
        try {
            return toResponse(await processor.processWebhook(await getRequest(c)));
        } catch (error) {
            console.error('Webhook processing error:', error);
            return internalError();
        }
    };

    const handlers = {
        GET,
        POST,

        // Auto-routing webhook handler (`app.all('/webhook', wa.webhook)`)
        webhook: async (c: HonoWebhookContext): Promise<Response> => {
            switch (c.req.raw.method.toUpperCase()) {
                case 'GET':
                    return GET(c);
                case 'POST':
                    return POST(c);
                default:
                    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
                        status: 405,
                        headers: { 'Content-Type': 'application/json', Allow: 'GET, POST' },
                    });
            }
        },

        // Flow handler
        flow: async (c: HonoWebhookContext): Promise<Response> => {
            try {
                return toResponse(await processor.processFlow(await getRequest(c)));
            } catch (error) {
                console.error('Flow processing error:', error);
                return internalError();
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
