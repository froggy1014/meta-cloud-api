import type { WabaConfigType } from '../types/config';
import { HttpMethodsEnum, WabaConfigEnum } from '../types/enums';
import {
    CreateQrCodeRequest,
    QrCodeClass,
    QrCodeResponse,
    QrCodesResponse,
    UpdateQrCodeRequest,
} from '../types/qrCode';
import type { RequesterClass, RequesterResponseInterface, ResponseSuccess } from '../types/request';
import BaseAPI from './base';

export default class QrCodeAPI extends BaseAPI implements QrCodeClass {
    private readonly endpoint = 'message_qrdls';

    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    async createQrCode(request: CreateQrCodeRequest): Promise<RequesterResponseInterface<QrCodeResponse>> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(request),
        );
    }

    async getQrCodes(): Promise<RequesterResponseInterface<QrCodesResponse>> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async getQrCode(qrCodeId: string): Promise<RequesterResponseInterface<QrCodeResponse>> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}/${qrCodeId}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async updateQrCode(request: UpdateQrCodeRequest): Promise<RequesterResponseInterface<QrCodeResponse>> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(request),
        );
    }

    async deleteQrCode(qrCodeId: string): Promise<RequesterResponseInterface<ResponseSuccess>> {
        return this.sendJson(
            HttpMethodsEnum.Delete,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}/${qrCodeId}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }
}
