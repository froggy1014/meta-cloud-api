import type { WebhookMetadata } from './common';

// ============================================================================
// SMB Message Echoes Webhook Types
// @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#smb_message_echoes
// ============================================================================

/**
 * Message echo error
 */
export interface MessageEchoError {
    message: string;
    error_data?: {
        details: string;
    };
}

/**
 * Message echo data (sent messages from business)
 */
export interface MessageEcho {
    from: string;
    to: string;
    id: string;
    timestamp: string;
    text?: {
        body: string;
    };
    interactive?: any; // Complex interactive structure
    location?: any;
    image?: any;
    document?: any;
    voice?: any;
    audio?: any;
    video?: any;
    sticker?: any;
    button?: any;
    contacts?: any;
    reaction?: {
        message_id: string;
        emoji: string;
    };
    order?: any;
    biz_opaque_callback_data?: string;
    template?: any;
    system?: {
        type: string;
    };
    user_actions?: any[];
}

/**
 * SMB Message Echoes value
 */
export interface SmbMessageEchoesValue {
    metadata: WebhookMetadata;
    errors?: MessageEchoError[];
    message_echoes: MessageEcho[];
}

export interface SmbMessageEchoesWebhookValue {
    field: 'smb_message_echoes';
    value: SmbMessageEchoesValue;
}

// ============================================================================
// message_echoes Webhook Types
// @see https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/message-echoes
//
// Triggered when a message has been sent by your page/business.
// Supports text, image, audio, video, file, template, and fallback attachments.
// Subscribe to the `message_echoes` webhook field.
//
// Note: This is a Messenger Platform webhook format. For WhatsApp, the structure
// may be delivered under the smb_message_echoes field instead.
// ============================================================================

export interface MessageEchoSender {
    /** Page ID that sent the message */
    id: string;
}

export interface MessageEchoRecipient {
    /** Page-scoped ID of the user who received the message */
    id: string;
}

export interface MessageEchoAttachment {
    /** Attachment type: image, audio, video, file, template, fallback */
    type: string;
    /** URL of the attachment or fallback URL */
    url?: string;
    /** Template payload for template attachments */
    payload?: unknown;
    title?: string;
}

export interface MessageEchoBody {
    /** Indicates the message was sent by the page */
    is_echo: true;
    /** ID of the app that sent the message */
    app_id: number;
    /** Custom metadata string set in the Send API request */
    metadata?: string;
    /** Message ID */
    mid: string;
    /** Text content — present on text messages */
    text?: string;
    /** Attachments — present on media/template messages */
    attachments?: MessageEchoAttachment[];
}

export interface MessageEchoEntry {
    sender: MessageEchoSender;
    recipient: MessageEchoRecipient;
    /** Unix timestamp in milliseconds */
    timestamp: number;
    message: MessageEchoBody;
}

export interface MessageEchoesValue {
    /** Array of echoed messages */
    messaging: MessageEchoEntry[];
}

export interface MessageEchoesWebhookValue {
    field: 'message_echoes';
    value: MessageEchoesValue;
}
