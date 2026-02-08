// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/

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
export { default, default as TemplateApi } from './TemplateApi';
export type {
    TemplateClass,
    TemplateDeleteParams,
    TemplateGetParams,
    TemplateRequestBody,
    TemplateResponse,
} from './types';
export * from './types';
