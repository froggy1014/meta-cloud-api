// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/payment_configuration_update/

export type * from './payments-br';
export type * from './payments-in';

/** @deprecated Import from `./payments-in` instead. */
export type {
    PaymentConfigurationUpdateValue,
    PaymentConfigurationUpdateWebhookValue,
} from './payments-in';
