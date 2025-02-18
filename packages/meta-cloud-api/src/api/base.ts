import Logger from '../logger';
import type { BaseClass } from '../types/base';
import type { WabaConfigType } from '../types/config';
import type { RequesterClass } from '../types/request';

const LIB_NAME = 'BaseAPI';
const LOG_LOCAL = false;
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true' || LOG_LOCAL);

export default class BaseAPI implements BaseClass {
    protected config: WabaConfigType;
    protected client: RequesterClass;

    constructor(config: WabaConfigType, client: RequesterClass) {
        this.config = config;
        this.client = client;
        LOGGER.log('Initialized with HTTPSClient');
    }
}
