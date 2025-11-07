import type { WhatsAppMessage } from './message';

// ============================================================================
// History Webhook Types
// @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#history
// ============================================================================

/**
 * History sync metadata
 */
export interface HistorySyncMetadata {
    phase: number;
    chunk_order: number;
    progress: number;
}

/**
 * Reaction object in history
 */
export interface HistoryReaction {
    message_id: string;
    emoji: string;
}

/**
 * Message echo data (sent messages)
 */
export interface HistoryMessageEcho {
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
    reaction?: HistoryReaction;
    order?: any;
    biz_opaque_callback_data?: string;
    template?: any;
}

/**
 * History sync thread data
 */
export interface HistorySyncThread {
    id: string;
    messages: WhatsAppMessage[];
}

/**
 * History sync error data
 */
export interface HistorySyncError {
    message: string;
    error_data?: {
        details: string;
    };
}

/**
 * History sync data
 */
export interface HistorySyncData {
    metadata: HistorySyncMetadata;
    threads?: HistorySyncThread[];
    errors?: HistorySyncError[];
}

/**
 * History webhook value
 */
export interface HistoryValue {
    messaging_product: string;
    metadata: HistorySyncMetadata;
    history?: HistorySyncData[];
    messages?: WhatsAppMessage[];
    message_echoes?: HistoryMessageEcho[];
}

export interface HistoryWebhookValue {
    field: 'history';
    value: HistoryValue;
}
