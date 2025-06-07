import type { ResponseData } from '../../types/request';

export type EncryptionPublicKeyResponse = ResponseData<{
    business_public_key: string;
    business_public_key_signature_status: 'VALID' | 'MISMATCH';
}>;
