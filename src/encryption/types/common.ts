import type { ResponseSuccess } from '../../types/request';
import type { EncryptionPublicKeyResponse } from './publicKey';

export interface EncryptionClass {
    getEncryptionPublicKey(): Promise<EncryptionPublicKeyResponse>;
    setEncryptionPublicKey(businessPublicKey: string): Promise<ResponseSuccess>;
}
