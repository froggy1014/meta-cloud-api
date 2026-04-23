// ============================================================================
// Calls Webhook Types
// @see https://developers.facebook.com/docs/messenger-platform/calling/webhooks
//
// Sent when a call lifecycle event occurs (connect, call_status, media_update, terminate).
// Subscribe to the `calls` webhook field to receive these events.
// For business-initiated calls, also subscribe to `call_permission_reply`.
// ============================================================================

/**
 * Lifecycle event type for a call.
 *
 * - "connect"      — Call initiated; for consumer-initiated calls, respond with action=accept
 * - "call_status"  — Business-initiated call started ringing or was accepted (business-initiated only)
 * - "media_update" — Consumer-side media event; apply the new SDP to your peer connection (business-initiated only)
 * - "terminate"    — Call ended for any reason
 */
export type CallEventType = 'connect' | 'call_status' | 'media_update' | 'terminate';

/**
 * Direction of the call.
 *
 * - "business_initiated" — The business placed the call
 * - "user_initiated"     — The user placed the call
 */
export type CallDirection = 'business_initiated' | 'user_initiated';

/**
 * Status for business-initiated calls (call_status event).
 *
 * - "ringing"  — The outgoing call is ringing on the consumer's device
 * - "accepted" — The consumer accepted the call
 */
export type CallStatusValue = 'ringing' | 'accepted';

/**
 * Final call outcome (terminate event).
 *
 * - "Completed" — Call finished normally (includes calls rejected by either party)
 * - "Failed"    — Call failed mid-connection
 */
export type CallTerminateStatus = 'Completed' | 'Failed';

export interface CallSdpRenegotiation {
    /** SDP type — always "offer" for incoming media_update events */
    sdp_type: 'offer';
    /** SDP data compliant with RFC 4566 */
    sdp: string;
}

export interface CallSession {
    /**
     * Incremented each time Meta provides new SDP.
     * If multiple media_update webhooks arrive, apply the one with the highest version.
     */
    version: number;
    /** Contains the SDP offer from Meta; generate an answer and apply to your peer connection */
    sdp_renegotiation: CallSdpRenegotiation;
}

export interface CallEntry {
    /** Unique ID for the call — use in accept / reject / terminate API calls */
    id: string;

    /**
     * Lifecycle event type.
     * @see CallEventType
     */
    event: CallEventType;

    /** Unix timestamp */
    timestamp: number;

    // --- connect event ---
    /** Callee of the call (Page ID) — present on connect */
    to?: string;
    /** Caller of the call (PSID) — present on connect */
    from?: string;
    /** Whether the call was business- or user-initiated — present on connect */
    call_direction?: CallDirection;

    // --- call_status event (business-initiated only) ---
    /** PSID of the consumer — present on call_status */
    recipient_id?: string;
    /** Ringing or accepted — present on call_status */
    call_status?: CallStatusValue;

    // --- media_update event (business-initiated only) ---
    /** SDP session information; apply the offer to your local peer connection — present on media_update */
    session?: CallSession;

    // --- terminate event ---
    /** Final status of the call — present on terminate */
    status?: CallTerminateStatus;
    /** When the call started (Unix timestamp) — present on terminate */
    start_time?: number;
    /** When the call ended (Unix timestamp) — present on terminate */
    end_time?: number;
    /**
     * Call duration in seconds, counted from when the business connects.
     * Empty if the business did not successfully connect.
     * Present on terminate.
     */
    duration?: number;
}

export interface CallContact {
    profile: {
        /** Display name of the caller */
        name: string;
    };
    /** WhatsApp ID of the caller */
    wa_id: string;
}

export interface CallsValue {
    messaging_product: 'whatsapp';
    metadata: {
        display_phone_number: string;
        phone_number_id: string;
    };
    /** Array of call lifecycle events */
    calls: CallEntry[];
    /** Contact profile information for the caller */
    contacts?: CallContact[];
}

export interface CallsWebhookValue {
    field: 'calls';
    value: CallsValue;
}
