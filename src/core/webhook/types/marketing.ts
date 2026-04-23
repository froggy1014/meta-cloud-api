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
