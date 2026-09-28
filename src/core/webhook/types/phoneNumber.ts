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

// ============================================================================
// business_username_updates Webhook Types
// @see https://developers.facebook.com/documentation/business-messaging/whatsapp/business-scoped-user-ids#business_username_updates-webhook
//
// Triggered when a business username's status changes.
// ============================================================================

/**
 * Business username status
 * - `approved` — visible to WhatsApp users (also sent when Meta revokes a username and replaces it with a generated one)
 * - `deleted` — removed via the WhatsApp Business app, or because Meta revoked it
 * - `reserved` — reserved for the number but not yet visible to WhatsApp users
 */
export type BusinessUsernameStatus = 'approved' | 'deleted' | 'reserved';

/**
 * Extra context for a username status change. `revoked` (currently the only
 * value) means Meta revoked the username.
 */
export type BusinessUsernameUpdateContext = 'revoked';

export interface BusinessUsernameUpdatesValue {
    display_phone_number: string;
    /** The username whose status changed. Omitted when `status` is `deleted`. */
    username?: string;
    status: BusinessUsernameStatus;
    /**
     * Present only when there is context beyond the status (added September 15, 2026).
     * An absent `context` does not by itself identify who initiated the change.
     */
    context?: BusinessUsernameUpdateContext;
}

export interface BusinessUsernameUpdatesWebhookValue {
    field: 'business_username_updates';
    value: BusinessUsernameUpdatesValue;
}
