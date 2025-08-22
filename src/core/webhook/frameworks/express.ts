import { BaseRequest, BaseResponse, BaseWebhookConfig, BaseWebhookHandler } from './handler';

// Express-like interfaces to avoid direct Express dependency
export interface ExpressRequest extends BaseRequest {
    method: string;
    url: string;
    headers: Record<string, string | string[] | undefined>;
    body?: any;
    query: Record<string, any>;
    rawBody?: any;
}

export interface ExpressResponse extends BaseResponse<ExpressResponse> {
    status(code: number): ExpressResponse;
    json(data: any): ExpressResponse;
    send(data?: any): ExpressResponse;
    setHeader(name: string, value: string): void;
}

export interface NextFunction {
    (error?: any): void;
}

export interface ExpressWebhookConfig extends BaseWebhookConfig {
    path?: string;
}

/**
 * Express-specific webhook handler extending the base handler
 */
class ExpressWebhookHandler extends BaseWebhookHandler<ExpressRequest, ExpressResponse> {
    constructor(config: ExpressWebhookConfig) {
        super(config);
    }

    protected async handleGet(req: ExpressRequest, res: ExpressResponse, next: NextFunction): Promise<ExpressResponse> {
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
            next(error);
            return res;
        }
    }

    protected async handlePost(
        req: ExpressRequest,
        res: ExpressResponse,
        next: NextFunction,
    ): Promise<ExpressResponse> {
        try {
            const fullUrl = this.constructFullUrl(req.headers, req.url);
            const webRequest = new globalThis.Request(fullUrl, {
                method: req.method,
                headers: req.headers as HeadersInit,
                body: JSON.stringify(req.body),
            });

            const result = await this.processWebhook(webRequest);
            this.applyHeaders(result, res);
            return res.status(result.status).send(result.body);
        } catch (error) {
            next(error);
            return res;
        }
    }

    protected async handleFlow(
        req: ExpressRequest,
        res: ExpressResponse,
        next: NextFunction,
    ): Promise<ExpressResponse> {
        try {
            const fullUrl = this.constructFullUrl(req.headers, req.url);
            const webRequest = new globalThis.Request(fullUrl, {
                method: req.method,
                headers: req.headers as HeadersInit,
                body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
            });

            const result = await this.processFlow(webRequest);
            this.applyHeaders(result, res);
            return res.status(result.status).send(result.body);
        } catch (error) {
            next(error);
            return res;
        }
    }

    getHandlers() {
        return {
            // Method handlers for clean destructuring
            GET: (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => this.handleGet(req, res, next),
            POST: (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => this.handlePost(req, res, next),

            // Auto-routing webhook handler
            webhook: (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => this.autoRoute(req, res, next),

            // Flow handler
            flow: (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => this.handleFlow(req, res, next),

            // Expose processor for handler registration
            processor: this.webhookProcessor,
        };
    }
}

export function webhookHandler(config: ExpressWebhookConfig) {
    const handler = new ExpressWebhookHandler(config);
    return handler.getHandlers();
}
