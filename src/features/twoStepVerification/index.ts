import TwoStepVerificationApi from './TwoStepVerificationApi';

// 기본 export 유지
export default TwoStepVerificationApi;

// 명시적 named export
export { TwoStepVerificationApi };

// 필요한 타입만 명시적으로 export
export type { TwoStepVerificationClass, TwoStepVerificationRequest } from './types';
