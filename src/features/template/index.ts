import TemplateApi from './TemplateApi';

// 기본 export 유지
export default TemplateApi;

// 명시적 named export
export { TemplateApi };

// 필요한 타입만 명시적으로 export
export type {
    TemplateClass,
    TemplateDeleteParams,
    TemplateGetParams,
    TemplateRequestBody,
    TemplateResponse,
} from './types';
