// ============================================================================
// Phone Number Name Update Webhook Types
// @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#phone_number_name_update
// ============================================================================

/**
 * Phone number name update decision
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#phone-number-updates
 */
export type PhoneNumberDecision = 'APPROVED' | 'REJECTED' | 'DEFERRED';

export interface PhoneNumberNameUpdateValue {
    display_phone_number: string;
    decision: PhoneNumberDecision;
    requested_verified_name: string;
    rejection_reason: string | null;
}

export interface PhoneNumberNameUpdateWebhookValue {
    field: 'phone_number_name_update';
    value: PhoneNumberNameUpdateValue;
}

// ============================================================================
// Phone Number Quality Update Webhook Types
// @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#phone_number_quality_update
// ============================================================================

/**
 * Phone number quality events
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#value--event
 */
export type PhoneNumberQualityEvent = 'FLAGGED' | 'UNFLAGGED' | 'UPGRADE' | 'DOWNGRADE' | 'ONBOARDING';

/**
 * Messaging tier limits
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#value--current_limit
 */
export type CurrentLimit = 'TIER_50' | 'TIER_250' | 'TIER_1K' | 'TIER_10K' | 'TIER_100K' | 'TIER_UNLIMITED';

export interface PhoneNumberQualityUpdateValue {
    display_phone_number: string;
    event: PhoneNumberQualityEvent;
    current_limit: CurrentLimit;
}

export interface PhoneNumberQualityUpdateWebhookValue {
    field: 'phone_number_quality_update';
    value: PhoneNumberQualityUpdateValue;
}
