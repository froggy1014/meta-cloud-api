// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/whatsapp-business-encryption/

// Endpoints:
// - GET /{PHONE_NUMBER_ID}/whatsapp_business_encryption
// - POST /{PHONE_NUMBER_ID}/whatsapp_business_encryption

import { BaseAPI } from '../../types/base';
import type { WabaConfigType } from '../../types/config';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import type { RequesterClass, ResponseSuccess } from '../../types/request';
import type { EncryptionClass, EncryptionPublicKeyResponse } from './types';

export default class EncryptionApi extends BaseAPI implements EncryptionClass {
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

        return this.sendFormData(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            formData,
        );
    }
}
