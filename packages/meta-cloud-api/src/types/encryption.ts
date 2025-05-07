import { ResponseData, ResponseSuccess } from './request';

export type EncryptionPublicKeyResponse = ResponseData<{
    business_public_key: string;
    business_public_key_signature_status: 'VALID' | 'MISMATCH';
}>;

export interface EncryptionClass {
    getEncryptionPublicKey(): Promise<EncryptionPublicKeyResponse>;
    setEncryptionPublicKey(businessPublicKey: string): Promise<ResponseSuccess>;
}
