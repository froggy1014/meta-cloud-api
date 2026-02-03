// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/

export type {
    TemplateClass,
    TemplateDeleteParams,
    TemplateGetParams,
    TemplateRequestBody,
    TemplateResponse,
} from './types';

export { default } from './TemplateApi';

export { default as TemplateApi } from './TemplateApi';

export * from './types';

export {
    createAuthenticationTemplate,
    createCatalogTemplate,
    createCouponTemplate,
    createLimitedTimeOfferTemplate,
    createMPMTemplate,
    createMediaCardCarouselTemplate,
    createOTPTemplate,
    createProductCardCarouselTemplate,
    createSPMTemplate,
    createTemplate,
} from './factories';
