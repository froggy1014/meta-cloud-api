import type { WabaConfigType } from './config';

export declare class BaseClass {
    constructor(config: WabaConfigType);
}

import { HttpMethodsEnum } from './enums';
import type { RequesterClass } from './request';

export class BaseAPI implements BaseClass {
    protected config: WabaConfigType;
    protected client: RequesterClass;

    constructor(config: WabaConfigType, client: RequesterClass) {
        this.config = config;
        this.client = client;
    }

    protected sendJson<T>(method: HttpMethodsEnum, endpoint: string, timeout: number, body?: any): Promise<T> {
        return this.client.getJson<T>(method, endpoint, timeout, body);
    }

    protected sendFormData<T>(method: HttpMethodsEnum, endpoint: string, timeout: number, body?: any): Promise<T> {
        return this.client.sendFormData<T>(method, endpoint, timeout, body);
    }

    protected sendUrlEncodedForm<T>(
        method: HttpMethodsEnum,
        endpoint: string,
        timeout: number,
        body?: any,
    ): Promise<T> {
        return this.client.sendUrlEncodedForm<T>(method, endpoint, timeout, body);
    }
}
