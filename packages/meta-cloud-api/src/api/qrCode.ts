import { HttpMethodsEnum, WabaConfigEnum } from '../types/enums';
import type { WabaConfigType } from '../types/config';
import type { RequesterClass, RequesterResponseInterface, ResponseSuccess } from '../types/request';
import BaseAPI from './base';
import {
    CreateQrCodeRequest,
    QrCodeClass,
    QrCodeResponse,
    QrCodesResponse,
    UpdateQrCodeRequest,
} from '../types/qrCode';

export default class QrCodeAPI extends BaseAPI implements QrCodeClass {
    private readonly endpoint = 'message_qrdls';

    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    async createQrCode(
        businessPhoneNumberId: string,
        request: CreateQrCodeRequest,
    ): Promise<RequesterResponseInterface<QrCodeResponse>> {
        return this.client.sendRequest(
            HttpMethodsEnum.Post,
            `${businessPhoneNumberId ?? this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(request),
        );
    }

    async getQrCodes(businessPhoneNumberId: string): Promise<RequesterResponseInterface<QrCodesResponse>> {
        return this.client.sendRequest(
            HttpMethodsEnum.Get,
            `${businessPhoneNumberId ?? this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async getQrCode(
        businessPhoneNumberId: string,
        qrCodeId: string,
    ): Promise<RequesterResponseInterface<QrCodeResponse>> {
        return this.client.sendRequest(
            HttpMethodsEnum.Get,
            `${businessPhoneNumberId ?? this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}/${qrCodeId}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async updateQrCode(
        businessPhoneNumberId: string,
        request: UpdateQrCodeRequest,
    ): Promise<RequesterResponseInterface<QrCodeResponse>> {
        return this.client.sendRequest(
            HttpMethodsEnum.Post,
            `${businessPhoneNumberId ?? this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(request),
        );
    }

    async deleteQrCode(
        businessPhoneNumberId: string,
        qrCodeId: string,
    ): Promise<RequesterResponseInterface<ResponseSuccess>> {
        return this.client.sendRequest(
            HttpMethodsEnum.Delete,
            `${businessPhoneNumberId ?? this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}/${qrCodeId}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }
}
