// ============================================================================
// payment_configuration_update Webhook Types
// @see https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/payment_configuration_update
//
// Triggered when a payment configuration for a WhatsApp Business Account is
// created or updated (e.g. via Razorpay or other payment providers).
//
// Sample payload (from Meta webhook test panel):
// {
//   "configuration_name": "test-payment-configuration",
//   "provider_name": "razorpay",
//   "provider_mid": "test-provider-mid",
//   "status": "Needs Testing",
//   "created_timestamp": 123457678,
//   "updated_timestamp": 123457678
// }
// ============================================================================

export interface PaymentConfigurationUpdateValue {
    /** Name of the payment configuration */
    configuration_name: string;
    /** Payment provider name (e.g. "razorpay") */
    provider_name: string;
    /** Merchant ID assigned by the payment provider */
    provider_mid: string;
    /**
     * Current status of the payment configuration.
     * Known values: "Needs Testing"
     */
    status: string;
    /** Unix timestamp of when the configuration was created */
    created_timestamp: number;
    /** Unix timestamp of when the configuration was last updated */
    updated_timestamp: number;
}

export interface PaymentConfigurationUpdateWebhookValue {
    field: 'payment_configuration_update';
    value: PaymentConfigurationUpdateValue;
}
