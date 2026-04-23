import type { WebhookMetadata } from './common';

// ============================================================================
// messaging_handovers Webhook Types
// @see https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messaging_handovers
//
// Triggered when thread control is passed between apps in the handover protocol.
// Subscribe to the `messaging_handovers` webhook field.
//
// Sample payload (from Meta webhook test panel):
// {
//   "messaging_product": "whatsapp",
//   "recipient": { "display_phone_number": "...", "phone_number_id": "..." },
//   "sender": { "phone_number": "..." },
//   "timestamp": "1697041663",
//   "control_passed": { "metadata": "..." }
// }
// ============================================================================

export interface MessagingHandoverControlPassed {
    /** Optional metadata string passed with the handover */
    metadata?: string;
}

export interface MessagingHandoversValue {
    messaging_product: 'whatsapp';
    /** The business phone number that received the handover event */
    recipient: {
        display_phone_number: string;
        phone_number_id: string;
    };
    /** The user involved in the handover */
    sender: {
        phone_number: string;
    };
    /** Unix timestamp of the event */
    timestamp: string;
    /** Present when thread control is passed to another app */
    control_passed?: MessagingHandoverControlPassed;
}

export interface MessagingHandoversWebhookValue {
    field: 'messaging_handovers';
    value: MessagingHandoversValue;
}

// ============================================================================
// standby Webhook Types
// @see https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/standby
//
// Delivered when the app is not the current thread owner (handover protocol).
// Subscribe to the `standby` webhook field.
//
// Sample payload (from Meta webhook test panel):
// { "messaging_product": "whatsapp" }
//
// Note: The sample payload is minimal. Additional fields may be present
// in production depending on the event that triggered the standby notification.
// ============================================================================

export interface StandbyValue {
    messaging_product: 'whatsapp';
    [key: string]: unknown;
}

export interface StandbyWebhookValue {
    field: 'standby';
    value: StandbyValue;
}

// ============================================================================
// user_preferences Webhook Types
// @see https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/user_preferences
//
// Triggered when a user changes their messaging preferences (e.g. opting out
// of marketing messages).
//
// Sample payload (from Meta webhook test panel):
// {
//   "messaging_product": "whatsapp",
//   "metadata": { "display_phone_number": "...", "phone_number_id": "..." },
//   "user_preferences": [{
//     "wa_id": "16315551181",
//     "user_id": "US.1234567",
//     "detail": "User requested to stop marketing messages",
//     "category": "marketing_messages",
//     "value": "stop",
//     "timestamp": 1729610285,
//     "signup_id": "123456789"
//   }],
//   "contacts": [{ "profile": { "name": "...", "username": "..." }, "wa_id": "...", "user_id": "..." }]
// }
// ============================================================================

export interface UserPreferenceEntry {
    /** WhatsApp ID of the user */
    wa_id: string;
    /** Meta user ID (e.g. "US.1234567") */
    user_id: string;
    /** Human-readable description of the preference change */
    detail: string;
    /**
     * Category of the preference that changed.
     * Known value: "marketing_messages"
     */
    category: 'marketing_messages' | string;
    /**
     * New preference value.
     * Known value: "stop" (user opted out)
     */
    value: 'stop' | string;
    /** Unix timestamp of when the preference was changed */
    timestamp: number;
    /** Signup ID associated with the preference, if applicable */
    signup_id?: string;
}

export interface UserPreferencesContact {
    profile: {
        /** Display name of the user */
        name: string;
        /** WhatsApp username, if available */
        username?: string;
    };
    /** WhatsApp ID of the user */
    wa_id: string;
    /** Meta user ID */
    user_id?: string;
}

export interface UserPreferencesValue {
    messaging_product: 'whatsapp';
    metadata: WebhookMetadata;
    /** Array of user preference change events */
    user_preferences: UserPreferenceEntry[];
    /** Contact profile information for the users */
    contacts?: UserPreferencesContact[];
}

export interface UserPreferencesWebhookValue {
    field: 'user_preferences';
    value: UserPreferencesValue;
}
