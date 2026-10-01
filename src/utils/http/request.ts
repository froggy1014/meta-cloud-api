import {
    DEFAULT_CLOUD_API_VERSION,
    DEFAULT_RETRY_BACKOFF,
    DEFAULT_RETRY_INITIAL_DELAY_MS,
    DEFAULT_RETRY_MAX_ATTEMPTS,
    DEFAULT_RETRY_MAX_SERVER_DELAY_MS,
    GRAPH_API_HOST,
    GRAPH_API_PROTOCOL,
} from '../../config/defaults';
import type { RateLimitInfoListener, RetryConfig } from '../../types/config';
import type { HttpMethodsEnum } from '../../types/enums';
import type { RequesterClass, UrlEncodedFormBody } from '../../types/request';
import {
    createWhatsAppApiError,
    isMetaError,
    normalizeMetaError,
    WhatsAppError,
    WhatsAppNetworkError,
    WhatsAppThrottlingError,
} from '../isMetaError';
import Logger from '../logger';
import { parseRateLimitHeaders, type RateLimitInfo } from '../rateLimit';
import { isDebugEnv } from '../runtime';
import HttpsClient from './httpsClient';

const LIB_NAME = 'REQUESTER';
const LOGGER = new Logger(LIB_NAME, isDebugEnv());

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export default class Requester implements RequesterClass {
    client: Readonly<HttpsClient>;
    accessToken: Readonly<string>;
    phoneNumberId: Readonly<number>;
    businessAcctId: Readonly<string>;
    apiVersion: Readonly<string>;
    userAgent: Readonly<string>;
    host: Readonly<string>;
    protocol: Readonly<string> = GRAPH_API_PROTOCOL;
    private retryConfig: RetryConfig | undefined;
    private onRateLimitInfo: RateLimitInfoListener | undefined;
    private lastRateLimitInfo: RateLimitInfo | undefined;

    constructor(
        apiVersion: string,
        phoneNumberId: number,
        accessToken: string,
        businessAcctId: string,
        userAgent: string,
        retryConfig?: RetryConfig,
        onRateLimitInfo?: RateLimitInfoListener,
    ) {
        this.client = new HttpsClient();
        this.host = GRAPH_API_HOST;
        this.apiVersion = this.normalizeApiVersion(apiVersion);
        this.phoneNumberId = phoneNumberId;
        this.accessToken = accessToken;
        this.businessAcctId = businessAcctId;
        this.userAgent = userAgent;
        this.retryConfig = retryConfig;
        this.onRateLimitInfo = onRateLimitInfo;
    }

    /**
     * Rate limit headers of the most recent response that carried any, or undefined.
     * With concurrent requests this is whichever response finished last; use the
     * `onRateLimitInfo` config callback to see every response.
     */
    getLastRateLimitInfo(): RateLimitInfo | undefined {
        return this.lastRateLimitInfo;
    }

    private captureRateLimitInfo(
        response: { headers?: () => unknown; statusCode?: () => number },
        method: string,
        endpoint: string,
    ): RateLimitInfo | undefined {
        if (typeof response.headers !== 'function') return undefined;
        const info = parseRateLimitHeaders(response.headers() as Parameters<typeof parseRateLimitHeaders>[0]);
        if (!info) return undefined;

        this.lastRateLimitInfo = info;
        if (this.onRateLimitInfo) {
            try {
                const statusCode = typeof response.statusCode === 'function' ? response.statusCode() : 0;
                // Observe asynchronous failures too, without delaying the API response on telemetry.
                void Promise.resolve(this.onRateLimitInfo(info, { method, endpoint, statusCode })).catch(
                    (error: unknown) => {
                        LOGGER.log(`onRateLimitInfo listener threw: ${error instanceof Error ? error.message : error}`);
                    },
                );
            } catch (error) {
                LOGGER.log(`onRateLimitInfo listener threw: ${error instanceof Error ? error.message : error}`);
            }
        }
        return info;
    }

    buildHeader(contentType: string, additionalHeaders?: Record<string, string>): HeadersInit {
        const headers: HeadersInit = {
            Authorization: `Bearer ${this.accessToken}`,
            'User-Agent': this.userAgent,
        };

        if (contentType !== 'multipart/form-data') {
            headers['Content-Type'] = contentType;
        }

        if (additionalHeaders) {
            Object.assign(headers, additionalHeaders);
        }

        return headers;
    }

    buildCAPIPath(endpoint: string): string {
        return `${this.apiVersion}/${endpoint}`;
    }

    private normalizeApiVersion(apiVersion?: string): string {
        if (!apiVersion) return DEFAULT_CLOUD_API_VERSION;

        const trimmed = apiVersion.trim();
        if (/^v\d+\.\d+$/.test(trimmed)) return trimmed;
        if (/^\d+\.\d+$/.test(trimmed)) return `v${trimmed}`;
        if (/^v\d+$/.test(trimmed)) return `${trimmed}.0`;
        if (/^\d+$/.test(trimmed)) return `v${trimmed}.0`;

        return trimmed;
    }

    private buildRequestTarget(endpoint: string): { host: string; path: string; displayUrl: string } {
        if (/^https?:\/\//.test(endpoint)) {
            const url = new URL(endpoint);
            const path = `${url.pathname}${url.search}`.replace(/^\//, '');
            return {
                host: url.host,
                path,
                displayUrl: url.toString(),
            };
        }

        const path = this.buildCAPIPath(endpoint.replace(/^\//, ''));
        return {
            host: this.host,
            path,
            displayUrl: `${this.protocol.toLowerCase()}//${this.host}/${path}`,
        };
    }

    async sendRequest(
        method: HttpMethodsEnum,
        endpoint: string,
        timeout: number,
        body?: any,
        contentType: string = 'application/json',
        additionalHeaders?: Record<string, string>,
    ) {
        const maxAttempts = this.retryConfig?.maxAttempts ?? DEFAULT_RETRY_MAX_ATTEMPTS;
        const initialDelayMs = this.retryConfig?.initialDelayMs ?? DEFAULT_RETRY_INITIAL_DELAY_MS;
        const backoff = this.retryConfig?.backoff ?? DEFAULT_RETRY_BACKOFF;
        const respectServerDelay = this.retryConfig?.respectServerDelay ?? true;
        const maxServerDelayMs = this.retryConfig?.maxServerDelayMs ?? DEFAULT_RETRY_MAX_SERVER_DELAY_MS;

        let effectiveContentType = contentType;

        if (body instanceof FormData) {
            effectiveContentType = 'multipart/form-data';
        } else if (typeof body === 'string' && body.startsWith('<?xml')) {
            effectiveContentType = 'application/xml';
        }

        const requestTarget = this.buildRequestTarget(endpoint);
        LOGGER.log(`${method} : ${requestTarget.displayUrl} (${effectiveContentType})`);

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const shouldSendBody = method === 'POST' || method === 'PUT' || method === 'DELETE';

                const response = await this.client.sendRequest(
                    requestTarget.host,
                    requestTarget.path,
                    method,
                    this.buildHeader(effectiveContentType, additionalHeaders),
                    timeout,
                    shouldSendBody ? body : undefined,
                );

                const rateLimit = this.captureRateLimitInfo(response, method, endpoint);

                if (!response.rawResponse().ok) {
                    let errorData: unknown = null;
                    try {
                        errorData = await response.json();
                    } catch {
                        errorData = null;
                    }

                    const metaError = normalizeMetaError(errorData, response.statusCode());
                    const apiError = createWhatsAppApiError(metaError.error, response.statusCode());
                    if (rateLimit) apiError.rateLimit = rateLimit;
                    throw apiError;
                }

                return response;
            } catch (error) {
                if (error instanceof WhatsAppThrottlingError && attempt < maxAttempts) {
                    const backoffDelay =
                        backoff === 'exponential' ? initialDelayMs * 2 ** (attempt - 1) : initialDelayMs;
                    const serverDelay = respectServerDelay ? error.rateLimit?.retryDelayMs : undefined;
                    const delay =
                        serverDelay !== undefined
                            ? Math.max(backoffDelay, Math.min(serverDelay, Math.max(0, maxServerDelayMs)))
                            : backoffDelay;
                    LOGGER.log(`Throttled (attempt ${attempt}/${maxAttempts}). Retrying in ${delay}ms...`);
                    await sleep(delay);
                    continue;
                }

                if (error instanceof WhatsAppError) {
                    throw error;
                }
                if (isMetaError(error)) {
                    throw createWhatsAppApiError(error.error);
                }

                const message = error instanceof Error ? error.message : 'Network error occurred';
                throw new WhatsAppNetworkError(message, error);
            }
        }

        // Unreachable in practice — loop always returns or throws.
        // Required for TypeScript return type inference.
        throw new WhatsAppThrottlingError(
            'Max retry attempts exceeded',
            { message: 'Max retry attempts exceeded', type: 'ThrottlingError', code: 130429, fbtrace_id: '' },
            429,
        );
    }

    async getJson<T>(
        method: HttpMethodsEnum,
        endpoint: string,
        timeout: number,
        body?: any,
        additionalHeaders?: Record<string, string>,
    ): Promise<T> {
        const res = await this.sendRequest(method, endpoint, timeout, body, 'application/json', additionalHeaders);
        return (await res.json()) as T;
    }

    async sendFormData<T>(
        method: HttpMethodsEnum,
        endpoint: string,
        timeout: number,
        formData: FormData,
        additionalHeaders?: Record<string, string>,
    ): Promise<T> {
        const res = await this.sendRequest(
            method,
            endpoint,
            timeout,
            formData,
            'multipart/form-data',
            additionalHeaders,
        );
        return (await res.json()) as T;
    }

    updateTimeout(timeout: number): void {
        LOGGER.log(`Timeout updated to ${timeout}ms`);
    }

    updateAccessToken(accessToken: string): void {
        (this as { accessToken: string }).accessToken = accessToken;
        LOGGER.log('Access token updated');
    }

    async sendUrlEncodedForm<T>(
        method: HttpMethodsEnum,
        endpoint: string,
        timeout: number,
        formData: UrlEncodedFormBody,
        additionalHeaders?: Record<string, string>,
    ): Promise<T> {
        const urlParams = new URLSearchParams();
        for (const [key, value] of Object.entries(formData)) {
            if (Array.isArray(value)) {
                for (const item of value) {
                    urlParams.append(key, item);
                }
            } else {
                urlParams.append(key, value);
            }
        }

        const urlEncodedBody = urlParams.toString();
        const res = await this.sendRequest(
            method,
            endpoint,
            timeout,
            urlEncodedBody,
            'application/x-www-form-urlencoded',
            additionalHeaders,
        );
        return (await res.json()) as T;
    }
}
