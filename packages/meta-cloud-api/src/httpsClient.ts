import { Agent } from 'https';

import Logger from './logger';
import { HttpMethodsEnum } from './types/enums';
import { HttpsClientClass, HttpsClientResponseClass, ResponseHeaders, ResponseJSONBody } from './types/httpsClient';

const LIB_NAME = 'HttpsClient';
const LOG_LOCAL = false;
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true' || LOG_LOCAL);

export default class HttpsClient implements HttpsClientClass {
    agent: Agent;

    constructor() {
        this.agent = new Agent({ keepAlive: true });
    }

    clearSockets(): boolean {
        this.agent.destroy();
        return true;
    }

    async sendRequest(
        hostname: string,
        path: string,
        method: HttpMethodsEnum,
        headers: HeadersInit,
        timeout: number,
        body?: BodyInit | null,
    ): Promise<HttpsClientResponseClass> {
        const url = `https://${hostname}/${path}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        console.log('🚀 ~ HttpsClient ~ url:', url);
        console.log('🚀 ~ HttpsClient ~ headers:', headers);
        console.log('🚀 ~ HttpsClient ~ body:', body);

        try {
            const response = await fetch(url, {
                method,
                headers,
                body,
                signal: controller.signal,
            });
            LOGGER.log(`${method} : ${url} - ${JSON.stringify(response)}`);

            clearTimeout(timeoutId);
            return new HttpsClientResponse(response);
        } catch (error) {
            throw error;
        }
    }
}

export class HttpsClientResponse implements HttpsClientResponseClass {
    res: Response;
    respStatusCode: number;
    respHeaders: ResponseHeaders;

    constructor(resp: Response) {
        this.res = resp;
        this.respStatusCode = resp.status;
        this.respHeaders = Object.fromEntries(resp.headers.entries());
    }

    statusCode(): number {
        return this.respStatusCode;
    }

    headers(): ResponseHeaders {
        return this.respHeaders;
    }

    rawResponse(): Response {
        return this.res;
    }

    async json(): Promise<ResponseJSONBody> {
        try {
            return (await this.res.json()) as ResponseJSONBody;
        } catch (err) {
            // TODO Error Handling
            throw new Error('Failed to parse response body to JSON: ' + (err as Error).message);
        }
    }
}
