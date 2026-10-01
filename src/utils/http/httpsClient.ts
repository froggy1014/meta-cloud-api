import type { HttpMethodsEnum } from '../../types/enums';
import type {
    HttpsClientClass,
    HttpsClientResponseClass,
    ResponseHeaders,
    ResponseJSONBody,
} from '../../types/httpsClient';
import Logger from '../logger';
import { isDebugEnv } from '../runtime';

const LIB_NAME = 'HttpsClient';
const LOGGER = new Logger(LIB_NAME, isDebugEnv());

export default class HttpsClient implements HttpsClientClass {
    /**
     * Kept for backwards compatibility. Requests go through the global `fetch`,
     * which manages its own connection pool, so there is nothing to clear.
     */
    clearSockets(): boolean {
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
            LOGGER.error(`${method} : ${url} - ${JSON.stringify(error)}`);
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
            const error = new Error(`Failed to parse response body to JSON: ${(err as Error).message}`);
            error.cause = err;
            throw error;
        }
    }
}
