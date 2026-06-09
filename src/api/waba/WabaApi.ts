// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/whatsapp-business-accounts/

// Endpoints:
// - GET /{WABA_ID}?fields
// - POST /{WABA_ID}
// - GET /{WABA_ID}/activities
// - GET /{WABA_ID}/subscribed_apps
// - POST /{WABA_ID}/subscribed_apps
// - DELETE /{WABA_ID}/subscribed_apps
// - GET /{WABA_ID}/assigned_users
// - POST /{WABA_ID}/assigned_users
// - DELETE /{WABA_ID}/assigned_users
// - GET /{WABA_ID}/in_progress_onbehalf_request
// - GET /{OBO_MOBILITY_INTENT_ID}
// - POST /{WABA_ID}/obo_mobility_intent
// - POST /{WABA_ID}/set_obo_mobility_intent
// - GET /{WABA_ID}/schedules
// - POST /{WABA_ID}/schedules
// - GET /{WABA_BOT_ID}
// - GET /{WHATSAPP_BUSINESS_PROFILE_ID}
// - POST /{WHATSAPP_BUSINESS_PROFILE_ID}

import { BaseAPI } from '../../types/base';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import type { ResponseSuccess } from '../../types/request';
import { buildFieldsQueryString } from '../../utils/buildFieldsQueryString';
import { objectToQueryString } from '../../utils/objectToQueryString';

import type * as waba from './types';

/**
 * API for managing WhatsApp Business Account (WABA).
 *
 * This API allows you to:
 * - Get WABA account information
 * - Manage WABA subscriptions
 * - Subscribe/unsubscribe from WABA webhooks
 * - Update subscription settings
 *
 * Endpoints covered:
 * - `GET /{WABA_ID}` - Get WABA account information
 * - `GET /{WABA_ID}/subscribed_apps` - Get all WABA subscriptions
 * - `POST /{WABA_ID}/subscribed_apps` - Update/create a WABA subscription
 * - `DELETE /{WABA_ID}/subscribed_apps` - Unsubscribe from WABA webhooks
 *
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/whatsapp-business-accounts/
 */
export default class WabaApi extends BaseAPI implements waba.WABAClass {
    private toQuery(params?: waba.WabaListParams): string {
        if (!params) return '';

        const fields = Array.isArray(params.fields) ? params.fields.join(',') : params.fields;
        const filtering = Array.isArray(params.filtering) ? JSON.stringify(params.filtering) : params.filtering;

        return objectToQueryString({
            fields,
            filtering,
            sort: params.sort,
            limit: params.limit,
            after: params.after,
            before: params.before,
        });
    }

    private fieldsQuery(fields?: waba.WabaFieldsParam): string {
        const fieldsValue = Array.isArray(fields) ? fields.join(',') : fields;
        return fieldsValue ? objectToQueryString({ fields: fieldsValue }) : '';
    }

    /**
     * Retrieve WhatsApp Business Account information.
     *
     * @param fields - Optional array of specific fields to retrieve.
     * @returns WABA account information including status, health, verification status, etc.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/whatsapp-business-accounts/
     *
     * @example
     * const account = await whatsappClient.waba.getWabaAccount(['id', 'name', 'status']);
     */
    async getWabaAccount(fields?: waba.WabaAccountFieldsParam): Promise<waba.WabaAccount> {
        const queryString = buildFieldsQueryString(fields)?.replace(/,/g, '%2C');

        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.BusinessAcctId]}${queryString}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    /**
     * Update WABA account fields such as name or timezone.
     */
    async updateWabaAccount(params: waba.UpdateWabaAccountRequest): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.BusinessAcctId]}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(params),
        );
    }

    /**
     * Get account activity events for a WABA.
     */
    async getWabaActivities(params?: waba.WabaListParams): Promise<waba.WabaListResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/activities${this.toQuery(params)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    /**
     * Get all WABA subscriptions for the business account.
     *
     * @returns List of all subscribed apps and their configurations.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/whatsapp-business-accounts/
     *
     * @example
     * const subscriptions = await whatsappClient.waba.getAllWabaSubscriptions();
     */
    async getAllWabaSubscriptions(): Promise<waba.WabaSubscriptions> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/subscribed_apps`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    /**
     * Update WABA subscription configuration.
     *
     * @param params - Configuration parameters including callback URI and verify token.
     * @returns Response indicating success or failure.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/whatsapp-business-accounts/
     *
     * @example
     * await whatsappClient.waba.updateWabaSubscription({
     *   override_callback_uri: 'https://example.com/webhook',
     *   verify_token: 'your_verify_token'
     * });
     */
    async updateWabaSubscription({
        override_callback_uri,
        verify_token,
    }: waba.UpdateWabaSubscription): Promise<ResponseSuccess> {
        const body = {
            override_callback_uri,
            verify_token,
        };
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/subscribed_apps`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }

    /**
     * Unsubscribe from WABA webhooks.
     *
     * @returns Response indicating success or failure.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/whatsapp-business-accounts/
     *
     * @example
     * await whatsappClient.waba.unsubscribeFromWaba();
     */
    async unsubscribeFromWaba(): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Delete,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/subscribed_apps`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async getAssignedUsers(
        params?: waba.WabaListParams,
        wabaId: string = this.config[WabaConfigEnum.BusinessAcctId],
    ): Promise<waba.WabaListResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${wabaId}/assigned_users${this.toQuery(params)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async addAssignedUser(
        params: waba.AssignedUserRequest,
        wabaId: string = this.config[WabaConfigEnum.BusinessAcctId],
    ): Promise<ResponseSuccess> {
        const body = {
            user: params.user,
            ...(params.tasks ? { tasks: params.tasks } : {}),
        };

        return this.sendUrlEncodedForm(
            HttpMethodsEnum.Post,
            `${wabaId}/assigned_users`,
            this.config[WabaConfigEnum.RequestTimeout],
            body,
        );
    }

    async removeAssignedUser(
        params: waba.RemoveAssignedUserRequest,
        wabaId: string = this.config[WabaConfigEnum.BusinessAcctId],
    ): Promise<ResponseSuccess> {
        return this.sendUrlEncodedForm(
            HttpMethodsEnum.Delete,
            `${wabaId}/assigned_users`,
            this.config[WabaConfigEnum.RequestTimeout],
            { user: params.user },
        );
    }

    async getInProgressOnBehalfRequests(
        params?: waba.WabaListParams,
        wabaId: string = this.config[WabaConfigEnum.BusinessAcctId],
    ): Promise<waba.WabaListResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${wabaId}/in_progress_onbehalf_request${this.toQuery(params)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async getOBOMobilityIntent(
        oboMobilityIntentId: string,
        fields?: waba.WabaFieldsParam,
    ): Promise<waba.WabaGraphObject> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${oboMobilityIntentId}${this.fieldsQuery(fields)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async createOBOMobilityIntent(
        params: waba.CreateOBOMobilityIntentRequest,
        wabaId: string = this.config[WabaConfigEnum.BusinessAcctId],
    ): Promise<waba.WabaGraphObject> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${wabaId}/obo_mobility_intent`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(params),
        );
    }

    async setOBOMobilityIntent(
        params: waba.SetOBOMobilityIntentRequest,
        wabaId: string = this.config[WabaConfigEnum.BusinessAcctId],
    ): Promise<waba.WabaGraphObject> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${wabaId}/set_obo_mobility_intent`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(params),
        );
    }

    async getWabaSchedules(
        params?: waba.WabaListParams,
        wabaId: string = this.config[WabaConfigEnum.BusinessAcctId],
    ): Promise<waba.WabaListResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${wabaId}/schedules${this.toQuery(params)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async createWabaSchedule(
        params: waba.CreateScheduleRequest,
        wabaId: string = this.config[WabaConfigEnum.BusinessAcctId],
    ): Promise<waba.WabaGraphObject> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${wabaId}/schedules`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(params),
        );
    }

    async getWhatsAppBusinessBotDetails(botId: string, fields?: waba.WabaFieldsParam): Promise<waba.WabaGraphObject> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${botId}${this.fieldsQuery(fields)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async getWhatsAppBusinessProfileDetails(
        profileId: string,
        fields?: waba.WabaFieldsParam,
    ): Promise<waba.WabaGraphObject> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${profileId}${this.fieldsQuery(fields)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async updateWhatsAppBusinessProfile(
        profileId: string,
        params: waba.UpdateWhatsAppBusinessProfileRequest,
    ): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            profileId,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(params),
        );
    }
}
