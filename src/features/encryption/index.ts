import EncryptionApi from './EncryptionApi';

// 기본 export 유지
export default EncryptionApi;

// 명시적 named export
export { EncryptionApi };

// 필요한 타입만 명시적으로 export
export type { EncryptionClass, EncryptionPublicKeyResponse } from './types';
