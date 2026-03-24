import { MessageTypesEnum } from '../../../types/enums';
import type {
    AudioMessage,
    ButtonMessage,
    ContactsMessage,
    DocumentMessage,
    ImageMessage,
    InteractiveButtonReplyMessage,
    InteractiveListReplyMessage,
    InteractiveMessage,
    InteractiveNfmReplyMessage,
    LocationMessage,
    OrderMessage,
    ReactionMessage,
    StickerMessage,
    SystemMessage,
    TextMessage,
    VideoMessage,
    WhatsAppMessage,
} from '../types/message';

// ============================================================================
// Type Guards — narrow WhatsAppMessage to specific types
// ============================================================================

export function isTextMessage(msg: WhatsAppMessage): msg is TextMessage {
    return msg.type === MessageTypesEnum.Text;
}

export function isImageMessage(msg: WhatsAppMessage): msg is ImageMessage {
    return msg.type === MessageTypesEnum.Image;
}

export function isVideoMessage(msg: WhatsAppMessage): msg is VideoMessage {
    return msg.type === MessageTypesEnum.Video;
}

export function isAudioMessage(msg: WhatsAppMessage): msg is AudioMessage {
    return msg.type === MessageTypesEnum.Audio;
}

export function isDocumentMessage(msg: WhatsAppMessage): msg is DocumentMessage {
    return msg.type === MessageTypesEnum.Document;
}

export function isStickerMessage(msg: WhatsAppMessage): msg is StickerMessage {
    return msg.type === MessageTypesEnum.Sticker;
}

export function isInteractiveMessage(msg: WhatsAppMessage): msg is InteractiveMessage {
    return msg.type === MessageTypesEnum.Interactive;
}

export function isButtonMessage(msg: WhatsAppMessage): msg is ButtonMessage {
    return msg.type === MessageTypesEnum.Button;
}

export function isLocationMessage(msg: WhatsAppMessage): msg is LocationMessage {
    return msg.type === MessageTypesEnum.Location;
}

export function isContactsMessage(msg: WhatsAppMessage): msg is ContactsMessage {
    return msg.type === MessageTypesEnum.Contacts;
}

export function isReactionMessage(msg: WhatsAppMessage): msg is ReactionMessage {
    return msg.type === MessageTypesEnum.Reaction;
}

export function isOrderMessage(msg: WhatsAppMessage): msg is OrderMessage {
    return msg.type === MessageTypesEnum.Order;
}

export function isSystemMessage(msg: WhatsAppMessage): msg is SystemMessage {
    return msg.type === MessageTypesEnum.System;
}

// Interactive sub-type guards
export function isButtonReply(msg: WhatsAppMessage): msg is InteractiveButtonReplyMessage {
    return isInteractiveMessage(msg) && msg.interactive.type === 'button_reply';
}

export function isListReply(msg: WhatsAppMessage): msg is InteractiveListReplyMessage {
    return isInteractiveMessage(msg) && msg.interactive.type === 'list_reply';
}

export function isNfmReply(msg: WhatsAppMessage): msg is InteractiveNfmReplyMessage {
    return isInteractiveMessage(msg) && msg.interactive.type === 'nfm_reply';
}

// ============================================================================
// Structured data extractors — type-safe parsed data from messages
// ============================================================================

export type MediaInfo = {
    id: string;
    mimeType: string;
    sha256: string;
    caption?: string;
    filename?: string;
    animated?: boolean;
    voice?: boolean;
};

/**
 * Extract media info from image/video/audio/document/sticker messages.
 * Returns null if the message is not a media message.
 *
 * @example
 * ```ts
 * const media = getMediaInfo(message);
 * if (media) {
 *   const url = await sdk.media.get(media.id);
 * }
 * ```
 */
export function getMediaInfo(msg: WhatsAppMessage): MediaInfo | null {
    if (isImageMessage(msg)) {
        return {
            id: msg.image.id,
            mimeType: msg.image.mime_type,
            sha256: msg.image.sha256,
            caption: msg.image.caption,
        };
    }
    if (isVideoMessage(msg)) {
        return {
            id: msg.video.id,
            mimeType: msg.video.mime_type,
            sha256: msg.video.sha256,
            caption: msg.video.caption,
        };
    }
    if (isAudioMessage(msg)) {
        return { id: msg.audio.id, mimeType: msg.audio.mime_type, sha256: msg.audio.sha256, voice: msg.audio.voice };
    }
    if (isDocumentMessage(msg)) {
        return {
            id: msg.document.id,
            mimeType: msg.document.mime_type,
            sha256: msg.document.sha256,
            caption: msg.document.caption,
            filename: msg.document.filename,
        };
    }
    if (isStickerMessage(msg)) {
        return {
            id: msg.sticker.id,
            mimeType: msg.sticker.mime_type,
            sha256: msg.sticker.sha256,
            animated: msg.sticker.animated,
        };
    }
    return null;
}

export type InteractiveReply = {
    type: 'button_reply' | 'list_reply' | 'nfm_reply';
    id: string;
    title: string;
    description?: string;
    responseJson?: string;
};

/**
 * Extract the user's selection from interactive messages (button reply, list reply, nfm reply).
 * Returns null if not an interactive message.
 *
 * @example
 * ```ts
 * const reply = getInteractiveReply(message);
 * if (reply) {
 *   console.log(`User selected: ${reply.title} (id: ${reply.id})`);
 * }
 * ```
 */
export function getInteractiveReply(msg: WhatsAppMessage): InteractiveReply | null {
    if (!isInteractiveMessage(msg)) return null;

    if (msg.interactive.type === 'button_reply') {
        return {
            type: 'button_reply',
            id: msg.interactive.button_reply.id,
            title: msg.interactive.button_reply.title,
        };
    }
    if (msg.interactive.type === 'list_reply') {
        return {
            type: 'list_reply',
            id: msg.interactive.list_reply.id,
            title: msg.interactive.list_reply.title,
            description: msg.interactive.list_reply.description,
        };
    }
    if (msg.interactive.type === 'nfm_reply') {
        return {
            type: 'nfm_reply',
            id: msg.interactive.nfm_reply.name,
            title: msg.interactive.nfm_reply.body,
            responseJson: msg.interactive.nfm_reply.response_json,
        };
    }
    return null;
}

export type LocationInfo = {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
    url?: string;
};

/**
 * Extract location data from a location message.
 * Returns null if not a location message.
 */
export function getLocationInfo(msg: WhatsAppMessage): LocationInfo | null {
    if (!isLocationMessage(msg)) return null;
    return {
        latitude: msg.location.latitude,
        longitude: msg.location.longitude,
        name: msg.location.name,
        address: msg.location.address,
        url: msg.location.url,
    };
}

export type ContactInfo = {
    formattedName: string;
    firstName?: string;
    lastName?: string;
    phones: string[];
    emails: string[];
};

/**
 * Extract contact info from a contacts message.
 * Returns empty array if not a contacts message.
 */
export function getContactsInfo(msg: WhatsAppMessage): ContactInfo[] {
    if (!isContactsMessage(msg)) return [];
    return msg.contacts.map((c) => ({
        formattedName: c.name.formatted_name,
        firstName: c.name.first_name,
        lastName: c.name.last_name,
        phones: c.phones?.map((p) => p.phone) || [],
        emails: c.emails?.map((e) => e.email) || [],
    }));
}

export type ReactionInfo = {
    messageId: string;
    emoji: string | null; // null = reaction removed
};

/**
 * Extract reaction data from a reaction message.
 * Returns null if not a reaction message.
 */
export function getReactionInfo(msg: WhatsAppMessage): ReactionInfo | null {
    if (!isReactionMessage(msg)) return null;
    return {
        messageId: msg.reaction.message_id,
        emoji: msg.reaction.emoji || null,
    };
}

export type OrderInfo = {
    catalogId: string;
    text?: string;
    items: Array<{
        productId: string;
        quantity: number;
        price: number;
        currency: string;
    }>;
};

/**
 * Extract order data from an order message.
 * Returns null if not an order message.
 */
export function getOrderInfo(msg: WhatsAppMessage): OrderInfo | null {
    if (!isOrderMessage(msg)) return null;
    return {
        catalogId: msg.order.catalog_id,
        text: msg.order.text,
        items: msg.order.product_items.map((item) => ({
            productId: item.product_retailer_id,
            quantity: item.quantity,
            price: item.item_price,
            currency: item.currency,
        })),
    };
}
