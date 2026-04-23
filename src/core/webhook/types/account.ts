// ============================================================================
// Account Update Webhook Types
// @see https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/account_update
//
// Triggered for changes to a WABA's verification, policy violations, partner
// relationships, pricing tier, authentication eligibility, and more.
// ============================================================================

/**
 * WABA event types for account_update webhook.
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/account_update
 */
export type AccountUpdateEvent =
    | 'ACCOUNT_DELETED' // WABA was deleted
    | 'ACCOUNT_OFFBOARDED' // WABA offboarded due to device change or phone number reregistration (new)
    | 'ACCOUNT_RECONNECTED' // WABA reconnected after device change or reregistration (new)
    | 'ACCOUNT_RESTRICTION' // WABA restricted due to policy violations; see restriction_info
    | 'ACCOUNT_VIOLATION' // WABA violated Meta policies or terms; see violation_info
    | 'AD_ACCOUNT_LINKED' // WABA onboarded onto MM API and partner given access to ad accounts
    | 'AUTH_INTL_PRICE_ELIGIBILITY_UPDATE' // WABA is eligible for authentication-international rates
    | 'BUSINESS_PRIMARY_LOCATION_COUNTRY_UPDATE' // WABA's primary business location was set; see country
    | 'DISABLED_UPDATE' // WABA banned or reinstated; see ban_info
    | 'MM_LITE_TERMS_SIGNED' // WABA accepted the MM API for WhatsApp terms of service
    | 'PARTNER_ADDED' // WABA shared with a Solution Partner
    | 'PARTNER_APP_INSTALLED' // Business customer granted the app permissions
    | 'PARTNER_APP_UNINSTALLED' // Business customer deauthenticated or uninstalled the app
    | 'PARTNER_CLIENT_CERTIFICATION_STATUS_UPDATE' // Partner-led business verification submission status changed
    | 'PARTNER_REMOVED' // WABA unshared with a Solution Partner
    | 'VERIFIED_ACCOUNT' // Sandbox number upgraded to verified account
    | 'VOLUME_BASED_PRICING_TIER_UPDATE'; // WABA's volume-based pricing tier updated; see volume_tier_info

/**
 * WABA ban state — present on DISABLED_UPDATE events.
 */
export type WabaBanState = 'SCHEDULE_FOR_DISABLE' | 'DISABLE' | 'REINSTATE';

/**
 * Restriction types imposed on WABA — present on ACCOUNT_RESTRICTION events.
 */
export type RestrictionType =
    | 'RESTRICTION_ADD_PHONE_NUMBER_ACTION' // Cannot add phone numbers
    | 'RESTRICTED_BIZ_INITIATED_MESSAGING' // Cannot send business-initiated messages
    | 'RESTRICTED_CUSTOMER_INITIATED_MESSAGING'; // Cannot send customer-initiated messages

/**
 * Reason for the disconnection — present on PARTNER_REMOVED events where
 * the business used both WhatsApp Business app and Cloud API.
 */
export type DisconnectionReason =
    | 'ACCOUNT_DISCONNECTED' // Account deleted or enforcement action; initiated by USER or SYSTEM
    | 'BUSINESS_DOWNGRADE' // Client registered phone number with consumer WhatsApp app
    | 'CHANGE_NUMBER' // Client changed their phone number
    | 'COMPANION_INACTIVITY' // Companion device inactive for ~30 days
    | 'PRIMARY_INACTIVITY' // Primary device inactive for ~14 days
    | 'USER_RE_REGISTERED'; // Client re-registered on a new device

/**
 * Who initiated the disconnection — present on PARTNER_REMOVED events.
 */
export type DisconnectionInitiatedBy =
    | 'SYSTEM' // System-initiated (device inactivity or enforcement)
    | 'USER'; // Client-initiated (number change, re-registration, account deletion)

/**
 * Status of the partner-led business verification submission.
 */
export type PartnerClientCertificationStatus = 'APPROVED' | 'REJECTED' | 'DISCARDED';

/** Present on DISABLED_UPDATE events */
export interface AccountUpdateBanInfo {
    waba_ban_state: WabaBanState;
    /** Unix timestamp of the ban date */
    waba_ban_date?: string;
}

/** Present on ACCOUNT_VIOLATION events */
export interface AccountUpdateViolationInfo {
    violation_type: string;
}

/** Present on ACCOUNT_RESTRICTION events */
export interface AccountUpdateRestrictionInfo {
    restriction_type: RestrictionType;
    /** Unix timestamp when the restriction expires */
    expiration?: number;
    /** Steps the business can take to remediate the restriction */
    remediation?: string;
}

/**
 * Present on PARTNER_ADDED, PARTNER_APP_INSTALLED, PARTNER_APP_UNINSTALLED,
 * PARTNER_REMOVED, AD_ACCOUNT_LINKED, and MM_LITE_TERMS_SIGNED events.
 */
export interface AccountUpdateWabaInfo {
    /** Customer or own WABA ID */
    waba_id: string;
    /** Business portfolio ID */
    owner_business_id: string;
    /** Partner app ID — present on PARTNER_APP_INSTALLED / PARTNER_APP_UNINSTALLED */
    partner_app_id?: string;
    /** Ad account ID — present on AD_ACCOUNT_LINKED */
    ad_account_linked?: string;
    /** Solution ID — present when customer onboarded via multi-partner solution */
    solution_id?: string;
    /** Partner business portfolio IDs — present for multi-partner solutions */
    solution_partner_business_ids?: string[];
}

/** Present on AUTH_INTL_PRICE_ELIGIBILITY_UPDATE events */
export interface AuthInternationalRateEligibility {
    /** Unix timestamp when authentication-international rates become effective */
    start_time: number;
    /** Countries with different start times */
    exception_countries?: Array<{
        /** ISO 3166-1 alpha-2 country code */
        country_code: string;
        /** Unix timestamp for this country's start time */
        start_time: number;
    }>;
}

/** Present on VOLUME_BASED_PRICING_TIER_UPDATE events */
export interface VolumeTierInfo {
    /** Unix timestamp of the tier update */
    tier_update_time: number;
    /** Pricing category (e.g. "UTILITY") */
    pricing_category: string;
    /** Pricing tier identifier */
    tier: string;
    /** Effective month in YYYY-MM format (e.g. "2025-11") */
    effective_month: string;
    /** Region for the tier update (e.g. "India") */
    region: string;
}

/** Present on PARTNER_REMOVED events where disconnection_info is applicable */
export interface DisconnectionInfo {
    reason: DisconnectionReason;
    initiated_by: DisconnectionInitiatedBy;
}

/** Present on PARTNER_CLIENT_CERTIFICATION_STATUS_UPDATE events */
export interface PartnerClientCertificationInfo {
    /** Customer's business portfolio ID */
    client_business_id: string;
    /** Status of the verification submission */
    status: PartnerClientCertificationStatus;
    /** Rejection reasons — present when status is REJECTED */
    rejection_reasons?: string[];
}

export interface AccountUpdateValue {
    /** Phone number associated with the WABA, if applicable */
    phone_number?: string;
    /**
     * Event type describing what changed.
     * @see AccountUpdateEvent
     */
    event: AccountUpdateEvent;
    /**
     * ISO 3166-1 alpha-2 country code.
     * Only included for BUSINESS_PRIMARY_LOCATION_COUNTRY_UPDATE events.
     */
    country?: string;
    /** Present on DISABLED_UPDATE events */
    ban_info?: AccountUpdateBanInfo;
    /** Present on ACCOUNT_VIOLATION events */
    violation_info?: AccountUpdateViolationInfo;
    /** Present on ACCOUNT_RESTRICTION events */
    restriction_info?: AccountUpdateRestrictionInfo[];
    /** Present on partner-related and AD_ACCOUNT_LINKED events */
    waba_info?: AccountUpdateWabaInfo;
    /** Present on AUTH_INTL_PRICE_ELIGIBILITY_UPDATE events */
    auth_international_rate_eligibility?: AuthInternationalRateEligibility;
    /** Present on VOLUME_BASED_PRICING_TIER_UPDATE events */
    volume_tier_info?: VolumeTierInfo;
    /** Present on PARTNER_REMOVED events where business used WhatsApp Business app + Cloud API */
    disconnection_info?: DisconnectionInfo;
    /** Present on PARTNER_CLIENT_CERTIFICATION_STATUS_UPDATE events */
    partner_client_certification_info?: PartnerClientCertificationInfo;
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

// ============================================================================
// account_settings_update Webhook Types
// @see https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/account_settings_update
//
// Triggered when account-level settings are changed (e.g. calling configuration).
//
// Sample payload (from Meta webhook test panel):
// {
//   "messaging_product": "whatsapp",
//   "timestamp": "1671644824",
//   "type": "phone_number_settings",
//   "phone_number_settings": {
//     "phone_number_id": "123456123",
//     "calling": {
//       "status": "ENABLED",
//       "call_icon_visibility": "DEFAULT",
//       "callback_permission_status": "ENABLED",
//       "call_hours": { "status": "DISABLED" },
//       "sip": { "status": "DISABLED" }
//     }
//   }
// }
// ============================================================================

export interface AccountSettingsCallingConfig {
    /** Whether calling is enabled for this phone number */
    status: 'ENABLED' | 'DISABLED' | string;
    /** Visibility of the call icon in WhatsApp */
    call_icon_visibility?: string;
    /** Status of callback permission */
    callback_permission_status?: 'ENABLED' | 'DISABLED' | string;
    /** Call hours configuration */
    call_hours?: { status: 'ENABLED' | 'DISABLED' | string };
    /** SIP (Session Initiation Protocol) configuration */
    sip?: { status: 'ENABLED' | 'DISABLED' | string };
}

export interface AccountSettingsPhoneNumberSettings {
    /** The phone number ID these settings apply to */
    phone_number_id: string;
    /** Calling feature configuration */
    calling?: AccountSettingsCallingConfig;
}

export interface AccountSettingsUpdateValue {
    messaging_product: 'whatsapp';
    /** Unix timestamp of the settings change */
    timestamp: string;
    /**
     * Type of settings that changed.
     * Known value: "phone_number_settings"
     */
    type: 'phone_number_settings' | string;
    /** Present when type is "phone_number_settings" */
    phone_number_settings?: AccountSettingsPhoneNumberSettings;
}

export interface AccountSettingsUpdateWebhookValue {
    field: 'account_settings_update';
    value: AccountSettingsUpdateValue;
}
