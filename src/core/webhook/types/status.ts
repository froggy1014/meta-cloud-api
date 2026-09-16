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
        /**
         * Whether the message is billable.
         *
         * Meta will deprecate this property in a future versioned release; use
         * `type` and `category` together to decide whether a message is billable
         * and, if so, at which rate.
         */
        billable: boolean;
        /** `CBP` only appears on webhooks sent before July 1, 2025. */
        pricing_model: 'CBP' | 'PMP';
        /**
         * Pricing type. Semantics change with the October 1, 2026 service and
         * utility pricing update (documented September 10, 2026):
         * - `regular` — billable. From October 1, 2026 this also covers 1:1
         *   utility messages sent inside an open customer service window, group
         *   utility messages inside an open group customer service window, and
         *   1:1 and group service messages sent after the business phone
         *   number's free tier is used up.
         * - `free_customer_service` — through September 30, 2026, a utility
         *   template or non-template message sent inside a customer service
         *   window; from October 1, 2026, a 1:1 service delivery inside the
         *   business phone number's free tier.
         * - `free_entry_point` — message sent inside an open free entry point
         *   window.
         * - `free_group_customer_service` — through September 30, 2026, a group
         *   utility or non-template message delivered inside an open group
         *   customer service window; from October 1, 2026, a group service
         *   delivery inside the business phone number's free tier.
         */
        type: 'regular' | 'free_customer_service' | 'free_entry_point' | 'free_group_customer_service';
        /**
         * Pricing category (rate) applied if billable.
         *
         * Note the hyphen in `authentication-international`: Meta documents the
         * pricing category with a hyphen, unlike the `conversation.origin.type`
         * value `authentication_international`. The underscored spelling is kept
         * for payloads that still use it.
         */
        category:
            | 'authentication'
            | 'authentication-international'
            | 'authentication_international'
            | 'group_marketing'
            | 'group_service'
            | 'group_utility'
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
