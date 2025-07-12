import { WhatsAppConfig } from '../../../types/config';
import { WebhookProcessor } from '../WebhookProcessor';
import { constructFullUrl } from '../utils/webhookUtils';

// Generic interfaces for better type compatibility
export interface BaseApiRequest {
    method?: string;
    url?: string;
    headers: Record<string, string | string[] | undefined>;
    body?: any;
    query: Partial<Record<string, string | string[]>>;
    rawBody?: any;
}

export interface BaseApiResponse {
    status(code: number): any;
    json(data: any): void | any;
    send(data?: any): void | any;
    setHeader(name: string, value: string): void;
}

export interface NextJsWebhookConfig extends WhatsAppConfig {
    // Next.js specific config can be added here
}

// Generic webhook handler that accepts any compatible request/response types
export function webhookHandler<TRequest extends BaseApiRequest, TResponse extends BaseApiResponse>(
    config: NextJsWebhookConfig,
) {
    const processor = new WebhookProcessor(config);

    return {
        // Main webhook handler
        webhook: async (req: TRequest, res: TResponse) => {
            try {
                if (req.method === 'GET') {
                    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;

                    const result = await processor.processVerification(
                        (mode as string) || null,
                        (token as string) || null,
                        (challenge as string) || null,
                    );

                    Object.entries(result.headers).forEach(([key, value]) => {
                        res.setHeader(key, value);
                    });

                    return res.status(result.status).send(result.body);
                }

                if (req.method === 'POST') {
                    // Create Web Standard Request from Next.js request
                    const fullUrl = constructFullUrl(req.headers, req.url);

                    const webRequest = new Request(fullUrl, {
                        method: req.method,
                        headers: req.headers as HeadersInit,
                        body: JSON.stringify(req.body),
                    });

                    const result = await processor.processWebhook(webRequest);

                    Object.entries(result.headers).forEach(([key, value]) => {
                        res.setHeader(key, value);
                    });

                    return res.status(result.status).send(result.body);
                }

                return res.status(405).json({ error: 'Method Not Allowed' });
            } catch (error) {
                console.error('Webhook error:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        },

        // Flow handler
        flow: async (req: TRequest, res: TResponse) => {
            try {
                const fullUrl = constructFullUrl(req.headers, req.url);

                const webRequest = new Request(fullUrl, {
                    method: req.method,
                    headers: req.headers as HeadersInit,
                    body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
                });

                const result = await processor.processFlow(webRequest);

                Object.entries(result.headers).forEach(([key, value]) => {
                    res.setHeader(key, value);
                });

                return res.status(result.status).send(result.body);
            } catch (error) {
                console.error('Flow error:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        },

        // Expose processor for handler registration
        processor,
    };
}
