import type { WabaConfigType } from './config';

export declare class BaseClass {
    constructor(config: WabaConfigType);
}

import Logger from '../utils/logger';
import { HttpMethodsEnum } from './enums';
import type { RequesterClass } from './request';

const LIB_NAME = 'BaseAPI';
const LOG_LOCAL = false;
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true' || LOG_LOCAL);

export class BaseAPI implements BaseClass {
    protected config: WabaConfigType;
    protected client: RequesterClass;

    constructor(config: WabaConfigType, client: RequesterClass) {
        this.config = config;
        this.client = client;
        LOGGER.log('Initialized with HTTPSClient');
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
