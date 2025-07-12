import { WhatsAppConfig } from '../../../types/config';
import { WebhookProcessor } from '../WebhookProcessor';
import { constructFullUrl } from '../utils/webhookUtils';

// Express-like interfaces to avoid direct Express dependency
export interface ExpressRequest {
    method: string;
    url: string;
    headers: Record<string, string | string[] | undefined>;
    body?: any;
    query: Record<string, any>;
    rawBody?: any;
}

export interface ExpressResponse {
    status(code: number): ExpressResponse;
    json(data: any): ExpressResponse;
    send(data?: any): ExpressResponse;
    setHeader(name: string, value: string): void;
}

export interface NextFunction {
    (error?: any): void;
}

export interface ExpressWebhookConfig extends WhatsAppConfig {
    path?: string;
}

export function webhookHandler(config: ExpressWebhookConfig) {
    const processor = new WebhookProcessor(config);

    return {
        // Main webhook handler
        webhook: async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
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
                    // Create Web Standard Request from Express request with proper full URL
                    const fullUrl = constructFullUrl(req.headers, req.url);
                    const webRequest = new globalThis.Request(fullUrl, {
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
                next(error);
                return;
            }
        },

        // Flow handler
        flow: async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
            try {
                // Create Web Standard Request from Express request with proper full URL
                const fullUrl = constructFullUrl(req.headers, req.url);
                const webRequest = new globalThis.Request(fullUrl, {
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
                next(error);
                return;
            }
        },

        // Expose processor for handler registration
        processor,
    };
}
