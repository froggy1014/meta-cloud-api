import { MessageTypesEnum } from '../../../types/enums';
import type { ForwardedContext, ProductContext, ReferralInfo, ReplyContext, WebhookError } from './common';

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
