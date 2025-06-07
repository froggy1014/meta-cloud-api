import { BaseAPI } from '@shared/types/base';
import type { WabaConfigType } from '@shared/types/config';
import { HttpMethodsEnum, WabaConfigEnum } from '@shared/types/enums';
import type { RequesterClass, ResponseSuccess } from '@shared/types/request';
import { buildFieldsQueryString } from '@shared/utils/buildFieldsQueryString';

import type * as waba from './types';

/**
 * API for managing WhatsApp Business Account (WABA).
 *
 * This API allows you to:
 * - Get WABA account information
 * - Manage WABA subscriptions
 * - Subscribe/unsubscribe from WABA webhooks
 * - Update subscription settings
 */
export default class WabaApi extends BaseAPI implements waba.WABAClass {
    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    /**
     * Retrieve WhatsApp Business Account information.
     *
     * @param fields Optional array of specific fields to retrieve
     * @returns WABA account information including status, health, verification status, etc.
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
     * Get all WABA subscriptions for the business account.
     *
     * @returns List of all subscribed apps and their configurations
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
     * @param params Configuration parameters including callback URI and verify token
     * @returns Response indicating success or failure
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
     * @returns Response indicating success or failure
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
}
