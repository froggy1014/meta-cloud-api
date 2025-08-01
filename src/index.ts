// Main SDK class following official patterns
export { default as WhatsApp } from './core/whatsapp/WhatsApp';

// Official API classes for advanced usage
export {
    BusinessProfileApi,
    FlowApi,
    MediaApi,
    MessagesApi,
    PhoneNumberApi,
    TemplateApi,
    TwoStepVerificationApi,
} from './api';

// Essential types for basic usage
export type { WebhookContact, WebhookEvent, WebhookMessage } from './core/webhook/types';
export type { WabaConfigType, WhatsAppConfig } from './types/config';

// Flow types and enums
export { FlowTypeEnum } from './api/flow/types';
export type { FlowEndpointRequest, FlowEndpointResponse } from './api/flow/types';

// Utility functions
export { isFlowDataExchangeRequest, isFlowErrorRequest, isFlowPingRequest } from './utils/flowTypeGuards';
export { isMetaError } from './utils/isMetaError';
export type { MetaError } from './utils/isMetaError';

// Common enums that users need frequently
export {
    ComponentTypesEnum,
    InteractiveTypesEnum,
    LanguagesEnum,
    MessageTypesEnum,
    ParametersTypesEnum,
} from './types/enums';

// For backwards compatibility - deprecated, use specific imports instead
/** @deprecated Use 'meta-cloud-api/webhook/express' instead */
export { ExpressWebhook } from './core/webhook';
/** @deprecated Use 'meta-cloud-api/webhook/nextjs' instead */
export { NextJsWebhook } from './core/webhook';

// Legacy WhatsApp class for backwards compatibility
/** @deprecated Use the main WhatsApp export instead */
export { WhatsApp as WhatsAppLegacy } from './core/whatsapp';
