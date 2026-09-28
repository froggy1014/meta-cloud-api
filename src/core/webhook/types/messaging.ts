import type { WebhookContact, WebhookMetadata } from './common';
import type { WhatsAppMessage } from './message';
import type { StatusWebhook } from './status';

// ============================================================================
// messaging_handovers Webhook Types
// @see https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messaging_handovers
// @see https://developers.facebook.com/documentation/business-messaging/whatsapp/conversation-routing/thread-control/#events
//
// Triggered when Conversation Routing thread ownership changes.
// Subscribe to the `messaging_handovers` webhook field.
//
// - `control_passed` is delivered to the new owner when a pass succeeds.
// - `control_taken` is delivered to the previous owner when the escalation
//   partner takes the thread (explicitly, or implicitly by sending a Service message).
// - A release names no new owner, so it fires no event.
//
// Sample payload:
// {
//   "messaging_product": "whatsapp",
//   "sender": { "phone_number": "..." },
//   "recipient": { "phone_number_id": "...", "display_phone_number": "..." },
//   "type": "control_passed",
//   "timestamp": "1697041663",
//   "control_passed": {
//     "previous_owner_role": "ai_agent",
//     "new_owner_role": "escalation",
//     "metadata": "...",
//     "conversation_context": { "type": "summary", "summary": { "text": "..." } }
//   }
// }
// ============================================================================

/**
 * Conversation Routing role identifier carried on handover events.
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/conversation-routing/overview/
 */
export type MessagingHandoverRole = 'ai_agent' | 'ctwa' | 'customer_service' | 'escalation' | 'marketing' | 'utility';

/**
 * AI-generated summary of the conversation so far, delivered so a responder
 * picking up a thread has context without the full history. Sent only when the
 * receiving responder is not in standby and the business is eligible, so treat
 * it as optional. `summary.text` is model-generated prose — do not parse it.
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/conversation-routing/conversation-context/
 */
export interface ConversationContext {
    type: 'summary';
    summary: {
        text: string;
    };
}

export interface MessagingHandoverControlPassed {
    /** Role of the responder that passed control */
    previous_owner_role?: MessagingHandoverRole;
    /** Role of the responder that received control */
    new_owner_role?: MessagingHandoverRole;
    /** Optional metadata string (max 2,000 characters) passed by the caller */
    metadata?: string;
    /** Conversation summary, included conditionally */
    conversation_context?: ConversationContext;
}

export interface MessagingHandoverControlTaken {
    /** Role of the responder that lost control */
    previous_owner_role?: MessagingHandoverRole;
    /** Role of the responder that took control (the escalation partner) */
    new_owner_role?: MessagingHandoverRole;
    /** Optional metadata string (max 2,000 characters) passed by the caller */
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
    /** Handover event type */
    type?: 'control_passed' | 'control_taken';
    /** Unix timestamp of the event */
    timestamp: string;
    /** Present when thread control is passed to you */
    control_passed?: MessagingHandoverControlPassed;
    /** Present when the escalation partner took thread control from you */
    control_taken?: MessagingHandoverControlTaken;
}

export interface MessagingHandoversWebhookValue {
    field: 'messaging_handovers';
    value: MessagingHandoversValue;
}

// ============================================================================
// standby Webhook Types
// @see https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/standby
//
// Delivered when your app is subscribed to the `standby` field, the business has
// enabled Meta Business Agent on the number and granted your app standby
// permissions, and your app is NOT the active handler. It lets a passive app
// observe conversation activity handled by another app (e.g. Meta Business Agent).
//
// The payload wraps the event one level deeper than normal webhooks: the message,
// message-echo, or status objects live under `value.standby.{messages|message_echoes|statuses}`
// instead of directly under `value`. A given standby notification carries exactly
// one of those arrays.
//
// You will NOT receive standby webhooks when you are the active handler (you get
// regular `messages`-field webhooks instead) or for messages your own app sent.
// ============================================================================

/**
 * Flow definition attached to a standby message echo, present only for flow
 * message echoes.
 */
export interface StandbyMessageEchoFlow {
    id: string;
    name: string;
    status: string;
    categories: string[];
}

/**
 * A single echoed outbound message observed while in standby. Carries the raw
 * Send Message API request body used by the active handler, not rendered content.
 */
export interface StandbyMessageEcho {
    /** WhatsApp message ID (wamid.*) of the echoed outbound message */
    id: string;
    /** Unix timestamp (seconds, as a string) of when the message was sent */
    timestamp: string;
    /**
     * The exact Send Message API request body used to send the message, e.g.
     * `{ messaging_product, to, recipient_type?, type, [type]: {...}, context? }`.
     * For template messages the send-time variable values live here under `template`.
     */
    message: {
        messaging_product: 'whatsapp';
        recipient_type?: string;
        to: string;
        type: string;
        context?: {
            message_id: string;
        };
        [key: string]: unknown;
    };
    /**
     * Full unhydrated template definition (layout with placeholders). Present only
     * for template message echoes, alongside `message`.
     */
    template?: Record<string, unknown>;
    /** Full flow definition. Present only for flow message echoes, alongside `message`. */
    flow?: StandbyMessageEchoFlow;
}

/**
 * The standby event payload nested under `value.standby`. Contains exactly one of
 * `messages`, `message_echoes`, or `statuses` (with `contacts` alongside `messages`).
 */
export interface StandbyEvent {
    /** Contact profiles for the users in an inbound standby message event */
    contacts?: WebhookContact[];
    /** Inbound messages received while your app is not the active handler */
    messages?: WhatsAppMessage[];
    /** Echoes of outbound messages sent by the active handler (e.g. Meta Business Agent) */
    message_echoes?: StandbyMessageEcho[];
    /** Delivery/read status updates for messages sent by the active handler */
    statuses?: StatusWebhook[];
}

export interface StandbyValue {
    messaging_product: 'whatsapp';
    metadata: WebhookMetadata;
    /** The standby event payload; carries exactly one event array */
    standby: StandbyEvent;
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
//     "parent_user_id": "US.7654321",
//     "detail": "User requested to stop marketing messages",
//     "category": "marketing_messages",
//     "value": "stop",
//     "timestamp": 1729610285,
//     "signup_id": "123456789"
//   }],
//   "contacts": [{ "profile": { "name": "...", "username": "..." }, "wa_id": "...", "user_id": "..." }]
// }
//
// Preferences are always scoped to the individual business-scoped user ID (`user_id`).
// They are never applied at the parent BSUID (`parent_user_id`) level, so an opt-out on
// one BSUID does not opt out the other BSUIDs sharing the same parent.
// ============================================================================

export interface UserPreferenceEntry {
    /** WhatsApp ID of the user. May be absent when only BSUIDs are shared. */
    wa_id?: string;
    /**
     * Business-scoped user ID the preference applies to (e.g. "US.1234567").
     * The preference is always scoped to this ID.
     */
    user_id?: string;
    /**
     * Parent business-scoped user ID of the user, when the user is enrolled in a
     * parent BSUID. Informational only — preferences are never applied at the
     * parent BSUID level.
     */
    parent_user_id?: string;
    /** Human-readable description of the preference change */
    detail: string;
    /**
     * Category of the preference that changed.
     * Known value: "marketing_messages"
     */
    category: 'marketing_messages' | string;
    /**
     * New preference value.
     * Known values: "stop" (user opted out), "resume" (user opted back in)
     */
    value: 'stop' | 'resume' | string;
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
    /** WhatsApp ID of the user. May be absent when only BSUIDs are shared. */
    wa_id?: string;
    /** Business-scoped user ID of the user */
    user_id?: string;
    /** Parent business-scoped user ID of the user, when enrolled */
    parent_user_id?: string;
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
