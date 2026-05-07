import type { WhatsAppConfig } from '../../../../types/config';
import { WebhookProcessor } from '../../WebhookProcessor';

// Define Next.js types locally to avoid requiring Next.js as a dependency
export interface NextRequest extends Request {
    nextUrl: {
        searchParams: URLSearchParams;
    };
}

export interface NextResponse {
    json(data: any): NextResponse;
}

export interface NextJsAppWebhookConfig extends WhatsAppConfig {
    // App Router specific config (currently none, but interface reserved for future use)
}

// Singleton cache keyed by phoneNumberId
// biome-ignore lint/suspicious/noExplicitAny: cache stores the handler return type which is complex and self-referential
const handlerCache = new Map<string, any>();

function getCacheKey(config: NextJsAppWebhookConfig): string {
    return `nextjs-app:${config.phoneNumberId ?? 'default'}`;
}

// Next.js App Router webhook handler
export function nextjsAppWebhookHandler(config: NextJsAppWebhookConfig) {
    const key = getCacheKey(config);
    const cached = handlerCache.get(key);
    if (cached) return cached;

    const processor = new WebhookProcessor(config);

    const handlers = {
        // Clean GET/POST handlers following whatsapp-api-js methodology
        GET: async (request: NextRequest) => {
            try {
                const { searchParams } = new URL(request.url);
                const mode = searchParams.get('hub.mode');
                const token = searchParams.get('hub.verify_token');
                const challenge = searchParams.get('hub.challenge');

                const result = await processor.processVerification(mode, token, challenge);

                // Return plain text response for webhook verification
                return new Response(result.body, {
                    status: result.status,
                    headers: result.headers,
                });
            } catch (error) {
                console.error('Webhook verification error:', error);
                return new Response('Internal Server Error', { status: 500 });
            }
        },

        POST: async (request: NextRequest) => {
            try {
                const result = await processor.processWebhook(request);

                // Return JSON response for webhook processing
                return new Response(result.body, {
                    status: result.status,
                    headers: result.headers,
                });
            } catch (error) {
                console.error('Webhook processing error:', error);
                return new Response('Internal Server Error', { status: 500 });
            }
        },

        // Legacy webhook object for backward compatibility
        webhook: {
            GET: async (request: NextRequest) => {
                try {
                    const { searchParams } = new URL(request.url);
                    const mode = searchParams.get('hub.mode');
                    const token = searchParams.get('hub.verify_token');
                    const challenge = searchParams.get('hub.challenge');

                    const result = await processor.processVerification(mode, token, challenge);
                    return new Response(result.body, {
                        status: result.status,
                        headers: result.headers,
                    });
                } catch (error) {
                    console.error('Webhook verification error:', error);
                    return new Response('Internal Server Error', { status: 500 });
                }
            },

            POST: async (request: NextRequest) => {
                try {
                    const result = await processor.processWebhook(request);
                    return new Response(result.body, {
                        status: result.status,
                        headers: result.headers,
                    });
                } catch (error) {
                    console.error('Webhook processing error:', error);
                    return new Response('Internal Server Error', { status: 500 });
                }
            },
        },

        // Flow handler for App Router
        flow: {
            GET: async (request: NextRequest) => {
                try {
                    const result = await processor.processFlow(request);

                    // result.body is already a JSON string, don't double-encode it
                    return new Response(result.body, {
                        status: result.status,
                        headers: result.headers,
                    });
                } catch (error) {
                    console.error('Flow GET error:', error);
                    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
                        status: 500,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }
            },

            POST: async (request: NextRequest) => {
                try {
                    const result = await processor.processFlow(request);

                    // result.body is already a JSON string, don't double-encode it
                    return new Response(result.body, {
                        status: result.status,
                        headers: result.headers,
                    });
                } catch (error) {
                    console.error('Flow POST error:', error);
                    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
                        status: 500,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }
            },
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

    handlerCache.set(key, handlers);
    return handlers;
}
