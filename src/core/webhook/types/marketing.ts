import type { WebhookMetadata } from './common';

// ============================================================================
// automatic_events Webhook Types
// @see https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/automatic-events-api
//
// Triggered when Meta's ML detects a lead gen or purchase event from a
// Click-to-WhatsApp ad conversation (business customers must opt in via Embedded Signup).
// Subscribe to the `automatic_events` webhook field.
// Not available in EU, UK, or Japan.
//
// value.automatic_events[].event_name values:
//   - "LeadSubmitted" — A lead generation event was detected
//   - "Purchase"      — A purchase event was detected (includes custom_data)
// ============================================================================

/**
 * Detected event type.
 * Sample payload uses lowercase ("purchase"), docs use PascalCase ("Purchase").
 * Accept both forms.
 */
export type AutomaticEventName = 'LeadSubmitted' | 'Purchase' | 'purchase' | 'lead_submitted' | string;

export interface AutomaticEventCustomData {
    /** ISO 4217 currency code (e.g. "USD") — present on Purchase events */
    currency: string;
    /** Monetary value of the purchase — present on Purchase events */
    value: number;
}

export interface AutomaticEvent {
    /** WhatsApp message ID that triggered the event detection */
    id: string;
    /**
     * Detected event type.
     * @see AutomaticEventName
     */
    event_name: AutomaticEventName;
    /** Unix timestamp of when the event was detected */
    timestamp: number;
    /**
     * Click-to-WhatsApp ad click ID — use with Conversions API.
     * Present when the event originated from a Click-to-WhatsApp ad.
     */
    ctwa_clid?: string;
    /** Present on Purchase events */
    custom_data?: AutomaticEventCustomData;
}

export interface AutomaticEventsValue {
    messaging_product: 'whatsapp';
    metadata: WebhookMetadata;
    /** Array of detected automatic events */
    automatic_events: AutomaticEvent[];
}

export interface AutomaticEventsWebhookValue {
    field: 'automatic_events';
    value: AutomaticEventsValue;
}

// ============================================================================
// tracking_events Webhook Types
// @see https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/track-click-events
//
// Triggered for message delivery/click tracking events on marketing messages.
// Subscribe to the `tracking_events` webhook field.
//
// Sample payload (from Meta webhook test panel):
// {
//   "messaging_product": "whatsapp",
//   "metadata": { "display_phone_number": "...", "phone_number_id": "..." },
//   "events": [{
//     "event_name": "sent",
//     "timestamp": 1504902988,
//     "tracking_data": { "click_id": "...", "tracking_token": "..." }
//   }]
// }
// ============================================================================

export interface TrackingEventData {
    /** Unique identifier for the click, also appended to the destination URL */
    click_id?: string;
    /** Internal Meta token for processing and tracking */
    tracking_token?: string;
}

export interface TrackingEvent {
    /**
     * Name of the tracked event.
     * Known values: "sent"
     */
    event_name: string;
    /** Unix timestamp of the event */
    timestamp: number;
    /** Tracking data associated with the event */
    tracking_data?: TrackingEventData;
}

export interface TrackingEventsValue {
    messaging_product: 'whatsapp';
    metadata: WebhookMetadata;
    /** Array of tracking events */
    events: TrackingEvent[];
}

export interface TrackingEventsWebhookValue {
    field: 'tracking_events';
    value: TrackingEventsValue;
}

// ============================================================================
// user_actions on the `messages` Webhook Field
// @see https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/track-click-events
// @see https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/track-landing-page-views
//
// Marketing Messages API for WhatsApp (and Ads Manager) only. Meta delivers
// user actions on a marketing message — a link click, or (since September 23,
// 2026) a landing page view in the WhatsApp In-App Browser — as a `messages`
// field change whose value carries `user_actions` instead of `messages`,
// `statuses`, or `errors`. No extra subscription is needed beyond `messages`.
//
// Sample payload:
// {
//   "messaging_product": "whatsapp",
//   "metadata": { "display_phone_number": "...", "phone_number_id": "..." },
//   "user_actions": [{
//     "action_type": "landing_page_view",
//     "timestamp": "1758585600",
//     "marketing_messages_link_click_data": { "tracking_token": "...", "click_id": "..." }
//   }]
// }
// ============================================================================

/**
 * Known `user_actions[].action_type` values. Open enum: Meta adds values
 * without a breaking change, so ignore action types you do not recognize
 * instead of treating them as errors.
 *
 * - `marketing_messages_link_click` — the user tapped the body or call-to-action of a marketing message.
 * - `landing_page_view` — the tapped link opened its landing page in the WhatsApp In-App Browser.
 */
export type UserActionType = 'marketing_messages_link_click' | 'landing_page_view' | string;

/**
 * Payload container for every user action on a marketing message. The name
 * reflects its original click-only use; branch on `action_type` to tell a
 * click from a landing page view.
 */
export interface MarketingMessagesLinkClickData {
    /**
     * Which part of the message was tapped: the call-to-action or the body.
     * Click events only — absent on a landing page view.
     */
    click_component?: 'cta' | 'body';
    /**
     * Product ID assigned in Ads Manager or the Marketing API.
     * Click events only — absent on a landing page view.
     */
    product_id?: string;
    /**
     * Unique identifier for the click that opened the In-App Browser; also
     * appended to the destination URL. Shared by the click event and its
     * landing page view, so use it to correlate them when `tracking_token`
     * is missing. The key is omitted (not null) when unavailable.
     */
    click_id?: string;
    /**
     * Internal Meta token for processing and tracking. A landing page view
     * carries the same `tracking_token` as its click event. The key is omitted
     * when unavailable.
     */
    tracking_token?: string;
}

export interface UserAction {
    /** Name of the action. @see UserActionType */
    action_type: UserActionType;
    /** Unix timestamp, in seconds, of when Meta recorded the action */
    timestamp: string;
    /** Action payload. Present on click and landing page view actions. */
    marketing_messages_link_click_data?: MarketingMessagesLinkClickData;
}

/**
 * `messages` field value carrying marketing message user actions.
 * Neither event order nor pairing is guaranteed: a landing page view may
 * arrive before, after, or without its click event, and both correlation
 * keys can be absent.
 */
export interface UserActionsWebhookValue {
    messaging_product: 'whatsapp';
    metadata: WebhookMetadata;
    /** User actions on marketing messages */
    user_actions: UserAction[];
}
