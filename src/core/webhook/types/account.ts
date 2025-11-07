// ============================================================================
// Account Update Webhook Types
// @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#account_update
// ============================================================================

/**
 * Account update event types
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#value--event
 */
export type AccountUpdateEvent =
    | 'VERIFIED_ACCOUNT' // Sandbox number upgraded to verified account
    | 'DISABLED_UPDATE' // Account banned or reinstated
    | 'ACCOUNT_VIOLATION' // Account violates WhatsApp policies
    | 'ACCOUNT_RESTRICTION' // Account restricted after policy violation
    | 'ACCOUNT_DELETED' // Account deleted
    | 'PARTNER_REMOVED' // Account removed from partner
    | 'PARTNER_APP_UNINSTALLED'; // Partner app uninstalled

/**
 * WABA ban state
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#value--ban_info
 */
export type WabaBanState = 'SCHEDULE_FOR_DISABLE' | 'DISABLE' | 'REINSTATE';

/**
 * Restriction types imposed on WABA
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#value--restriction_info
 */
export type RestrictionType =
    | 'RESTRICTION_ADD_PHONE_NUMBER_ACTION' // Cannot add phone numbers
    | 'RESTRICTED_BIZ_INITIATED_MESSAGING' // Cannot send business-initiated messages
    | 'RESTRICTED_CUSTOMER_INITIATED_MESSAGING'; // Cannot send customer-initiated messages

export interface AccountUpdateBanInfo {
    waba_ban_state: WabaBanState;
    waba_ban_date?: number; // timestamp
}

export interface AccountUpdateViolationInfo {
    violation_type: string;
}

export interface AccountUpdateRestrictionInfo {
    restriction_type: RestrictionType;
    expiration?: number; // timestamp
}

export interface AccountUpdateWabaInfo {
    waba_id: string;
    owner_business_id: string;
    partner_app_id?: string;
}

export interface AccountUpdateValue {
    phone_number?: string;
    event: AccountUpdateEvent;
    ban_info?: AccountUpdateBanInfo;
    violation_info?: AccountUpdateViolationInfo;
    restriction_info?: AccountUpdateRestrictionInfo[];
    waba_info?: AccountUpdateWabaInfo;
}

export interface AccountUpdateWebhookValue {
    field: 'account_update';
    value: AccountUpdateValue;
}

// ============================================================================
// Account Review Update Webhook Types
// @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#account_review_update
// ============================================================================

/**
 * Account review decision
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#value--decision
 */
export type ReviewDecision = 'APPROVED' | 'REJECTED' | 'DEFERRED';

export interface AccountReviewUpdateValue {
    decision: ReviewDecision;
}

export interface AccountReviewUpdateWebhookValue {
    field: 'account_review_update';
    value: AccountReviewUpdateValue;
}

// ============================================================================
// Account Alerts Webhook Types
// @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#account_alerts
// ============================================================================

/**
 * Entity type for alert
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#account-alerts
 */
export type AlertEntityType = 'BUSINESS' | 'PHONE_NUMBER' | 'WABA';

/**
 * Alert severity level
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#account-alerts
 */
export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

/**
 * Alert status
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#account-alerts
 */
export type AlertStatus = 'ACTIVE' | 'RESOLVED';

/**
 * Alert types for messaging limit increases
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#account-alerts
 */
export type AlertType =
    | 'INCREASED_CAPABILITIES_ELIGIBILITY_FAILED' // Limit increase denied
    | 'INCREASED_CAPABILITIES_ELIGIBILITY_DEFERRED' // More usage required
    | 'INCREASED_CAPABILITIES_ELIGIBILITY_NEED_MORE_INFO'; // Additional verification needed

export interface AccountAlertsValue {
    entity_type: AlertEntityType;
    entity_id: string;
    alert_severity: AlertSeverity;
    alert_status: AlertStatus;
    alert_type: AlertType;
    alert_description: string;
}

export interface AccountAlertsWebhookValue {
    field: 'account_alerts';
    value: AccountAlertsValue;
}
