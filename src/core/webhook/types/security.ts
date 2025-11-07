// ============================================================================
// Security Webhook Types
// @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#security
// ============================================================================

/**
 * Two-step verification security events
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#value--event
 */
export type SecurityEvent =
    | 'PIN_CHANGED' // Two-step verification code updated
    | 'PIN_RESET_REQUEST' // Request to disable two-step verification
    | 'PIN_RESET_SUCCESS'; // Two-step verification code disabled

export interface SecurityValue {
    event: SecurityEvent;
    requester?: string; // ID of user who requested/disabled 2FA
}

export interface SecurityWebhookValue {
    field: 'security';
    value: SecurityValue;
}
