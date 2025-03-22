import { objectToQueryString } from 'src/utils/objectToQueryString';
import type { WabaConfigType } from '../types/config';
import { DataLocalizationRegionEnum, HttpMethodsEnum, WabaConfigEnum } from '../types/enums';
import type { RequesterClass, RequesterResponseInterface, ResponseSuccess } from '../types/request';
import BaseAPI from './base';
import {
    PhoneNumberClass,
    PhoneNumberResponse,
    PhoneNumbersResponse,
    RequestVerificationCodeRequest,
    VerifyCodeRequest,
} from 'src/types/phoneNumber';

export default class PhoneNumberApi extends BaseAPI implements PhoneNumberClass {
    private readonly endpoint = 'phone_numbers';

    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    async getPhoneNumberById(
        businessPhoneNumberId: string,
        fields?: string,
    ): Promise<RequesterResponseInterface<PhoneNumberResponse>> {
        const queryParams = fields ? objectToQueryString({ fields }) : '';
        return this.client.sendRequest(
            HttpMethodsEnum.Get,
            `${businessPhoneNumberId ?? this.config[WabaConfigEnum.PhoneNumberId]}${queryParams}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async getPhoneNumbers(): Promise<RequesterResponseInterface<PhoneNumbersResponse>> {
        return this.client.sendRequest(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async requestVerificationCode(
        businessPhoneNumberId: string,
        requestVerificationCodeRequest: RequestVerificationCodeRequest,
    ): Promise<RequesterResponseInterface<ResponseSuccess>> {
        return this.client.sendRequest(
            HttpMethodsEnum.Post,
            `${businessPhoneNumberId ?? this.config[WabaConfigEnum.PhoneNumberId]}/request_code`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(requestVerificationCodeRequest),
        );
    }

    async verifyCode(
        businessPhoneNumberId: string,
        verifyCodeRequest: VerifyCodeRequest,
    ): Promise<RequesterResponseInterface<ResponseSuccess>> {
        return this.client.sendRequest(
            HttpMethodsEnum.Post,
            `${businessPhoneNumberId ?? this.config[WabaConfigEnum.PhoneNumberId]}/verify_code`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(verifyCodeRequest),
        );
    }

    async register(
        businessPhoneNumberId: string,
        pin: string,
        dataLocalizationRegion?: DataLocalizationRegionEnum,
    ): Promise<RequesterResponseInterface<ResponseSuccess>> {
        const body = {
            messaging_product: 'whatsapp',
            pin,
            ...(dataLocalizationRegion && { data_localization_region: dataLocalizationRegion }),
        };

        return this.client.sendRequest(
            HttpMethodsEnum.Post,
            `${businessPhoneNumberId ?? this.config[WabaConfigEnum.PhoneNumberId]}/register`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }

    async deregister(businessPhoneNumberId: string): Promise<RequesterResponseInterface<ResponseSuccess>> {
        return this.client.sendRequest(
            HttpMethodsEnum.Post,
            `${businessPhoneNumberId ?? this.config[WabaConfigEnum.PhoneNumberId]}/deregister`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }
}
