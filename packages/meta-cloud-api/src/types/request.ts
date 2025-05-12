import { HttpMethodsEnum } from './enums';

export type GeneralRequestBody = Record<string, unknown>;

export interface GeneralHeaderInterface {
    /**
     * Authorization token. This is required for all HTTP requests made to the graph API.
     * @default 'Bearer '
     */
    Authorization: string;

    /**
     * Content type of the message being sent. This is required for all HTTP requests made to the graph API.
     * @default 'application/json'
     */
    'Content-Type': string;

    /**
     * User agent field sent in all requests. This is used to gather SDK usage metrics and help
     * better triage support requests.
     * @default `WA_SDK/${ SDK_version } (Node.js ${ process.version })`
     */
    'User-Agent': string;
}

export interface RequesterResponseInterface<T> {
    json: () => Promise<T>;
}

export interface ResponseSuccess {
    success: boolean;
}

export interface ResponseData<T> {
    data: T;
}

export interface ResponsePagination<T> {
    data: T[];
    paging: Paging;
}

export interface Paging {
    cursors: {
        before: string;
        after: string;
    };
    next: string;
}

export declare class RequesterClass {
    constructor(
        host: string,
        apiVersion: string,
        phoneNumberId: number,
        accessToken: string,
        businessAcctId: string,
        userAgent: string,
    );

    sendRequest: (
        method: HttpMethodsEnum,
        path: string,
        timeout: number,
        body?: GeneralRequestBody,
        contentType?: string,
        additionalHeaders?: Record<string, string>,
    ) => Promise<RequesterResponseInterface<unknown>>;

    getJson<T>(
        method: HttpMethodsEnum,
        endpoint: string,
        timeout: number,
        body?: GeneralRequestBody,
        additionalHeaders?: Record<string, string>,
    ): Promise<T>;

    sendFormData<T>(
        method: HttpMethodsEnum,
        endpoint: string,
        timeout: number,
        formData: FormData,
        additionalHeaders?: Record<string, string>,
    ): Promise<T>;

    sendUrlEncodedForm<T>(
        method: HttpMethodsEnum,
        endpoint: string,
        timeout: number,
        formData: Record<string, string>,
        additionalHeaders?: Record<string, string>,
    ): Promise<T>;
}
