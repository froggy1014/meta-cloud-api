import type { WabaConfigType } from '../types/config';
import { HttpMethodsEnum, WabaConfigEnum } from '../types/enums';
import type { RequesterClass, ResponseSuccess } from '../types/request';
import { TwoStepVerificationClass } from '../types/twoStepVerification';
import BaseAPI from './base';

export default class TwoStepVerificationAPI extends BaseAPI implements TwoStepVerificationClass {
    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    async setTwoStepVerificationCode(pin: string): Promise<ResponseSuccess> {
        const body = {
            pin,
        };

        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }
}
