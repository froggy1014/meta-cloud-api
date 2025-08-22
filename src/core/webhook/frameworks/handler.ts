import { WhatsAppConfig } from '../../../types/config';
import { WebhookProcessor } from '../WebhookProcessor';
import { constructFullUrl } from '../utils/webhookUtils';

// Generic request/response interfaces for framework abstraction
export interface BaseRequest {
    method?: string;
    url?: string;
    headers: Record<string, string | string[] | undefined>;
    body?: any;
    query?: Record<string, any> | URLSearchParams;
    rawBody?: any;
}

export interface BaseResponse<T = any> {
    status(code: number): T;
    json?(data: any): T | void;
    send?(data?: any): T | void;
    setHeader?(name: string, value: string): void;
}

// Base configuration interface
export interface BaseWebhookConfig extends WhatsAppConfig {
    // Framework-specific configs can extend this
}

// Response result interface for consistent return types
export interface WebhookResult {
    status: number;
    headers: Record<string, string>;
    body: any;
}

/**
 * Abstract base class for framework-agnostic webhook handlers
 * Provides common architecture and functionality across all frameworks
 */
export abstract class BaseWebhookHandler<TRequest extends BaseRequest, TResponse extends BaseResponse> {
    protected processor: WebhookProcessor;

    constructor(config: BaseWebhookConfig) {
        this.processor = new WebhookProcessor(config);
    }

    /**
     * Abstract method for handling GET requests (webhook verification)
     * Each framework implements this based on their request/response patterns
     */
    protected abstract handleGet(req: TRequest, res: TResponse, ...args: any[]): Promise<any>;

    /**
     * Abstract method for handling POST requests (webhook processing)
     * Each framework implements this based on their request/response patterns
     */
    protected abstract handlePost(req: TRequest, res: TResponse, ...args: any[]): Promise<any>;

    /**
     * Abstract method for handling flow requests
     * Each framework implements this based on their request/response patterns
     */
    protected abstract handleFlow(req: TRequest, res: TResponse, ...args: any[]): Promise<any>;

    /**
     * Common webhook verification logic
     */
    protected async processVerification(
        mode: string | null,
        token: string | null,
        challenge: string | null,
    ): Promise<WebhookResult> {
        return await this.processor.processVerification(mode, token, challenge);
    }

    /**
     * Common webhook processing logic
     */
    protected async processWebhook(request: Request): Promise<WebhookResult> {
        return await this.processor.processWebhook(request);
    }

    /**
     * Common flow processing logic
     */
    protected async processFlow(request: Request): Promise<WebhookResult> {
        return await this.processor.processFlow(request);
    }

    /**
     * Helper to construct full URL from headers and path
     */
    protected constructFullUrl(headers: Record<string, string | string[] | undefined>, url: string = ''): string {
        return constructFullUrl(headers, url);
    }

    /**
     * Helper to apply result headers to response
     */
    protected applyHeaders(result: WebhookResult, res: TResponse): void {
        if (res.setHeader) {
            Object.entries(result.headers).forEach(([key, value]) => {
                res.setHeader!(key, value);
            });
        }
    }

    /**
     * Auto-routing method handler that dispatches based on request method
     */
    protected async autoRoute(req: TRequest, res: TResponse, ...args: any[]): Promise<any> {
        const method = req.method?.toUpperCase();

        switch (method) {
            case 'GET':
                return await this.handleGet(req, res, ...args);
            case 'POST':
                return await this.handlePost(req, res, ...args);
            default:
                if (res.status && res.json) {
                    return res.status(405).json({ error: 'Method Not Allowed' });
                }
                throw new Error('Method Not Allowed');
        }
    }

    /**
     * Get the processor instance for handler registration
     */
    get webhookProcessor(): WebhookProcessor {
        return this.processor;
    }

    /**
     * Abstract method to return the clean handler object
     * Each framework implements this to return their specific handler structure
     */
    abstract getHandlers(): {
        GET: (...args: any[]) => Promise<any>;
        POST: (...args: any[]) => Promise<any>;
        webhook: (...args: any[]) => Promise<any>;
        flow: (...args: any[]) => Promise<any>;
        processor: WebhookProcessor;
    };
}
