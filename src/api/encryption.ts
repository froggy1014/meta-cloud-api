import type { WabaConfigType } from '../types/config';
import type { EncryptionClass, EncryptionPublicKeyResponse } from '../types/encryption';
import { HttpMethodsEnum, WabaConfigEnum } from '../types/enums';
import type { RequesterClass, ResponseSuccess } from '../types/request';
import BaseAPI from './base';

export default class EncryptionAPI extends BaseAPI implements EncryptionClass {
    private readonly endpoint = 'whatsapp_business_encryption';

    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    async getEncryptionPublicKey(): Promise<EncryptionPublicKeyResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async setEncryptionPublicKey(businessPublicKey: string): Promise<ResponseSuccess> {
        const formData = new FormData();
        formData.append('business_public_key', businessPublicKey);

        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            formData,
        );
    }
}
