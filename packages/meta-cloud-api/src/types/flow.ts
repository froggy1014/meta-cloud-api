/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { RequesterResponseInterface, ResponseSuccess } from './request';

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
 * Flow Migration Response
 */
export interface FlowMigrationResponse {
    migrated_flows: FlowMigrationResult[];
    failed_flows: FlowMigrationFailure[];
}

export interface FlowClass {
    /**
     * List Flows
     *
     * @param wabaId - The WABA ID
     * @returns Promise with the list of flows
     */
    listFlows(wabaId: string): Promise<RequesterResponseInterface<FlowsListResponse>>;

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
    ): Promise<RequesterResponseInterface<{ id: string; success: boolean; validation_errors?: FlowValidationError[] }>>;

    /**
     * Get Flow
     *
     * @param flowId - The flow ID
     * @param fields - Optional fields to return
     * @param dateFormat - Optional date format
     * @returns Promise with the flow details
     */
    getFlow(
        flowId: string,
        fields?: string,
        dateFormat?: string,
    ): Promise<RequesterResponseInterface<Flow | FlowPreviewResponse>>;

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
    ): Promise<RequesterResponseInterface<ResponseSuccess>>;

    /**
     * Delete Flow
     *
     * @param flowId - The flow ID
     * @returns Promise with the success status
     */
    deleteFlow(flowId: string): Promise<RequesterResponseInterface<ResponseSuccess>>;

    /**
     * List Assets (Get Flow JSON URL)
     *
     * @param flowId - The flow ID
     * @returns Promise with the list of assets
     */
    listAssets(flowId: string): Promise<RequesterResponseInterface<FlowAssetsResponse>>;

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
    ): Promise<RequesterResponseInterface<{ success: boolean; validation_errors?: FlowValidationError[] }>>;

    /**
     * Publish Flow
     *
     * @param flowId - The flow ID
     * @returns Promise with the success status
     */
    publishFlow(flowId: string): Promise<RequesterResponseInterface<ResponseSuccess>>;

    /**
     * Deprecate Flow
     *
     * @param flowId - The flow ID
     * @returns Promise with the success status
     */
    deprecateFlow(flowId: string): Promise<RequesterResponseInterface<ResponseSuccess>>;

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
    ): Promise<RequesterResponseInterface<FlowMigrationResponse>>;
}
