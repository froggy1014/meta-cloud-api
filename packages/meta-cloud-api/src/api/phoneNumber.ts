import {
    PhoneNumberClass,
    PhoneNumberResponse,
    PhoneNumbersResponse,
    RequestVerificationCodeRequest,
    VerifyCodeRequest,
} from 'src/types/phoneNumber';
import { objectToQueryString } from 'src/utils/objectToQueryString';
import type { WabaConfigType } from '../types/config';
import { HttpMethodsEnum, WabaConfigEnum } from '../types/enums';
import type { RequesterClass, ResponseSuccess } from '../types/request';
import BaseAPI from './base';

export default class PhoneNumberApi extends BaseAPI implements PhoneNumberClass {
    private readonly endpoint = 'phone_numbers';

    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    async getPhoneNumberById(fields?: string): Promise<PhoneNumberResponse> {
        const queryParams = fields ? objectToQueryString({ fields }) : '';
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.PhoneNumberId]}${queryParams}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async getPhoneNumbers(): Promise<PhoneNumbersResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async requestVerificationCode(
        requestVerificationCodeRequest: RequestVerificationCodeRequest,
    ): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/request_code`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(requestVerificationCodeRequest),
        );
    }

    async verifyCode(verifyCodeRequest: VerifyCodeRequest): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/verify_code`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(verifyCodeRequest),
        );
    }
}
