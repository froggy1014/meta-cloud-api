import RegistrationApi from './RegistrationApi';

// 기본 export 유지
export default RegistrationApi;

// 명시적 named export
export { RegistrationApi };

// 필요한 타입만 명시적으로 export
export type { RegistrationClass, RegistrationRequest } from './types';
