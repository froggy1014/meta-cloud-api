import {
    FlowActionEnum,
    FlowDataExchangeRequest,
    FlowEndpointRequest,
    FlowErrorNotificationRequest,
    FlowHealthCheckRequest,
} from '../types/flow';

/**
 * Type guard to check if a request is a Ping (health check) request
 * @param request The Flow endpoint request to check
 * @returns True if the request is a Ping request, false otherwise
 */
export function isFlowPingRequest(request: FlowEndpointRequest): request is FlowHealthCheckRequest {
    return 'action' in request && request.action === 'ping';
}

/**
 * Type guard to check if a request is a Data Exchange request
 * @param request The Flow endpoint request to check
 * @returns True if the request is a Data Exchange request, false otherwise
 */
export function isFlowDataExchangeRequest(request: FlowEndpointRequest): request is FlowDataExchangeRequest & {
    action: FlowActionEnum.DATA_EXCHANGE;
    screen: string;
    flow_token: string;
    data?: Record<string, any>;
} {
    return 'action' in request && request.action === FlowActionEnum.DATA_EXCHANGE;
}

/**
 * Type guard to check if a request is an Error Notification request
 * @param request The Flow endpoint request to check
 * @returns True if the request is an Error Notification request, false otherwise
 */
export function isFlowErrorRequest(request: FlowEndpointRequest): request is FlowErrorNotificationRequest & {
    action: Exclude<FlowActionEnum, FlowActionEnum.BACK>;
    screen: string;
    flow_token: string;
    data: {
        error_key?: string;
        error_message?: string;
    };
} {
    return (
        'action' in request &&
        request.action !== FlowActionEnum.BACK &&
        'data' in request &&
        typeof request.data === 'object' &&
        request.data !== null &&
        (('error_key' in request.data && request.data.error_key !== undefined) ||
            ('error_message' in request.data && request.data.error_message !== undefined))
    );
}
