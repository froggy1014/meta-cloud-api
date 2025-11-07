// ============================================================================
// Flows Webhook Types
// @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#flows
// ============================================================================

/**
 * Flow event types
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#value--event
 */
export type FlowEvent =
    | 'FLOW_STATUS_CHANGE' // Flow status changed
    | 'FLOW_HEALTH_UPDATE' // Flow health metrics updated
    | 'FLOW_THROTTLED'; // Flow throttled due to rate limits

/**
 * Flow status values
 * @see https://developers.facebook.com/docs/whatsapp/flows/reference/flowsapi#statuses
 */
export type FlowStatus = 'DRAFT' | 'PUBLISHED' | 'DEPRECATED' | 'BLOCKED' | 'THROTTLED';

/**
 * Flow alert state
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#value--alert_state
 */
export type FlowAlertState = 'ACTIVE' | 'RESOLVED';

/**
 * Flow endpoint request error
 */
export interface FlowEndpointRequestError {
    error_code: string;
    error_message: string;
    error_count: number;
}

/**
 * Flow webhook value
 */
export interface FlowsValue {
    event: FlowEvent;
    message?: string; // Human-readable description
    flow_id: string; // Flow ID
    old_status?: FlowStatus; // Previous status (for FLOW_STATUS_CHANGE)
    new_status?: FlowStatus; // New status (for FLOW_STATUS_CHANGE)
    warning?: string; // Warning message
    p90_latency?: number; // 90th percentile latency in ms
    p50_latency?: number; // 50th percentile latency in ms
    error_rate?: number; // Error rate (0.0 to 1.0)
    errors?: FlowEndpointRequestError[]; // List of errors
    requests_count?: number; // Total request count
    availability?: number; // Availability percentage (0.0 to 1.0)
    threshold?: number; // Threshold value
    alert_state?: FlowAlertState; // Alert state
}

export interface FlowsWebhookValue {
    field: 'flows';
    value: FlowsValue;
}
