// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/flows/

// Endpoints:
// - GET /{WABA_ID}/flows
// - POST /{WABA_ID}/flows
// - GET /{FLOW_ID}?fields&date_format
// - POST /{FLOW_ID}
// - DELETE /{FLOW_ID}
// - GET /{FLOW_ID}/assets
// - POST /{FLOW_ID}/assets
// - POST /{FLOW_ID}/publish
// - POST /{FLOW_ID}/deprecate
// - POST /{DESTINATION_WABA_ID}/migrate_flows

import { BaseAPI } from '../../types/base';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import type { ResponseSuccess } from '../../types/request';

import type * as flow from './types';

/**
 * API for managing WhatsApp Flows.
 *
 * WhatsApp Flows allow businesses to build structured, interactive experiences
 * within WhatsApp conversations. Flows can be used for appointment booking,
 * lead generation, customer support, surveys, and more.
 *
 * This API allows you to:
 * - List flows for a WhatsApp Business Account (`GET /{WABA_ID}/flows`)
 * - Create new flows (`POST /{WABA_ID}/flows`)
 * - Get flow details and previews (`GET /{FLOW_ID}`)
 * - Update flow metadata (`POST /{FLOW_ID}`)
 * - Delete draft flows (`DELETE /{FLOW_ID}`)
 * - List flow assets / download Flow JSON (`GET /{FLOW_ID}/assets`)
 * - Upload or update Flow JSON (`POST /{FLOW_ID}/assets`)
 * - Publish flows (`POST /{FLOW_ID}/publish`)
 * - Deprecate flows (`POST /{FLOW_ID}/deprecate`)
 * - Migrate flows between WABAs (`POST /{DESTINATION_WABA_ID}/migrate_flows`)
 *
 * @see {@link https://developers.facebook.com/docs/whatsapp/flows/reference/flowsapi | Flows API Reference}
 * @see {@link https://developers.facebook.com/documentation/business-messaging/whatsapp/flows/ | WhatsApp Flows Documentation}
 */
export default class FlowApi extends BaseAPI implements flow.FlowClass {
    /**
     * List all flows belonging to a WhatsApp Business Account.
     *
     * Retrieves a paginated list of all flows associated with the given WABA ID,
     * including their IDs, names, statuses, and categories.
     *
     * @param wabaId - The WhatsApp Business Account ID to list flows for.
     * @returns A promise that resolves with the list of flows and pagination info.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/flows/reference/flowsapi#list | List Flows}
     *
     * @example
     * ```ts
     * const response = await whatsappClient.flow.listFlows('WABA_ID');
     * for (const flow of response.data) {
     *     console.log(flow.id, flow.name, flow.status);
     * }
     * ```
     */
    async listFlows(wabaId: string): Promise<flow.FlowsListResponse> {
        return this.sendJson(HttpMethodsEnum.Get, `/${wabaId}/flows`, this.config[WabaConfigEnum.RequestTimeout], null);
    }

    /**
     * Create a new flow for a WhatsApp Business Account.
     *
     * Creates a new flow in DRAFT status. You can optionally clone an existing flow,
     * provide initial Flow JSON, and even publish the flow immediately upon creation.
     *
     * @param wabaId - The WhatsApp Business Account ID to create the flow under.
     * @param data - The flow creation parameters.
     * @param data.name - The name of the flow.
     * @param data.categories - Optional array of flow categories (e.g., LEAD_GENERATION, APPOINTMENT_BOOKING).
     * @param data.endpoint_uri - Optional URI for the flow endpoint that will receive flow action payloads.
     * @param data.clone_flow_id - Optional ID of an existing flow to clone.
     * @param data.flow_json - Optional Flow JSON definition as a string.
     * @param data.publish - Optional flag to publish the flow immediately after creation.
     * @returns A promise that resolves with the created flow ID and any validation errors.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/flows/reference/flowsapi#create | Create Flow}
     *
     * @example
     * ```ts
     * const result = await whatsappClient.flow.createFlow('WABA_ID', {
     *     name: 'Appointment Booking',
     *     categories: ['APPOINTMENT_BOOKING'],
     *     endpoint_uri: 'https://example.com/flow-endpoint',
     * });
     * console.log(result.id); // New flow ID
     * ```
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
     * Get details of a specific flow.
     *
     * Retrieves flow information such as name, status, categories, JSON validation errors,
     * and optionally a preview URL. Use the `fields` parameter to request specific fields
     * or the preview endpoint.
     *
     * @param flowId - The ID of the flow to retrieve.
     * @param fields - Optional comma-separated list of fields to return (e.g., `'name,status,preview.invalidate(false)'`).
     * @param dateFormat - Optional date format string for date fields in the response.
     * @returns A promise that resolves with the flow details or preview response.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/flows/reference/flowsapi#details | Get Flow Details}
     *
     * @example
     * ```ts
     * // Get all flow details
     * const flow = await whatsappClient.flow.getFlow('FLOW_ID');
     * console.log(flow.name, flow.status);
     *
     * // Get specific fields only
     * const flow = await whatsappClient.flow.getFlow('FLOW_ID', 'name,status,categories');
     * ```
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
     * Get a preview URL for a flow.
     *
     * Generates a shareable preview URL that allows viewing the flow without publishing it.
     * The preview can optionally be invalidated to force generation of a fresh URL.
     *
     * @param flowId - The ID of the flow to preview.
     * @param invalidate - If `true`, invalidates the existing preview and generates a new one. Defaults to `false`.
     * @returns A promise that resolves with the flow preview details including the preview URL.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/flows/reference/flowsapi#details | Get Flow Preview}
     *
     * @example
     * ```ts
     * // Get existing preview URL
     * const preview = await whatsappClient.flow.getFlowPreview('FLOW_ID');
     * console.log(preview.preview.preview_url);
     *
     * // Force a new preview URL
     * const freshPreview = await whatsappClient.flow.getFlowPreview('FLOW_ID', true);
     * ```
     */
    async getFlowPreview(flowId: string, invalidate: boolean = false): Promise<flow.FlowPreviewResponse> {
        const fields = `preview.invalidate(${invalidate})`;
        // Type assertion needed as getFlow can return Flow or FlowPreviewResponse
        return this.getFlow(flowId, fields) as Promise<flow.FlowPreviewResponse>;
    }

    /**
     * Update the metadata of an existing flow.
     *
     * Allows updating a flow's name, categories, endpoint URI, or associated application ID.
     * The flow must be in DRAFT status to update certain fields.
     *
     * @param flowId - The ID of the flow to update.
     * @param data - The metadata fields to update.
     * @param data.name - Optional new name for the flow.
     * @param data.categories - Optional new categories for the flow.
     * @param data.endpoint_uri - Optional new endpoint URI for flow action payloads.
     * @param data.application_id - Optional application ID to associate with the flow.
     * @returns A promise that resolves with a success indicator.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/flows/reference/flowsapi#update | Update Flow}
     *
     * @example
     * ```ts
     * await whatsappClient.flow.updateFlowMetadata('FLOW_ID', {
     *     name: 'Updated Flow Name',
     *     endpoint_uri: 'https://example.com/new-endpoint',
     * });
     * ```
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
     * Delete a flow.
     *
     * Permanently deletes a flow. Only flows in DRAFT status can be deleted.
     * Published or deprecated flows cannot be deleted.
     *
     * @param flowId - The ID of the flow to delete.
     * @returns A promise that resolves with a success indicator.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/flows/reference/flowsapi#delete | Delete Flow}
     *
     * @example
     * ```ts
     * await whatsappClient.flow.deleteFlow('FLOW_ID');
     * ```
     */
    async deleteFlow(flowId: string): Promise<ResponseSuccess> {
        return this.sendJson(HttpMethodsEnum.Delete, `/${flowId}`, this.config[WabaConfigEnum.RequestTimeout], null);
    }

    /**
     * List assets associated with a flow.
     *
     * Retrieves the list of assets (e.g., Flow JSON) associated with the flow.
     * The response includes download URLs for each asset.
     *
     * @param flowId - The ID of the flow to list assets for.
     * @returns A promise that resolves with the list of assets including download URLs.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/flows/reference/flowsapi#asset-list | List Flow Assets}
     *
     * @example
     * ```ts
     * const assets = await whatsappClient.flow.listAssets('FLOW_ID');
     * for (const asset of assets.data) {
     *     console.log(asset.name, asset.download_url);
     * }
     * ```
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
     * Upload or update the Flow JSON for a flow.
     *
     * Uploads a Flow JSON definition to the flow's assets. The JSON defines the screens,
     * layout, and logic of the flow. Accepts a Buffer, plain JSON object, or Blob.
     *
     * @param flowId - The ID of the flow to update.
     * @param data - Object containing the file data and optional name.
     * @param data.file - The Flow JSON content as a Buffer, JSON object, or Blob.
     * @param data.name - Optional name for the asset. Defaults to `'flow.json'`.
     * @returns A promise that resolves with the upload status and any validation errors.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/flows/reference/flowsapi#asset-upload | Upload Flow JSON}
     *
     * @example
     * ```ts
     * // Upload from a JSON object
     * const result = await whatsappClient.flow.updateFlowJson('FLOW_ID', {
     *     file: {
     *         version: '5.0',
     *         screens: [{ id: 'WELCOME', layout: { type: 'SingleColumnLayout', children: [] } }],
     *     },
     * });
     *
     * // Upload from a Buffer
     * const jsonBuffer = Buffer.from(JSON.stringify(flowDefinition));
     * await whatsappClient.flow.updateFlowJson('FLOW_ID', { file: jsonBuffer });
     * ```
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
            // Buffer - convert to Uint8Array for BlobPart compatibility
            fileContent = new globalThis.Blob([new Uint8Array(data.file)]);
            formData.append('file', fileContent as unknown as Blob);
        } else if (typeof data.file === 'object' && !(data.file instanceof Blob)) {
            // JSON object - stringify and create Blob
            try {
                // Create a Blob from the JSON string and cast it to the global Blob type
                fileContent = new globalThis.Blob([JSON.stringify(data.file, null, 2)], { type: 'application/json' });
                formData.append('file', fileContent as unknown as Blob);
            } catch (_e) {
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
     * Validate Flow JSON without publishing.
     *
     * This is a convenience method that uploads the Flow JSON and checks for validation
     * errors. The API does not have a dedicated validation endpoint, so this method
     * performs an update and inspects the response for errors.
     *
     * @param flowId - The ID of the flow to validate against (must exist, can be in DRAFT status).
     * @param flowJsonData - The Flow JSON content as a Buffer, JSON object, or Blob.
     * @returns A promise that resolves with validation results, including a `valid` boolean
     *          and any `validation_errors` found.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/flows/reference/flowsapi#asset-upload | Upload Flow JSON (validation)}
     *
     * @example
     * ```ts
     * const result = await whatsappClient.flow.validateFlowJson('FLOW_ID', {
     *     version: '5.0',
     *     screens: [{ id: 'WELCOME', layout: { type: 'SingleColumnLayout', children: [] } }],
     * });
     * if (result.valid) {
     *     console.log('Flow JSON is valid');
     * } else {
     *     console.error('Validation errors:', result.validation_errors);
     * }
     * ```
     */
    async validateFlowJson(
        flowId: string,
        flowJsonData: Blob | Buffer | object,
    ): Promise<flow.ValidateFlowJsonResponse> {
        const result = await this.updateFlowJson(flowId, {
            file: flowJsonData,
        });

        const isValid = !result.validation_errors || result.validation_errors.length === 0;

        const enhancedResponse = {
            ...result,
            valid: isValid,
        };

        return enhancedResponse;
    }

    /**
     * Publish a flow.
     *
     * Transitions a flow from DRAFT status to PUBLISHED. Once published, the flow
     * can be sent to users in WhatsApp messages. A published flow's JSON can no longer
     * be updated.
     *
     * @param flowId - The ID of the flow to publish.
     * @returns A promise that resolves with a success indicator.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/flows/reference/flowsapi#publish | Publish Flow}
     *
     * @example
     * ```ts
     * await whatsappClient.flow.publishFlow('FLOW_ID');
     * ```
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
     * Deprecate a flow.
     *
     * Transitions a flow from PUBLISHED status to DEPRECATED. A deprecated flow
     * can no longer be sent to users but existing sessions will continue to work.
     * This action cannot be undone.
     *
     * @param flowId - The ID of the flow to deprecate.
     * @returns A promise that resolves with a success indicator.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/flows/reference/flowsapi#deprecate | Deprecate Flow}
     *
     * @example
     * ```ts
     * await whatsappClient.flow.deprecateFlow('FLOW_ID');
     * ```
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
     * Migrate flows between WhatsApp Business Accounts.
     *
     * Copies flows from a source WABA to a destination WABA. You can optionally
     * specify which flows to migrate by name. Migrated flows are created in DRAFT
     * status in the destination WABA.
     *
     * @param destinationWabaId - The ID of the destination WhatsApp Business Account.
     * @param data - The migration parameters.
     * @param data.source_waba_id - The ID of the source WhatsApp Business Account to migrate flows from.
     * @param data.source_flow_names - Optional array of flow names to migrate. If omitted, all flows are migrated.
     * @returns A promise that resolves with migration results including successes and failures.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/flows/reference/flowsapi#migrate | Migrate Flows}
     *
     * @example
     * ```ts
     * // Migrate all flows from one WABA to another
     * const result = await whatsappClient.flow.migrateFlows('DEST_WABA_ID', {
     *     source_waba_id: 'SOURCE_WABA_ID',
     * });
     *
     * // Migrate specific flows by name
     * const result = await whatsappClient.flow.migrateFlows('DEST_WABA_ID', {
     *     source_waba_id: 'SOURCE_WABA_ID',
     *     source_flow_names: ['Appointment Booking', 'Lead Gen Form'],
     * });
     * console.log(result.migrated_flows, result.failed_flows);
     * ```
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
