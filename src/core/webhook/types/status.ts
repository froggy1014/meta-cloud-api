import type { WebhookError } from './common';

// ============================================================================
// Status Webhook Types
// ============================================================================

export interface StatusWebhook {
    id: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    timestamp: string;
    recipient_id: string;
    recipient_type?: 'group';
    recipient_participant_id?: string;
    recipient_identity_key_hash?: string;
    biz_opaque_callback_data?: string;
    /**
     * ID of the template used to send a Direct Send message.
     * Present only on statuses for messages sent with a `category` field.
     *
     * @see {@link https://developers.facebook.com/documentation/business-messaging/whatsapp/direct-send/supported-message-types | Direct Send}
     */
    template_id?: string;
    conversation?: {
        id: string;
        expiration_timestamp?: string;
        origin: {
            type:
                | 'authentication'
                | 'authentication_international'
                | 'marketing'
                | 'marketing_lite'
                | 'referral_conversion'
                | 'service'
                | 'utility';
        };
    };
    pricing?: {
        billable: boolean;
        pricing_model: 'CBP' | 'PMP';
        type: 'regular' | 'free_customer_service' | 'free_entry_point';
        category:
            | 'authentication'
            | 'authentication_international'
            | 'marketing'
            | 'marketing_lite'
            | 'referral_conversion'
            | 'service'
            | 'utility';
    };
    errors?: Array<WebhookError>;
}

/**
 * Message status enum
 */
export enum MessageStatus {
    DELIVERED = 'delivered',
    READ = 'read',
    SENT = 'sent',
    FAILED = 'failed',
}
