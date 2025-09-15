import { BaseRequest, BaseResponse, BaseWebhookConfig, BaseWebhookHandler } from '../handler';

// Next.js specific interfaces
export interface BaseApiRequest extends BaseRequest {
    method?: string;
    url?: string;
    headers: Record<string, string | string[] | undefined>;
    body?: any;
    query: Partial<Record<string, string | string[]>>;
    rawBody?: any;
}

export interface BaseApiResponse extends BaseResponse {
    status(code: number): any;
    json(data: any): void | any;
    send(data?: any): void | any;
    setHeader(name: string, value: string): void;
}

export interface NextJsWebhookConfig extends BaseWebhookConfig {
    // Next.js specific config can be added here
}

/**
 * Next.js Page Router webhook handler extending the base handler
 */
class NextJsWebhookHandler<
    TRequest extends BaseApiRequest,
    TResponse extends BaseApiResponse,
> extends BaseWebhookHandler<TRequest, TResponse> {
    constructor(config: NextJsWebhookConfig) {
        super(config);
    }

    // Helper function to parse request body for POST requests
    private async parseRequestBody(req: TRequest): Promise<void> {
        if (req.method === 'POST' && !req.body) {
            const chunks: Buffer[] = [];

            // Check if req is a stream (has Symbol.asyncIterator)
            if (typeof (req as any)[Symbol.asyncIterator] === 'function') {
                for await (const chunk of req as any) {
                    chunks.push(chunk);
                }

                const body = Buffer.concat(chunks).toString();

                // Only attempt to parse if there's actual content
                if (body.trim()) {
                    try {
                        req.body = JSON.parse(body);
                    } catch (error) {
                        throw new Error('Invalid JSON in request body');
                    }
                } else {
                    req.body = {};
                }
            }
        }
    }

    protected async handleGet(req: TRequest, res: TResponse): Promise<any> {
        try {
            const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;

            const result = await this.processVerification(
                (mode as string) || null,
                (token as string) || null,
                (challenge as string) || null,
            );

            this.applyHeaders(result, res);
            return res.status(result.status).send(result.body);
        } catch (error) {
            console.error('Webhook verification error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    protected async handlePost(req: TRequest, res: TResponse): Promise<any> {
        try {
            // Auto-parse body if needed
            await this.parseRequestBody(req);
        } catch (error) {
            console.error('Webhook processing error:', error);

            // Handle JSON parsing errors specifically
            if (error instanceof Error && error.message === 'Invalid JSON in request body') {
                return res.status(400).json({ error: 'Invalid JSON' });
            }

            return res.status(500).json({ error: 'Internal Server Error' });
        }

        try {
            const fullUrl = this.constructFullUrl(req.headers, req.url);

            const webRequest = new Request(fullUrl, {
                method: 'POST',
                headers: req.headers as HeadersInit,
                body: JSON.stringify(req.body),
            });

            const result = await this.processWebhook(webRequest);
            this.applyHeaders(result, res);
            return res.status(result.status).send(result.body);
        } catch (error) {
            console.error('Webhook processing error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    protected async handleFlow(req: TRequest, res: TResponse): Promise<any> {
        try {
            const fullUrl = this.constructFullUrl(req.headers, req.url);

            const webRequest = new Request(fullUrl, {
                method: req.method,
                headers: req.headers as HeadersInit,
                body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
            });

            const result = await this.processFlow(webRequest);
            this.applyHeaders(result, res);
            return res.status(result.status).send(result.body);
        } catch (error) {
            console.error('Flow error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    getHandlers() {
        return {
            // Method handlers for clean destructuring
            GET: (req: TRequest, res: TResponse) => this.handleGet(req, res),
            POST: (req: TRequest, res: TResponse) => this.handlePost(req, res),

            // Auto-routing webhook handler
            webhook: (req: TRequest, res: TResponse) => this.autoRoute(req, res),

            // Flow handler
            flow: (req: TRequest, res: TResponse) => this.handleFlow(req, res),

            // Expose processor for handler registration
            processor: this.webhookProcessor,
        };
    }
}

// Generic webhook handler that accepts any compatible request/response types
export function nextjsWebhookHandler<TRequest extends BaseApiRequest, TResponse extends BaseApiResponse>(
    config: NextJsWebhookConfig,
) {
    const handler = new NextJsWebhookHandler<TRequest, TResponse>(config);
    return handler.getHandlers();
}
