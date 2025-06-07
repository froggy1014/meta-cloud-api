import { HttpMethodsEnum } from './enums';

export type ResponseHeaderValue = string | string[] | undefined;

export type ResponseHeaders = Record<string, ResponseHeaderValue>;

export type ResponseJSONBody = Record<string, unknown>;

export declare class HttpsClientResponseClass {
    constructor(resp: Response);
    statusCode: () => number;
    headers: () => ResponseHeaders;
    rawResponse: () => Response;
    json: () => Promise<ResponseJSONBody>;
}

export declare class HttpsClientClass {
    constructor();
    clearSockets: () => boolean;
    sendRequest: (
        host: string,
        path: string,
        method: HttpMethodsEnum,
        headers: HeadersInit,
        timeout: number,
        body?: BodyInit | null,
    ) => Promise<HttpsClientResponseClass>;
}
