import HttpsClient from './httpsClient';
import Logger from './logger';
import type { HttpMethodsEnum } from './types/enums';
import type { RequesterClass } from './types/request';

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
        this.host = host;
        this.apiVersion = apiVersion;
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

        LOGGER.log(`${method} : ${this.protocol.toLowerCase()}//${this.host}/${this.buildCAPIPath(endpoint)}`);

        return await this.client.sendRequest(
            this.host,
            this.buildCAPIPath(endpoint),
            method,
            this.buildHeader(contentType),
            timeout,
            method === 'POST' || method === 'PUT' ? body : undefined,
        );
    }
}
