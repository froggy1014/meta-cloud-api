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
