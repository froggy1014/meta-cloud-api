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
     * @returns Promise with the created flow ID
     */
    async createFlow(
        wabaId: string,
        data: {
            name: string;
            categories?: FlowCategoryEnum[];
            endpoint_uri?: string;
            clone_flow_id?: string;
            flow_json?: string;
            publish?: boolean;
        },
    ): Promise<
        RequesterResponseInterface<{ id: string; success: boolean; validation_errors?: FlowValidationError[] }>
    > {
        const formData = new FormData();

        if (data.name) formData.append('name', data.name);
        if (data.categories) formData.append('categories', JSON.stringify(data.categories));
        if (data.endpoint_uri) formData.append('endpoint_uri', data.endpoint_uri);
        if (data.clone_flow_id) formData.append('clone_flow_id', data.clone_flow_id);
        if (data.flow_json) formData.append('flow_json', data.flow_json);
        if (data.publish !== undefined) formData.append('publish', String(data.publish));

        return this.sendJson(
            HttpMethodsEnum.Post,
            `/${wabaId}/flows`,
            this.config[WabaConfigEnum.RequestTimeout],
            formData,
        );
    }

    /**
     * Get Flow
     *
     * @param flowId - The flow ID
     * @param fields - Optional fields to return
     * @param dateFormat - Optional date format
     * @returns Promise with the flow details
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
     * Update Flow Metadata
     *
     * @param flowId - The flow ID
     * @param data - The flow metadata to update
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
        const formData = new FormData();

        if (data.name) formData.append('name', data.name);
        if (data.categories) formData.append('categories', JSON.stringify(data.categories));
        if (data.endpoint_uri) formData.append('endpoint_uri', data.endpoint_uri);
        if (data.application_id) formData.append('application_id', data.application_id);

        return this.sendJson(HttpMethodsEnum.Post, `/${flowId}`, this.config[WabaConfigEnum.RequestTimeout], formData);
    }

    /**
     * Delete Flow
     *
     * @param flowId - The flow ID
     * @returns Promise with the success status
     */
    async deleteFlow(flowId: string): Promise<RequesterResponseInterface<ResponseSuccess>> {
        return this.sendJson(HttpMethodsEnum.Delete, `/${flowId}`, this.config[WabaConfigEnum.RequestTimeout], null);
    }

    /**
     * List Assets (Get Flow JSON URL)
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
     * Update Flow JSON
     *
     * @param flowId - The flow ID
     * @param data - The asset data including asset_type, file, and name
     * @returns Promise with the success status and validation errors
     */
    async updateFlowJson(
        flowId: string,
        data: {
            asset_type: 'FLOW_JSON';
            file: Blob;
            name: string;
        },
    ): Promise<RequesterResponseInterface<{ success: boolean; validation_errors?: FlowValidationError[] }>> {
        const formData = new FormData();

        formData.append('asset_type', data.asset_type);
        formData.append('file', data.file);
        formData.append('name', data.name);

        return this.sendJson(
            HttpMethodsEnum.Post,
            `/${flowId}/assets`,
            this.config[WabaConfigEnum.RequestTimeout],
            formData,
        );
    }

    /**
     * Publish Flow
     *
     * @param flowId - The flow ID
     * @returns Promise with the success status
     */
    async publishFlow(flowId: string): Promise<RequesterResponseInterface<ResponseSuccess>> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `/${flowId}/publish`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify({}),
        );
    }

    /**
     * Deprecate Flow
     *
     * @param flowId - The flow ID
     * @returns Promise with the success status
     */
    async deprecateFlow(flowId: string): Promise<RequesterResponseInterface<ResponseSuccess>> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `/${flowId}/deprecate`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify({}),
        );
    }

    /**
     * Migrate Flows
     *
     * @param wabaId - The destination WABA ID
     * @param data - The migration data including source_waba_id and optional source_flow_names
     * @returns Promise with migration results
     */
    async migrateFlows(
        wabaId: string,
        data: {
            source_waba_id: string;
            source_flow_names?: string[];
        },
    ): Promise<RequesterResponseInterface<FlowMigrationResponse>> {
        const formData = new FormData();

        formData.append('source_waba_id', data.source_waba_id);
        if (data.source_flow_names) {
            formData.append('source_flow_names', JSON.stringify(data.source_flow_names));
        }

        return this.sendJson(
            HttpMethodsEnum.Post,
            `/${wabaId}/migrate_flows`,
            this.config[WabaConfigEnum.RequestTimeout],
            formData,
        );
    }
}
