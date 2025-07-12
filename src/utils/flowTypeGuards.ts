import {
    FlowActionEnum,
    FlowDataExchangeRequest,
    FlowEndpointRequest,
    FlowErrorNotificationRequest,
    FlowHealthCheckRequest,
} from '@api/flow/types';

/**
 * Helper function to check if a value is an object
 * @param value The value to check
 * @returns True if the value is a non-null object
 */
function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

/**
 * Helper function to check if a value is a string
 * @param value The value to check
 * @returns True if the value is a string
 */
function isString(value: unknown): value is string {
    return typeof value === 'string';
}

// Array of allowed action types for data exchange requests
const DATA_EXCHANGE_ACTIONS = [FlowActionEnum.DATA_EXCHANGE, FlowActionEnum.INIT, FlowActionEnum.BACK] as const;

// Array of allowed action types for error notification requests
const ERROR_ACTIONS = [FlowActionEnum.DATA_EXCHANGE, FlowActionEnum.INIT] as const;

/**
 * Type guard to check if a request is a Data Exchange request
 * Validates the request structure according to the Flow API specifications
 *
 * @param request The Flow endpoint request to check
 * @returns True if the request is a valid Data Exchange request, false otherwise
 */
export function isFlowDataExchangeRequest(request: FlowEndpointRequest): request is FlowDataExchangeRequest & {
    action: (typeof DATA_EXCHANGE_ACTIONS)[number];
    screen?: string;
    flow_token: string;
    data?: Record<string, any>;
} {
    // Check for basic required fields
    if (!('flow_token' in request && isString(request.flow_token) && 'action' in request)) {
        return false;
    }

    const { action, version, screen, data } = request;

    // Validate API version
    const hasValidVersion = version === '3.0';

    // Check if the action is one of the allowed actions for data exchange
    const hasValidAction = DATA_EXCHANGE_ACTIONS.includes(action as any);

    // Screen is optional, but when present must be a string and not 'SUCCESS'
    const hasValidScreen = typeof screen === 'undefined' || (isString(screen) && screen !== 'SUCCESS');

    // Data is required except for DATA_EXCHANGE action
    const hasValidData = action === FlowActionEnum.DATA_EXCHANGE || isObject(data);

    // All conditions must be met for a valid data exchange request
    return hasValidVersion && hasValidAction && hasValidScreen && hasValidData;
}

/**
 * Type guard to check if a request is an Error Notification request
 * Validates the request structure according to the Flow API error specifications
 *
 * @param request The Flow endpoint request to check
 * @returns True if the request is a valid Error Notification request, false otherwise
 */
export function isFlowErrorRequest(request: FlowEndpointRequest): request is FlowErrorNotificationRequest & {
    action: (typeof ERROR_ACTIONS)[number];
    screen: string;
    flow_token: string;
    data: {
        error: string;
        error_message: string;
    };
} {
    // Check for basic required fields
    if (!('flow_token' in request && isString(request.flow_token) && 'action' in request)) {
        return false;
    }

    const { action, screen, data } = request;

    // Check if the action is one of the allowed actions for error notifications
    const hasValidAction = ERROR_ACTIONS.includes(action as any);

    // Screen is required for error notifications
    const hasValidScreen = isString(screen);

    // Validate error data structure
    const hasValidData =
        isObject(data) &&
        'error_key' in data &&
        isString(data.error) &&
        'error_message' in data &&
        isString(data.error_message);

    // All conditions must be met for a valid error notification request
    return hasValidAction && hasValidScreen && hasValidData;
}

/**
 * Type guard to check if a request is a Ping (health check) request
 * Simple validation for health check endpoints in the Flow API
 *
 * @param request The Flow endpoint request to check
 * @returns True if the request is a Ping request, false otherwise
 */
export function isFlowPingRequest(request: FlowEndpointRequest): request is FlowHealthCheckRequest {
    // A ping request only requires the 'action' field with value 'ping'
    return 'action' in request && request.action === 'ping';
}
