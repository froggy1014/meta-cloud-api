import HttpsClient from './httpsClient';
import Logger from './utils/logger';
import type { HttpMethodsEnum } from './types/enums';
import type { RequesterClass } from './types/request';
import { MetaError } from './utils/isMetaError';
import { isMetaError } from './utils/isMetaError';

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
        host: string,
        apiVersion: string,
        phoneNumberId: number,
        accessToken: string,
        businessAcctId: string,
        userAgent: string,
    ) {
        this.client = new HttpsClient();
        this.host = host || 'graph.facebook.com';
        this.apiVersion = apiVersion || '22';
        this.phoneNumberId = phoneNumberId;
        this.accessToken = accessToken;
        this.businessAcctId = businessAcctId;
        this.userAgent = userAgent;
    }

    buildHeader(contentType: string): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': contentType,
            Authorization: `Bearer ${this.accessToken}`,
            'User-Agent': this.userAgent,
        };
        return headers;
    }

    buildCAPIPath(endpoint: string): string {
        return `v${this.apiVersion}.0/${endpoint}`;
    }

    async sendRequest(method: HttpMethodsEnum, endpoint: string, timeout: number, body?: any) {
        const contentType = 'application/json';
        const path = `${this.protocol.toLowerCase()}//${this.host}/${this.buildCAPIPath(endpoint)}`;

        LOGGER.log(`${method} : ${path}`);

        try {
            const response = await this.client.sendRequest(
                this.host,
                this.buildCAPIPath(endpoint),
                method,
                this.buildHeader(contentType),
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
}
