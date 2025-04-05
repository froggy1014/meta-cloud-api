import { HttpMethodsEnum, WabaConfigEnum } from '../types/enums';
import type { WabaConfigType } from '../types/config';
import type { RequesterClass, RequesterResponseInterface, ResponseSuccess } from '../types/request';
import BaseAPI from './base';
import type { EncryptionClass, EncryptionPublicKeyResponse } from '../types/encryption';

export default class EncryptionAPI extends BaseAPI implements EncryptionClass {
    private readonly endpoint = 'whatsapp_business_encryption';

    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    async getEncryptionPublicKey(): Promise<RequesterResponseInterface<EncryptionPublicKeyResponse>> {
        return this.client.sendRequest(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async setEncryptionPublicKey(businessPublicKey: string): Promise<RequesterResponseInterface<ResponseSuccess>> {
        const formData = new FormData();
        formData.append('business_public_key', businessPublicKey);

        return this.client.sendRequest(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            formData,
        );
    }
}
