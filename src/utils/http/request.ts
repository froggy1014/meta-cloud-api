import type { HttpMethodsEnum } from '../../types/enums';
import type { RequesterClass } from '../../types/request';
import { isMetaError, MetaError } from '../isMetaError';
import Logger from '../logger';
import HttpsClient from './httpsClient';

const LIB_NAME = 'REQUESTER';
const LOG_LOCAL = false;
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true' || LOG_LOCAL);

export default class Requester implements RequesterClass {
    client: Readonly<HttpsClient>;
    accessToken: Readonly<string>;
    phoneNumberId: Readonly<number>;
    businessAcctId: Readonly<string>;
    apiVersion: Readonly<string>;
    userAgent: Readonly<string>;
    host: Readonly<string>;
    protocol: Readonly<string> = 'https:';

    constructor(
        apiVersion: string,
        phoneNumberId: number,
        accessToken: string,
        businessAcctId: string,
        userAgent: string,
    ) {
        this.client = new HttpsClient();
        this.host = 'graph.facebook.com';
        this.apiVersion = apiVersion || '22';
        this.phoneNumberId = phoneNumberId;
        this.accessToken = accessToken;
        this.businessAcctId = businessAcctId;
        this.userAgent = userAgent;
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
        let effectiveContentType = contentType;

        if (body instanceof FormData) {
            effectiveContentType = 'multipart/form-data';
        } else if (typeof body === 'string' && body.startsWith('<?xml')) {
            effectiveContentType = 'application/xml';
        }

        const path = `${this.protocol.toLowerCase()}//${this.host}/${this.buildCAPIPath(endpoint)}`;

        LOGGER.log(`${method} : ${path} (${effectiveContentType})`);

        try {
            const response = await this.client.sendRequest(
                this.host,
                this.buildCAPIPath(endpoint),
                method,
                this.buildHeader(effectiveContentType, additionalHeaders),
                timeout,
                method === 'POST' || method === 'PUT' ? body : undefined,
            );

            if (!response.rawResponse().ok) {
                const errorData = await response.json();
                if (isMetaError(errorData)) {
                    throw errorData;
                }
                // If the error doesn't match Meta's format, create a generic MetaError
                throw {
                    name: 'MetaError',
                    message: 'Unknown error occurred',
                    error: {
                        message: errorData.message || 'Unknown error occurred',
                        type: 'UnknownError',
                        code: response.statusCode(),
                        fbtrace_id: '',
                    },
                } as MetaError;
            }

            return response;
        } catch (error) {
            if (isMetaError(error)) {
                throw error;
            }
            // Handle network errors or other unexpected errors
            throw {
                name: 'MetaError',
                message: error instanceof Error ? error.message : 'Network error occurred',
                error: {
                    message: error instanceof Error ? error.message : 'Network error occurred',
                    type: 'NetworkError',
                    code: 500,
                    fbtrace_id: '',
                },
            } as MetaError;
        }
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
