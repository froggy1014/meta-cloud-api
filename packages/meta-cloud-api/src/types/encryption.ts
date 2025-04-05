import { ResponseData, ResponseSuccess, RequesterResponseInterface } from './request';

export type EncryptionPublicKeyResponse = ResponseData<{
    business_public_key: string;
    business_public_key_signature_status: 'VALID' | 'MISMATCH';
}>;

export interface EncryptionClass {
    getEncryptionPublicKey(): Promise<RequesterResponseInterface<EncryptionPublicKeyResponse>>;
    setEncryptionPublicKey(businessPublicKey: string): Promise<RequesterResponseInterface<ResponseSuccess>>;
}
