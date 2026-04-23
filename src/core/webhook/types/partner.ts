// ============================================================================
// partner_solutions Webhook Types
// @see https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/partner_solutions
//
// Triggered for partner solution lifecycle events.
//
// Sample payload (from Meta webhook test panel):
// {
//   "event": "SOLUTION_CREATED",
//   "solution_id": "1234567890",
//   "solution_status": "INITIATED"
// }
// ============================================================================

/**
 * Partner solution event types.
 * Known value: "SOLUTION_CREATED"
 */
export type PartnerSolutionEvent = 'SOLUTION_CREATED' | string;

/**
 * Partner solution status values.
 * Known value: "INITIATED"
 */
export type PartnerSolutionStatus = 'INITIATED' | string;

export interface PartnerSolutionsValue {
    /** Type of partner solution event */
    event: PartnerSolutionEvent;
    /** Unique identifier for the partner solution */
    solution_id: string;
    /** Current status of the partner solution */
    solution_status: PartnerSolutionStatus;
}

export interface PartnerSolutionsWebhookValue {
    field: 'partner_solutions';
    value: PartnerSolutionsValue;
}
