import type { MessageTypesEnum } from '../../../types/enums';
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

/**
 * System message webhook (identity changes).
 *
 * - `user_changed_number` — the user's phone number changed; `wa_id` holds the new number.
 * - `user_identity_changed` — the user's identity (profile) changed.
 * - `user_changed_user_id` — the user's business-scoped user ID (BSUID) changed;
 *   `user_id` / `parent_user_id` hold the new BSUID / parent BSUID.
 *
 * Note: there is no subscribable `user_id_update` webhook field. BSUID changes are
 * delivered as these `messages` field system messages.
 */
export interface SystemMessage extends BaseMessage {
    type: MessageTypesEnum.System;
    system: {
        /** Human-readable description, e.g. "User A changed from <OLD_BSUID> to <NEW_BSUID>" */
        body: string;
        /** New WhatsApp ID of the user */
        wa_id: string;
        /** New business-scoped user ID, present for `user_changed_user_id` */
        user_id?: string;
        /** New parent business-scoped user ID, present for `user_changed_user_id` */
        parent_user_id?: string;
        type: 'user_changed_number' | 'user_identity_changed' | 'user_changed_user_id';
    };
}

// ============================================================================
// Message Types - Edit / Revoke (Coexistence)
// ============================================================================

/**
 * Message edit webhook — only available for WhatsApp Business app users (Coexistence).
 * Business-side edits made in the WhatsApp Business app are identified by
 * business-scoped user IDs when present.
 */
export interface EditMessage extends BaseMessage {
    type: MessageTypesEnum.Edit;
    /** Business-scoped user ID of the sender, when the edit originated business-side */
    from_user_id?: string;
    /** Parent business-scoped user ID of the sender, when the edit originated business-side */
    from_parent_user_id?: string;
    edit: {
        original_message_id: string;
        /** The edited message content (text, media with caption, etc.) */
        message: {
            context?: {
                id: string;
            };
            type: MessageTypesEnum | string;
            [key: string]: unknown;
        };
    };
}

/**
 * Message revoke (delete) webhook — only available for WhatsApp Business app users (Coexistence).
 * Business-side revokes made in the WhatsApp Business app are identified by
 * business-scoped user IDs when present.
 */
export interface RevokeMessage extends BaseMessage {
    type: MessageTypesEnum.Revoke;
    /** Business-scoped user ID of the sender, when the revoke originated business-side */
    from_user_id?: string;
    /** Parent business-scoped user ID of the sender, when the revoke originated business-side */
    from_parent_user_id?: string;
    revoke: {
        original_message_id: string;
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
    | EditMessage
    | RevokeMessage
    | UnsupportedMessage
    | GroupMessage;
