import { MessageTypesEnum } from '../../types/enums';

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

// ============================================================================
// Message Types - Base
// ============================================================================

/**
 * Base message properties common to all message types
 */
interface BaseMessage {
    from: string;
    id: string;
    timestamp: string;
}

// ============================================================================
// Message Types - Text
// ============================================================================

export interface TextMessage extends BaseMessage {
    type: MessageTypesEnum.Text;
    text: {
        body: string;
    };
    context?: ForwardedContext | ProductContext;
    referral?: ReferralInfo;
}

// ============================================================================
// Message Types - Media (Image, Video, Audio, Document, Sticker)
// ============================================================================

export interface ImageMessage extends BaseMessage {
    type: MessageTypesEnum.Image;
    image: {
        caption?: string;
        mime_type: string;
        sha256: string;
        id: string;
        url: string;
    };
    context?: ForwardedContext;
    referral?: ReferralInfo;
}

export interface VideoMessage extends BaseMessage {
    type: MessageTypesEnum.Video;
    video: {
        caption?: string;
        mime_type: string;
        sha256: string;
        id: string;
        url: string;
    };
    context?: ForwardedContext;
    referral?: ReferralInfo;
}

export interface AudioMessage extends BaseMessage {
    type: MessageTypesEnum.Audio;
    audio: {
        mime_type: string;
        sha256: string;
        id: string;
        url: string;
        voice: boolean;
    };
    referral?: ReferralInfo;
}

export interface DocumentMessage extends BaseMessage {
    type: MessageTypesEnum.Document;
    document: {
        caption?: string;
        filename: string;
        mime_type: string;
        sha256: string;
        id: string;
        url: string;
    };
    referral?: ReferralInfo;
}

export interface StickerMessage extends BaseMessage {
    type: MessageTypesEnum.Sticker;
    sticker: {
        mime_type: string;
        sha256: string;
        id: string;
        url: string;
        animated: boolean;
    };
    referral?: ReferralInfo;
}

// ============================================================================
// Message Types - Interactive
// ============================================================================

export interface InteractiveListReplyMessage extends BaseMessage {
    type: MessageTypesEnum.Interactive;
    context: ReplyContext;
    interactive: {
        type: 'list_reply';
        list_reply: {
            id: string;
            title: string;
            description?: string;
        };
    };
}

export interface InteractiveButtonReplyMessage extends BaseMessage {
    type: MessageTypesEnum.Interactive;
    context: ReplyContext;
    interactive: {
        type: 'button_reply';
        button_reply: {
            id: string;
            title: string;
        };
    };
}

export interface InteractiveNfmReplyMessage extends BaseMessage {
    type: MessageTypesEnum.Interactive;
    context: ReplyContext;
    interactive: {
        type: 'nfm_reply';
        nfm_reply: {
            name: string;
            body: string;
            response_json: string;
        };
    };
}

export type InteractiveMessage =
    | InteractiveListReplyMessage
    | InteractiveButtonReplyMessage
    | InteractiveNfmReplyMessage;

// ============================================================================
// Message Types - Button (Quick Reply)
// ============================================================================

export interface ButtonMessage extends BaseMessage {
    type: MessageTypesEnum.Button;
    context: ReplyContext;
    button: {
        payload: string;
        text: string;
    };
}

// ============================================================================
// Message Types - Location
// ============================================================================

export interface LocationMessage extends BaseMessage {
    type: MessageTypesEnum.Location;
    location: {
        latitude: number;
        longitude: number;
        name?: string;
        address?: string;
        url?: string;
    };
    referral?: ReferralInfo;
}

// ============================================================================
// Message Types - Contacts
// ============================================================================

export interface ContactsMessage extends BaseMessage {
    type: MessageTypesEnum.Contacts;
    contacts: Array<{
        addresses?: Array<{
            city?: string;
            country?: string;
            country_code?: string;
            state?: string;
            street?: string;
            type?: string;
            zip?: string;
        }>;
        birthday?: string;
        emails?: Array<{
            email: string;
            type?: string;
        }>;
        name: {
            formatted_name: string;
            first_name?: string;
            last_name?: string;
            middle_name?: string;
            suffix?: string;
            prefix?: string;
        };
        org?: {
            company?: string;
            department?: string;
            title?: string;
        };
        phones?: Array<{
            phone: string;
            wa_id?: string;
            type?: string;
        }>;
        urls?: Array<{
            url: string;
            type?: string;
        }>;
    }>;
    referral?: ReferralInfo;
}

// ============================================================================
// Message Types - Reaction
// ============================================================================

export interface ReactionMessage extends BaseMessage {
    type: MessageTypesEnum.Reaction;
    reaction: {
        message_id: string;
        emoji?: string; // Omitted if user removes reaction
    };
}

// ============================================================================
// Message Types - Order
// ============================================================================

export interface OrderMessage extends BaseMessage {
    type: MessageTypesEnum.Order;
    order: {
        catalog_id: string;
        text?: string;
        product_items: Array<{
            product_retailer_id: string;
            quantity: number;
            item_price: number;
            currency: string;
        }>;
    };
}

// ============================================================================
// Message Types - System
// ============================================================================

export interface SystemMessage extends BaseMessage {
    type: MessageTypesEnum.System;
    system: {
        body: string;
        wa_id: string;
        type: 'user_changed_number';
    };
}

// ============================================================================
// Message Types - Unsupported
// ============================================================================

export interface UnsupportedMessage extends BaseMessage {
    type: MessageTypesEnum.Unsupported;
    errors: Array<WebhookError>;
}

// ============================================================================
// Message Types - Group
// ============================================================================

export type GroupMessage = {
    group_id: string;
} & (TextMessage | ImageMessage | VideoMessage | AudioMessage | DocumentMessage | LocationMessage | ContactsMessage);

// ============================================================================
// Message Union Type
// ============================================================================

export type WhatsAppMessage =
    | TextMessage
    | ImageMessage
    | VideoMessage
    | AudioMessage
    | DocumentMessage
    | StickerMessage
    | InteractiveMessage
    | ButtonMessage
    | LocationMessage
    | ContactsMessage
    | ReactionMessage
    | OrderMessage
    | SystemMessage
    | UnsupportedMessage
    | GroupMessage;

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

// ============================================================================
// Webhook Value Types (Discriminated Union)
// ============================================================================

/**
 * Webhook value for incoming messages
 */
export interface MessageWebhookValue {
    messaging_product: 'whatsapp';
    metadata: WebhookMetadata;
    contacts: Array<WebhookContact>;
    messages: Array<WhatsAppMessage>;
}

/**
 * Webhook value for status updates
 */
export interface StatusWebhookValue {
    messaging_product: 'whatsapp';
    metadata: WebhookMetadata;
    statuses: Array<StatusWebhook>;
}

/**
 * Webhook value for errors (no contacts or messages)
 */
export interface ErrorWebhookValue {
    messaging_product: 'whatsapp';
    metadata: WebhookMetadata;
    errors: Array<WebhookError>;
}

/**
 * Union type for all webhook value types
 */
export type WebhookValue = MessageWebhookValue | StatusWebhookValue | ErrorWebhookValue;

// ============================================================================
// Top-Level Webhook Structure
// ============================================================================

export interface WebhookPayload {
    object: 'whatsapp_business_account';
    entry: Array<{
        id: string;
        changes: Array<{
            value: WebhookValue;
            field: 'messages';
        }>;
    }>;
}

// ============================================================================
// Legacy/Compatibility Types
// ============================================================================

/**
 * @deprecated Use specific message types instead
 * Represents a message received through the webhook
 */
export interface WebhookMessage {
    wabaId: string;
    id: string;
    from: string;
    timestamp: string;
    type: MessageTypesEnum;
    phoneNumberId: string;
    displayPhoneNumber: string;
    profileName: string;
    text?: TextMessage['text'];
    image?: ImageMessage['image'];
    video?: VideoMessage['video'];
    audio?: AudioMessage['audio'];
    document?: DocumentMessage['document'];
    sticker?: StickerMessage['sticker'];
    location?: LocationMessage['location'];
    contacts?: ContactsMessage['contacts'];
    interactive?: InteractiveMessage['interactive'];
    button?: ButtonMessage['button'];
    order?: OrderMessage['order'];
    system?: SystemMessage['system'];
    reaction?: ReactionMessage['reaction'];
    statuses?: StatusWebhook;
    originalData: any;
}

/**
 * @deprecated Use WebhookValue instead
 */
export interface WebhookMessageValue {
    messaging_product: string;
    metadata: WebhookMetadata;
    contacts?: Array<WebhookContact>;
    messages: Array<WhatsAppMessage>;
    statuses?: Array<StatusWebhook>;
    errors?: Array<WebhookError>;
}

/**
 * Webhook event received from WhatsApp
 */
export interface WebhookEvent {
    field: string;
    value: any;
    timestamp: number;
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
