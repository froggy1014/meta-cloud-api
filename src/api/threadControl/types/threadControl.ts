// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/conversation-routing/thread-control/

/**
 * Thread Control API Types
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/conversation-routing/thread-control/
 */

/**
 * Role identifiers a responder can hold under Conversation Routing.
 *
 * - `customer_service` — primary for the Service entry point
 * - `marketing` — primary for the Marketing Message Response entry point
 * - `utility` — primary for the Utility Response entry point
 * - `ctwa` — primary for the Click to WhatsApp entry point
 * - `ai_agent` — the designated AI agent (currently Meta Business Agent); only
 *   available where Meta Business Agent is enabled on the account
 * - `escalation` — the account's designated escalation partner
 *
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/conversation-routing/overview/
 */
export type ThreadControlRole = 'ai_agent' | 'ctwa' | 'customer_service' | 'escalation' | 'marketing' | 'utility';

/**
 * Identifies the WhatsApp user whose thread you are acting on. Provide exactly
 * one of `to` or `recipient`; Meta rejects a request carrying both or neither.
 */
export type ThreadControlUserIdentifier =
    | {
          /** The WhatsApp user's phone number or wa_id. */
          to: string;
          recipient?: never;
      }
    | {
          to?: never;
          /**
           * The WhatsApp user's business-scoped user ID (BSUID). Preferred: a BSUID
           * stays stable for a user and business even if the phone number changes.
           */
          recipient: string;
      };

export type ThreadControlBaseParams = ThreadControlUserIdentifier & {
    /**
     * Free-form string (max 2,000 characters) forwarded verbatim to the receiving
     * app on the resulting `messaging_handovers` event.
     */
    metadata?: string;
};

/**
 * Parameters for passing thread ownership.
 */
export type PassThreadControlParams = ThreadControlBaseParams & {
    /**
     * Targeted pass configuration. When omitted, control passes to the account's
     * designated escalation partner (untargeted pass).
     */
    control_pass?: {
        /** The role receiving thread control. */
        target_role: ThreadControlRole;
    };
};

export type ReleaseThreadControlParams = ThreadControlBaseParams;

export type TakeThreadControlParams = ThreadControlBaseParams;

/**
 * Response returned by a successful pass, release, or take.
 */
export type ThreadControlResponse = {
    messaging_product: 'whatsapp';
    /**
     * Opaque identifier for this request. Include it when you contact support
     * about a specific call (added September 25, 2026).
     */
    request_id: string;
};

export interface ThreadControlClass {
    pass(params: PassThreadControlParams): Promise<ThreadControlResponse>;
    release(params: ReleaseThreadControlParams): Promise<ThreadControlResponse>;
    take(params: TakeThreadControlParams): Promise<ThreadControlResponse>;
}
