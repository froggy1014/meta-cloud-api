import { IncomingHttpHeaders, IncomingMessage } from 'http';
import { ResponseSuccess } from './request';

/**
 * Enum for Flow Status
 */
export enum FlowStatusEnum {
    Draft = 'DRAFT',
    Published = 'PUBLISHED',
    Throttled = 'THROTTLED',
    Blocked = 'BLOCKED',
    Deprecated = 'DEPRECATED',
}

/**
 * Enum for Flow Categories
 */
export enum FlowCategoryEnum {
    SignUp = 'SIGN_UP',
    SignIn = 'SIGN_IN',
    AppointmentBooking = 'APPOINTMENT_BOOKING',
    LeadGeneration = 'LEAD_GENERATION',
    ContactUs = 'CONTACT_US',
    CustomerSupport = 'CUSTOMER_SUPPORT',
    Survey = 'SURVEY',
    Other = 'OTHER',
}

export enum FlowActionEnum {
    INIT = 'INIT',
    BACK = 'BACK',
    DATA_EXCHANGE = 'data_exchange',
}

/**
 * Enum for Flow Types in webhook handlers
 * Used to register handlers for specific flow events
 */
export enum FlowTypeEnum {
    /** Health check/ping requests */
    Ping = 'ping',
    /** Data exchange requests */
    Change = 'data_exchange',
    /** Error notification requests */
    Error = 'error',
    /** Match all flow action types */
    All = '*',
}

/**
 * Flow Validation Error Pointer
 */
export interface FlowValidationErrorPointer {
    line_start: number;
    line_end: number;
    column_start: number;
    column_end: number;
    path: string;
}

/**
 * Flow Validation Error
 */
export interface FlowValidationError {
    error: string;
    error_type: string;
    message: string;
    line_start: number;
    line_end: number;
    column_start: number;
    column_end: number;
    pointers: FlowValidationErrorPointer[];
}

/**
 * Flow Item
 */
export interface Flow {
    id: string;
    name: string;
    status: FlowStatusEnum;
    categories: FlowCategoryEnum[];
    validation_errors: FlowValidationError[];
}

/**
 * Pagination Cursors
 */
export interface PaginationCursors {
    before: string;
    after: string;
}

/**
 * Pagination Object
 */
export interface Pagination {
    cursors: PaginationCursors;
}

/**
 * Flows List Response
 */
export interface FlowsListResponse {
    data: Flow[];
    paging: Pagination;
}

/**
 * Flow Asset
 */
export interface FlowAsset {
    name: string;
    asset_type: string;
    download_url: string;
}

/**
 * Flow Assets Response
 */
export interface FlowAssetsResponse {
    data: FlowAsset[];
    paging: Pagination;
}

/**
 * Flow Preview
 */
export interface FlowPreview {
    preview_url: string;
    expires_at: string;
}

/**
 * Flow Preview Response
 */
export interface FlowPreviewResponse {
    preview: FlowPreview;
    id: string;
}

/**
 * Flow Migration Result
 */
export interface FlowMigrationResult {
    source_name: string;
    source_id: string;
    migrated_id: string;
}

/**
 * Flow Migration Failure
 */
export interface FlowMigrationFailure {
    source_name: string;
    error_code: string;
    error_message: string;
}

/**
 * Create Flow Response
 */
export interface CreateFlowResponse {
    id: string;
    success: boolean;
    validation_errors?: FlowValidationError[];
}

/**
 * Update Flow Response
 */
export interface UpdateFlowResponse {
    success: boolean;
    validation_errors?: FlowValidationError[];
}

/**
 * Flow Migration Response
 */
export interface FlowMigrationResponse {
    migrated_flows: FlowMigrationResult[];
    failed_flows: FlowMigrationFailure[];
}

/**
 * Validate Flow JSON Response
 */
export interface ValidateFlowJsonResponse {
    valid: boolean;
    success: boolean;
    validation_errors?: FlowValidationError[];
}

/**
 * WhatsApp Flow Endpoint - Encrypted Request Payload
 * Represents the raw encrypted data received from WhatsApp
 */
export interface FlowEncryptedRequestPayload {
    encrypted_aes_key: string;
    encrypted_flow_data: string;
    initial_vector: string;
}

/**
 * WhatsApp Flow Endpoint - Decrypted Request Response
 * Represents the successfully decrypted data and encryption keys
 */
export interface FlowDecryptedRequestResponse {
    decryptedBody: any;
    aesKeyBuffer: Buffer;
    initialVectorBuffer: Buffer;
}

/**
 * WhatsApp Flow Endpoint - HTTP Request with Body
 * Represents an HTTP request with the encrypted payload
 */
export interface FlowHttpRequest extends IncomingMessage {
    body: FlowEncryptedRequestPayload;
    headers: IncomingHttpHeaders;
}

/**
 * WhatsApp Flow Endpoint - Health Check Request
 * Represents the structure of a health check request
 */
export interface FlowHealthCheckRequest {
    action: 'ping';
    version: '3.0';
}

/**
 * WhatsApp Flow Endpoint - Health Check Response
 * The expected response structure for health check requests
 */
export interface FlowHealthCheckResponse {
    data: {
        status: 'active';
    };
}

/**
 * WhatsApp Flow Endpoint - Data Exchange Request
 * Represents the structure of a data exchange request
 */
export interface FlowDataExchangeRequest {
    version: '3.0';
    action: FlowActionEnum;
    screen: string;
    flow_token: string;
    data?: Record<string, any> & { error_message?: string };
}

/**
 * WhatsApp Flow Endpoint - Data Exchange Response
 * The expected response structure for data exchange requests
 */
export interface FlowDataExchangeResponse {
    screen?: string;
    data?: Record<string, any | { error_message?: string }>;
}

/**
 * WhatsApp Flow Endpoint - Success Screen Response
 * The expected response structure for success screen requests
 */
export interface FlowSuccessScreenResponse {
    screen: 'SUCCESS';
    data: {
        extension_message_response?: {
            params?: {
                flow_token: string;
                [key: string]: string;
            };
        };
    };
}

/**
 * WhatsApp Flow Endpoint - Error Notification Request
 * Represents the structure of an error notification request
 */
export interface FlowErrorNotificationRequest {
    version: '3.0';
    action: Exclude<FlowActionEnum, FlowActionEnum.BACK>;
    screen: string;
    flow_token: string;
    data: {
        error: string;
        error_message: string;
    };
}

/**
 * WhatsApp Flow Endpoint - Error Notification Response
 * The expected response structure for error notification requests
 */
export interface FlowErrorNotificationResponse {
    acknowledged: boolean;
}

/**
 * WhatsApp Flow Endpoint - Comprehensive Request Object
 * A combined type that includes all possible fields from different request types
 * with all fields being optional for flexibility
 */
export interface FlowEndpointRequest {
    // Common fields
    version?: '3.0';
    action?: 'ping' | FlowActionEnum;

    screen?: string;
    flow_token?: string;

    data?: Record<string, any> & {
        error_key?: string;
        error_message?: string;
    };
}

/**
 * WhatsApp Flow Endpoint - Response
 * Union type for all possible response types from a Flow endpoint
 */
export type FlowEndpointResponse =
    | FlowHealthCheckResponse
    | FlowDataExchangeResponse
    | FlowErrorNotificationResponse
    | FlowSuccessScreenResponse;

export interface FlowClass {
    /**
     * List Flows
     *
     * @param wabaId - The WABA ID
     * @returns Promise with the list of flows
     */
    listFlows(wabaId: string): Promise<FlowsListResponse>;

    /**
     * Create Flow
     *
     * @param wabaId - The WABA ID
     * @param data - The flow data including name, categories, endpoint_uri, and optional clone_flow_id
     * @returns Promise with the created flow ID
     */
    createFlow(
        wabaId: string,
        data: {
            name: string;
            categories?: FlowCategoryEnum[];
            endpoint_uri?: string;
            clone_flow_id?: string;
            flow_json?: string;
            publish?: boolean;
        },
    ): Promise<CreateFlowResponse>;

    /**
     * Get Flow
     *
     * @param flowId - The flow ID
     * @param fields - Optional fields to return
     * @param dateFormat - Optional date format
     * @returns Promise with the flow details
     */
    getFlow(flowId: string, fields?: string, dateFormat?: string): Promise<Flow | FlowPreviewResponse>;

    /**
     * Update Flow Metadata
     *
     * @param flowId - The flow ID
     * @param data - The flow metadata to update
     * @returns Promise with the success status
     */
    updateFlowMetadata(
        flowId: string,
        data: {
            name?: string;
            categories?: FlowCategoryEnum[];
            endpoint_uri?: string;
            application_id?: string;
        },
    ): Promise<ResponseSuccess>;

    /**
     * Delete Flow
     *
     * @param flowId - The flow ID
     * @returns Promise with the success status
     */
    deleteFlow(flowId: string): Promise<ResponseSuccess>;

    /**
     * List Assets (Get Flow JSON URL)
     *
     * @param flowId - The flow ID
     * @returns Promise with the list of assets
     */
    listAssets(flowId: string): Promise<FlowAssetsResponse>;

    /**
     * Update Flow JSON
     *
     * @param flowId - The flow ID
     * @param data - The asset data including asset_type, file, and name
     * @returns Promise with the success status and validation errors
     */
    updateFlowJson(
        flowId: string,
        data: {
            asset_type: 'FLOW_JSON';
            file: Blob;
            name: string;
        },
    ): Promise<UpdateFlowResponse>;

    /**
     * Validate Flow JSON by attempting an update without publishing.
     * This is a convenience method; the API doesn't have a dedicated validation endpoint.
     *
     * @param flowId - The ID of the Flow (must exist, can be in DRAFT status).
     * @param flowJsonData - The Flow JSON content as a Buffer, JSON object, or Blob.
     * @returns Promise indicating if the JSON is valid and includes validation errors if any.
     */
    validateFlowJson(flowId: string, flowJsonData: Blob | Buffer | object): Promise<ValidateFlowJsonResponse>;

    /**
     * Publish Flow
     *
     * @param flowId - The flow ID
     * @returns Promise with the success status
     */
    publishFlow(flowId: string): Promise<ResponseSuccess>;

    /**
     * Deprecate Flow
     *
     * @param flowId - The flow ID
     * @returns Promise with the success status
     */
    deprecateFlow(flowId: string): Promise<ResponseSuccess>;

    /**
     * Migrate Flows
     *
     * @param wabaId - The destination WABA ID
     * @param data - The migration data including source_waba_id and optional source_flow_names
     * @returns Promise with migration results
     */
    migrateFlows(
        wabaId: string,
        data: {
            source_waba_id: string;
            source_flow_names?: string[];
        },
    ): Promise<FlowMigrationResponse>;
}
