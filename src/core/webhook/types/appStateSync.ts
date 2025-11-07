import type { WebhookMetadata } from './common';

// ============================================================================
// SMB App State Sync Webhook Types
// @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#smb_app_state_sync
// ============================================================================

/**
 * Contact data in state sync
 */
export interface StateSyncContact {
    full_name: string;
    first_name: string;
    phone_number: string;
}

/**
 * State sync metadata
 */
export interface StateSyncMetadata {
    timestamp: string;
    version: number;
}

/**
 * State sync data
 */
export interface StateSyncData {
    type: string;
    contact: StateSyncContact;
    action: string;
    metadata: StateSyncMetadata;
}

/**
 * SMB App State Sync value
 */
export interface SmbAppStateSyncValue {
    messaging_product: string;
    metadata: WebhookMetadata;
    state_sync: StateSyncData[];
}

export interface SmbAppStateSyncWebhookValue {
    field: 'smb_app_state_sync';
    value: SmbAppStateSyncValue;
}
