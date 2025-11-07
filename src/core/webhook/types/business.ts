// ============================================================================
// Business Capability Update Webhook Types
// @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#business_capability_update
// ============================================================================

/**
 * Business capability limits
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#business-capability-updates
 */
export interface BusinessCapabilityUpdateValue {
    max_daily_conversation_per_phone?: number; // Template message limit per phone number
    max_phone_numbers_per_business?: number; // Max phone numbers per business
    max_phone_numbers_per_waba?: number; // Max phone numbers per WABA
}

export interface BusinessCapabilityUpdateWebhookValue {
    field: 'business_capability_update';
    value: BusinessCapabilityUpdateValue;
}
