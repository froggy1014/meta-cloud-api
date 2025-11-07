// ============================================================================
// Common/Shared Types
// ============================================================================

/**
 * WhatsApp contact information
 */
export interface WebhookContact {
    wa_id: string;
    profile: {
        name: string;
    };
    identity_key_hash?: string;
}

/**
 * Metadata included in all webhooks
 */
export interface WebhookMetadata {
    display_phone_number: string;
    phone_number_id: string;
}

/**
 * Error object structure
 */
export interface WebhookError {
    code: number;
    title: string;
    message: string;
    error_data?: {
        details: string;
    };
    href?: string;
}

/**
 * Click to WhatsApp ad referral information
 */
export interface ReferralInfo {
    source_url: string;
    source_id: string;
    source_type: 'ad';
    body?: string;
    headline?: string;
    media_type?: 'image' | 'video';
    image_url?: string;
    video_url?: string;
    thumbnail_url?: string;
    ctwa_clid?: string;
    welcome_message?: {
        text: string;
    };
}

/**
 * Context for forwarded messages
 */
export interface ForwardedContext {
    forwarded?: true;
    frequently_forwarded?: true;
}

/**
 * Context for product inquiry messages
 */
export interface ProductContext {
    from: string;
    id: string;
    referred_product: {
        catalog_id: string;
        product_retailer_id: string;
    };
}

/**
 * Context for interactive/button replies
 */
export interface ReplyContext {
    from: string;
    id: string;
}
