import { WabaConfigType } from '../types/config';
import { HttpMethodsEnum, WabaConfigEnum } from '../types/enums';
import {
    Flow,
    FlowAssetsResponse,
    FlowCategoryEnum,
    FlowClass,
    FlowMigrationResponse,
    FlowPreviewResponse,
    FlowsListResponse,
    FlowValidationError,
} from '../types/flow';
import { RequesterClass, RequesterResponseInterface, ResponseSuccess } from '../types/request';
import Logger from '../utils/logger';
import BaseAPI from './base';

const LIB_NAME = 'FlowAPI';
const LOG_LOCAL = false;
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true' || LOG_LOCAL);

export default class FlowAPI extends BaseAPI implements FlowClass {
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
    async listFlows(wabaId: string): Promise<RequesterResponseInterface<FlowsListResponse>> {
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
            categories?: FlowCategoryEnum[];
            endpoint_uri?: string;
            clone_flow_id?: string;
            flow_json?: string; // Flow JSON as a string
            publish?: boolean;
        },
    ): Promise<
        RequesterResponseInterface<{ id: string; success: boolean; validation_errors?: FlowValidationError[] }>
    > {
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
    async getFlow(
        flowId: string,
        fields?: string,
        dateFormat?: string,
    ): Promise<RequesterResponseInterface<Flow | FlowPreviewResponse>> {
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
    async getFlowPreview(
        flowId: string,
        invalidate: boolean = false,
    ): Promise<RequesterResponseInterface<FlowPreviewResponse>> {
        const fields = `preview.invalidate(${invalidate})`;
        // Type assertion needed as getFlow can return Flow or FlowPreviewResponse
        return this.getFlow(flowId, fields) as Promise<RequesterResponseInterface<FlowPreviewResponse>>;
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
            categories?: FlowCategoryEnum[];
            endpoint_uri?: string;
            application_id?: string;
        },
    ): Promise<RequesterResponseInterface<ResponseSuccess>> {
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
    async deleteFlow(flowId: string): Promise<RequesterResponseInterface<ResponseSuccess>> {
        return this.sendJson(HttpMethodsEnum.Delete, `/${flowId}`, this.config[WabaConfigEnum.RequestTimeout], null);
    }

    /**
     * List Assets (e.g., get Flow JSON download URL)
     *
     * @param flowId - The flow ID
     * @returns Promise with the list of assets
     */
    async listAssets(flowId: string): Promise<RequesterResponseInterface<FlowAssetsResponse>> {
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
    ): Promise<RequesterResponseInterface<{ success: boolean; validation_errors?: FlowValidationError[] }>> {
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

        // The underlying.sendJson needs to correctly handle FormData
        // It might need specific headers like `Content-Type: multipart/form-data; boundary=...`
        // which FormData library usually helps generate.
        // Assuming.sendJson handles FormData correctly:
        return this.sendJson(
            HttpMethodsEnum.Post,
            `/${flowId}/assets`,
            this.config[WabaConfigEnum.RequestTimeout],
            formData, // Pass FormData directly
            // Headers might be set automatically by the client when FormData is detected,
            // or might need to be explicitly set depending on the client implementation.
            // e.g., { 'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}` }
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
    ): Promise<
        RequesterResponseInterface<{ valid: boolean; success: boolean; validation_errors?: FlowValidationError[] }>
    > {
        try {
            // Attempt to update the Flow JSON. The API response includes validation errors.
            const result = await this.updateFlowJson(flowId, {
                file: flowJsonData,
            });

            // Get the response data
            const responseData = await result.json();

            const isValid = !responseData.validation_errors || responseData.validation_errors.length === 0;

            // Create a new response with the 'valid' flag
            const enhancedResponse = {
                ...responseData,
                valid: isValid,
            };

            // Return a new RequesterResponseInterface with the enhanced data
            return {
                json: async () => enhancedResponse,
            };
        } catch (error) {
            // If the update itself fails (e.g., network error, auth error), rethrow.
            // Specific API validation errors are handled within the 'result' above.
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
    async publishFlow(flowId: string): Promise<RequesterResponseInterface<ResponseSuccess>> {
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
    async deprecateFlow(flowId: string): Promise<RequesterResponseInterface<ResponseSuccess>> {
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
    ): Promise<RequesterResponseInterface<FlowMigrationResponse>> {
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
