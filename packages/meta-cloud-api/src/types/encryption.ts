import { ResponseData, ResponseSuccess, RequesterResponseInterface } from './request';

export type EncryptionPublicKeyResponse = ResponseData<{
    business_public_key: string;
    business_public_key_signature_status: 'VALID' | 'MISMATCH';
}>;

export interface EncryptionClass {
    getEncryptionPublicKey(
        businessPhoneNumberId?: string,
    ): Promise<RequesterResponseInterface<EncryptionPublicKeyResponse>>;

    setEncryptionPublicKey(
        businessPhoneNumberId: string,
        businessPublicKey: string,
    ): Promise<RequesterResponseInterface<ResponseSuccess>>;
}
