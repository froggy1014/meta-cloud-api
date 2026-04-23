import type { RetryConfig } from '../../types/config';
import type { HttpMethodsEnum } from '../../types/enums';
import type { RequesterClass } from '../../types/request';
import {
    createWhatsAppApiError,
    isMetaError,
    normalizeMetaError,
    WhatsAppError,
    WhatsAppNetworkError,
    WhatsAppThrottlingError,
} from '../isMetaError';
import Logger from '../logger';
import HttpsClient from './httpsClient';

const LIB_NAME = 'REQUESTER';
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true');

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_INITIAL_DELAY_MS = 1000;

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
    protocol: Readonly<string> = 'https:';
    private retryConfig: RetryConfig | undefined;

    constructor(
        apiVersion: string,
        phoneNumberId: number,
        accessToken: string,
        businessAcctId: string,
        userAgent: string,
        retryConfig?: RetryConfig,
    ) {
        this.client = new HttpsClient();
        this.host = 'graph.facebook.com';
        this.apiVersion = apiVersion || '22';
        this.phoneNumberId = phoneNumberId;
        this.accessToken = accessToken;
        this.businessAcctId = businessAcctId;
        this.userAgent = userAgent;
        this.retryConfig = retryConfig;
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
        return `v${this.apiVersion}.0/${endpoint}`;
    }

    async sendRequest(
        method: HttpMethodsEnum,
        endpoint: string,
        timeout: number,
        body?: any,
        contentType: string = 'application/json',
        additionalHeaders?: Record<string, string>,
    ) {
        const maxAttempts = this.retryConfig?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
        const initialDelayMs = this.retryConfig?.initialDelayMs ?? DEFAULT_INITIAL_DELAY_MS;
        const backoff = this.retryConfig?.backoff ?? 'exponential';

        let effectiveContentType = contentType;

        if (body instanceof FormData) {
            effectiveContentType = 'multipart/form-data';
        } else if (typeof body === 'string' && body.startsWith('<?xml')) {
            effectiveContentType = 'application/xml';
        }

        const path = `${this.protocol.toLowerCase()}//${this.host}/${this.buildCAPIPath(endpoint)}`;
        LOGGER.log(`${method} : ${path} (${effectiveContentType})`);

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const shouldSendBody = method === 'POST' || method === 'PUT' || method === 'DELETE';

                const response = await this.client.sendRequest(
                    this.host,
                    this.buildCAPIPath(endpoint),
                    method,
                    this.buildHeader(effectiveContentType, additionalHeaders),
                    timeout,
                    shouldSendBody ? body : undefined,
                );

                if (!response.rawResponse().ok) {
                    let errorData: unknown = null;
                    try {
                        errorData = await response.json();
                    } catch {
                        errorData = null;
                    }

                    const metaError = normalizeMetaError(errorData, response.statusCode());
                    throw createWhatsAppApiError(metaError.error, response.statusCode());
                }

                return response;
            } catch (error) {
                if (error instanceof WhatsAppThrottlingError && attempt < maxAttempts) {
                    const delay = backoff === 'exponential' ? initialDelayMs * 2 ** (attempt - 1) : initialDelayMs;
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
        formData: Record<string, string>,
        additionalHeaders?: Record<string, string>,
    ): Promise<T> {
        const urlEncodedBody = new URLSearchParams(formData).toString();
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
