// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/whatsapp-business-encryption/

// Endpoints:
// - GET /{PHONE_NUMBER_ID}/whatsapp_business_encryption
// - POST /{PHONE_NUMBER_ID}/whatsapp_business_encryption

import { BaseAPI } from '../../types/base';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import type { ResponseSuccess } from '../../types/request';
import type { EncryptionClass, EncryptionPublicKeyResponse } from './types';

/**
 * API for managing WhatsApp Business Encryption keys.
 *
 * Provides methods to get and set the public encryption key used for
 * end-to-end encrypted messaging with WhatsApp Business.
 *
 * Endpoints covered:
 * - `GET /{PHONE_NUMBER_ID}/whatsapp_business_encryption` - Get the current public encryption key
 * - `POST /{PHONE_NUMBER_ID}/whatsapp_business_encryption` - Set a new public encryption key
 *
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/whatsapp-business-encryption/
 */
export default class EncryptionApi extends BaseAPI implements EncryptionClass {
    private readonly endpoint = 'whatsapp_business_encryption';

    /**
     * Retrieve the current public encryption key for the phone number.
     *
     * @returns The current public encryption key.
     * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/whatsapp-business-encryption/
     */
    async getEncryptionPublicKey(): Promise<EncryptionPublicKeyResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    /**
     * Set a new public encryption key for the phone number.
     *
     * @param businessPublicKey - The PEM-encoded public key string to set.
     * @returns A success response confirming the key was set.
     * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/whatsapp-business-encryption/
     */
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
