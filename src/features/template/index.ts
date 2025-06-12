// 기본 export 유지

// 명시적 named export

// 필요한 타입만 명시적으로 export
export type {
    TemplateClass,
    TemplateDeleteParams,
    TemplateGetParams,
    TemplateRequestBody,
    TemplateResponse,
} from './types';

// Default export
export { default } from './TemplateApi';

// Named export for TemplateApi
export { default as TemplateApi } from './TemplateApi';

// Export all types
export * from './types';

// Export factory functions
export {
    createAuthenticationTemplate,
    createCatalogTemplate,
    createCouponTemplate,
    createLimitedTimeOfferTemplate,
    createMediaCardCarouselTemplate,
    createMPMTemplate,
    createOTPTemplate,
    createProductCardCarouselTemplate,
    createSPMTemplate,
    createTemplate,
} from './factories';
