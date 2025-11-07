// ============================================================================
// Message Template Status Update Webhook Types
// @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#message_template_status_update
// ============================================================================

/**
 * Message template status events
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#value--event
 */
export type TemplateStatusEvent =
    | 'APPROVED' // Template approved
    | 'REJECTED' // Template rejected
    | 'PENDING' // Template pending review
    | 'DISABLED' // Template disabled
    | 'REINSTATED' // Template reinstated
    | 'IN_APPEAL' // Template in appeal
    | 'FLAGGED' // Template scheduled for disabling
    | 'PAUSED' // Template paused
    | 'PENDING_DELETION'; // Template pending deletion

/**
 * Template rejection reasons
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#value--reason
 */
export type TemplateRejectionReason =
    | 'NONE' // Default when template is approved
    | 'ABUSIVE_CONTENT' // Content determined to be abusive
    | 'INCORRECT_CATEGORY' // Category incorrect
    | 'INVALID_FORMAT' // Duplicate content or missing examples
    | 'SCAM'; // Content determined to be a scam

export interface TemplateDisableInfo {
    disable_date: string;
}

export interface TemplatePauseInfo {
    title: string;
    description: string;
}

export interface MessageTemplateStatusUpdateValue {
    event: TemplateStatusEvent;
    message_template_id: number;
    message_template_name: string;
    message_template_language: string;
    reason: TemplateRejectionReason | null;
    disable_info?: TemplateDisableInfo;
    other_info?: TemplatePauseInfo;
}

export interface MessageTemplateStatusUpdateWebhookValue {
    field: 'message_template_status_update';
    value: MessageTemplateStatusUpdateValue;
}

// ============================================================================
// Template Category Update Webhook Types
// @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#template_category_update
// ============================================================================

/**
 * Template categories
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#value--event
 */
export type TemplateCategory =
    | 'MARKETING' // Previous category
    | 'OTP' // Previous category
    | 'TRANSACTIONAL' // Previous category
    | 'AUTHENTICATION' // New category
    | 'UTILITY'; // New category

export interface TemplateCategoryUpdateValue {
    message_template_id: number;
    message_template_name: string;
    message_template_language: string;
    previous_category: TemplateCategory;
    new_category: TemplateCategory;
}

export interface TemplateCategoryUpdateWebhookValue {
    field: 'template_category_update';
    value: TemplateCategoryUpdateValue;
}

// ============================================================================
// Message Template Quality Update Webhook Types
// @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#message_template_quality_update
// ============================================================================

/**
 * Template quality scores
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#value--event
 */
export type TemplateQualityScore =
    | 'GREEN' // High quality
    | 'YELLOW' // Medium quality
    | 'RED' // Low quality
    | 'UNKNOWN'; // Unknown quality

export interface MessageTemplateQualityUpdateValue {
    previous_quality_score: TemplateQualityScore;
    new_quality_score: TemplateQualityScore;
    message_template_id: number;
    message_template_name: string;
    message_template_language: string;
}

export interface MessageTemplateQualityUpdateWebhookValue {
    field: 'message_template_quality_update';
    value: MessageTemplateQualityUpdateValue;
}
