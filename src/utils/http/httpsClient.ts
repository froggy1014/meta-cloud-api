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
    private readonly fetchImpl: typeof fetch | undefined;

    /**
     * @param fetchImpl - `fetch` used for every request. When omitted, the global `fetch`
     * is looked up on each call, so replacing `globalThis.fetch` later still takes effect.
     */
    constructor(fetchImpl?: typeof fetch) {
        this.fetchImpl = fetchImpl;
    }

    /**
     * Kept for backwards compatibility. Requests go through `fetch`,
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
            const doFetch = this.fetchImpl ?? globalThis.fetch;
            const response = await doFetch.call(globalThis, url, {
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
