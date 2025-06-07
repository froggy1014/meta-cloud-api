import { BaseAPI } from '../../shared/types/base';
import type { WabaConfigType } from '../../shared/types/config';
import { HttpMethodsEnum, WabaConfigEnum } from '../../shared/types/enums';
import type { RequesterClass, ResponseSuccess } from '../../shared/types/request';
import Logger from '../../shared/utils/logger';

import type * as flow from './types';

const LIB_NAME = 'FlowAPI';
const LOG_LOCAL = false;
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true' || LOG_LOCAL);

/**
 * API for managing WhatsApp Flows.
 *
 * This API allows you to:
 * - List flows
 * - Create flows
 * - Get flow details and previews
 * - Update flow metadata and JSON
 * - Delete flows
 * - Publish and deprecate flows
 * - Migrate flows between WABAs
 * - Validate flow JSON
 */
export default class FlowApi extends BaseAPI implements flow.FlowClass {
    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
        LOGGER.log('FlowAPI initialized');
    }

    /**
     * List Flows
     *
     * @param wabaId - The WABA ID
     * @returns Promise with the list of flows
     */
    async listFlows(wabaId: string): Promise<flow.FlowsListResponse> {
        return this.sendJson(HttpMethodsEnum.Get, `/${wabaId}/flows`, this.config[WabaConfigEnum.RequestTimeout], null);
    }

    /**
     * Create Flow
     *
     * @param wabaId - The WABA ID
     * @param data - The flow data including name, categories, endpoint_uri, and optional clone_flow_id
     * @returns Promise with the created flow ID and validation errors if any
     */
    async createFlow(
        wabaId: string,
        data: {
            name: string;
            categories?: flow.FlowCategoryEnum[];
            endpoint_uri?: string;
            clone_flow_id?: string;
            flow_json?: string; // Flow JSON as a string
            publish?: boolean;
        },
    ): Promise<flow.CreateFlowResponse> {
        // The API expects application/json for this endpoint based on documentation examples
        // Let's ensure we send JSON, not FormData, unless specifically required by an endpoint variation.
        const payload = {
            name: data.name,
            categories: data.categories,
            ...(data.endpoint_uri && { endpoint_uri: data.endpoint_uri }),
            ...(data.clone_flow_id && { clone_flow_id: data.clone_flow_id }),
            ...(data.flow_json && { flow_json: data.flow_json }),
            ...(data.publish !== undefined && { publish: data.publish }),
        };

        return this.sendJson(
            HttpMethodsEnum.Post,
            `/${wabaId}/flows`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(payload), // Send as JSON
        );
    }

    /**
     * Get Flow details
     *
     * @param flowId - The flow ID
     * @param fields - Optional fields to return (e.g., 'name,status,preview.invalidate(false)')
     * @param dateFormat - Optional date format
     * @returns Promise with the flow details or preview response
     */
    async getFlow(flowId: string, fields?: string, dateFormat?: string): Promise<flow.Flow | flow.FlowPreviewResponse> {
        const params = new URLSearchParams();
        if (fields) params.append('fields', fields);
        if (dateFormat) params.append('date_format', dateFormat);

        const queryString = params.toString() ? `?${params.toString()}` : '';
        return this.sendJson(
            HttpMethodsEnum.Get,
            `/${flowId}${queryString}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    /**
     * Get Flow Preview URL
     *
     * @param flowId - The flow ID
     * @param invalidate - Optional. If true, invalidates existing preview and generates a new one. Defaults to false.
     * @returns Promise with the flow preview details
     */
    async getFlowPreview(flowId: string, invalidate: boolean = false): Promise<flow.FlowPreviewResponse> {
        const fields = `preview.invalidate(${invalidate})`;
        // Type assertion needed as getFlow can return Flow or FlowPreviewResponse
        return this.getFlow(flowId, fields) as Promise<flow.FlowPreviewResponse>;
    }

    /**
     * Update Flow Metadata
     *
     * @param flowId - The flow ID
     * @param data - The flow metadata to update (name, categories, endpoint_uri, application_id)
     * @returns Promise with the success status
     */
    async updateFlowMetadata(
        flowId: string,
        data: {
            name?: string;
            categories?: flow.FlowCategoryEnum[];
            endpoint_uri?: string;
            application_id?: string;
        },
    ): Promise<ResponseSuccess> {
        // The API expects application/json for this endpoint based on documentation examples
        const payload = {
            ...(data.name && { name: data.name }),
            ...(data.categories && { categories: data.categories }),
            ...(data.endpoint_uri && { endpoint_uri: data.endpoint_uri }),
            ...(data.application_id && { application_id: data.application_id }),
        };

        return this.sendJson(
            HttpMethodsEnum.Post,
            `/${flowId}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(payload), // Send as JSON
        );
    }

    /**
     * Delete Flow (only works if the Flow is in DRAFT status)
     *
     * @param flowId - The flow ID
     * @returns Promise with the success status
     */
    async deleteFlow(flowId: string): Promise<ResponseSuccess> {
        return this.sendJson(HttpMethodsEnum.Delete, `/${flowId}`, this.config[WabaConfigEnum.RequestTimeout], null);
    }

    /**
     * List Assets (e.g., get Flow JSON download URL)
     *
     * @param flowId - The flow ID
     * @returns Promise with the list of assets
     */
    async listAssets(flowId: string): Promise<flow.FlowAssetsResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `/${flowId}/assets`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    /**
     * Update Flow JSON by uploading a file, buffer, JSON object, or Blob.
     *
     * @param flowId - The flow ID
     * @param data - Object containing the file data and optional name.
     * @param data.file - The Flow JSON content as a Buffer, JSON object, or Blob.
     * @param data.name - Optional name for the asset, defaults to 'flow.json'.
     * @returns Promise with the success status and validation errors, if any.
     */
    async updateFlowJson(
        flowId: string,
        data: {
            file: Blob | Buffer | object; // JSON object, Buffer, or Blob
            name?: string; // Default to "flow.json"
        },
    ): Promise<flow.UpdateFlowResponse> {
        const formData = new FormData();
        let fileContent: Blob;

        // Handle different input types for the file
        if (data.file instanceof Buffer) {
            // Buffer
            // Create a Blob from the Buffer and cast it to the global Blob type
            fileContent = new globalThis.Blob([data.file]);
            formData.append('file', fileContent as unknown as Blob);
        } else if (typeof data.file === 'object' && !(data.file instanceof Blob)) {
            // JSON object - stringify and create Blob
            try {
                // Create a Blob from the JSON string and cast it to the global Blob type
                fileContent = new globalThis.Blob([JSON.stringify(data.file, null, 2)], { type: 'application/json' });
                formData.append('file', fileContent as unknown as Blob);
            } catch (e) {
                throw new Error('Failed to stringify JSON object for Flow JSON update.');
            }
        } else if (data.file instanceof Blob) {
            // Blob (already in correct format)
            fileContent = data.file;
            formData.append('file', fileContent as unknown as Blob);
        } else {
            throw new Error('Invalid file type provided for Flow JSON update. Must be a Buffer, JSON object, or Blob.');
        }

        formData.append('asset_type', 'FLOW_JSON'); // Required by API
        formData.append('name', data.name || 'flow.json'); // Required by API

        return this.sendFormData(
            HttpMethodsEnum.Post,
            `/${flowId}/assets`,
            this.config[WabaConfigEnum.RequestTimeout],
            formData,
        );
    }

    /**
     * Validate Flow JSON by attempting an update without publishing.
     * This is a convenience method; the API doesn't have a dedicated validation endpoint.
     *
     * @param flowId - The ID of the Flow (must exist, can be in DRAFT status).
     * @param flowJsonData - The Flow JSON content as a file path (string), Buffer, JSON object, or Blob.
     * @returns Promise indicating if the JSON is valid and includes validation errors if any.
     */
    async validateFlowJson(
        flowId: string,
        flowJsonData: Blob | Buffer | object,
    ): Promise<flow.ValidateFlowJsonResponse> {
        try {
            const result = await this.updateFlowJson(flowId, {
                file: flowJsonData,
            });

            const isValid = !result.validation_errors || result.validation_errors.length === 0;

            const enhancedResponse = {
                ...result,
                valid: isValid,
            };

            return enhancedResponse;
        } catch (error) {
            LOGGER.error('Error during Flow JSON validation attempt:', error);
            throw error;
        }
    }

    /**
     * Publish Flow
     *
     * @param flowId - The flow ID
     * @returns Promise with the success status
     */
    async publishFlow(flowId: string): Promise<ResponseSuccess> {
        // This endpoint expects an empty JSON body or no body
        return this.sendJson(
            HttpMethodsEnum.Post,
            `/${flowId}/publish`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify({}), // Send empty JSON object
        );
    }

    /**
     * Deprecate Flow
     *
     * @param flowId - The flow ID
     * @returns Promise with the success status
     */
    async deprecateFlow(flowId: string): Promise<ResponseSuccess> {
        // This endpoint expects an empty JSON body or no body
        return this.sendJson(
            HttpMethodsEnum.Post,
            `/${flowId}/deprecate`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify({}), // Send empty JSON object
        );
    }

    /**
     * Migrate Flows between WABAs
     *
     * @param destinationWabaId - The destination WABA ID
     * @param data - The migration data including source_waba_id and optional source_flow_names
     * @returns Promise with migration results (successes and failures)
     */
    async migrateFlows(
        destinationWabaId: string,
        data: {
            source_waba_id: string;
            source_flow_names?: string[];
        },
    ): Promise<flow.FlowMigrationResponse> {
        // API documentation suggests this endpoint might expect application/json
        // Let's double-check or assume JSON based on typical Graph API patterns unless FormData is confirmed.
        // Assuming JSON for now:
        const payload = {
            source_waba_id: data.source_waba_id,
            ...(data.source_flow_names && { source_flow_names: data.source_flow_names }),
        };

        return this.sendJson(
            HttpMethodsEnum.Post,
            `/${destinationWabaId}/migrate_flows`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(payload),
        );
    }
}
