import { HttpMethodsEnum, WabaConfigEnum } from '../types/enums';
import type { WabaConfigType } from '../types/config';
import type { RequesterClass, RequesterResponseInterface, ResponseSuccess } from '../types/request';
import BaseAPI from './base';
import { WABAClass, WabaSubscriptions } from '../types/waba';

export default class WabaAPI extends BaseAPI implements WABAClass {
    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    async getAllWabaSubscriptions(): Promise<RequesterResponseInterface<WabaSubscriptions>> {
        return this.client.sendRequest(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/subscribed_apps`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async subscribeToWaba(): Promise<RequesterResponseInterface<ResponseSuccess>> {
        return this.client.sendRequest(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/subscribed_apps`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async unsubscribeFromWaba(): Promise<RequesterResponseInterface<ResponseSuccess>> {
        return this.client.sendRequest(
            HttpMethodsEnum.Delete,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/subscribed_apps`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async overrideWabaWebhook(
        webhookUrl: string,
        verifyToken: string,
    ): Promise<RequesterResponseInterface<ResponseSuccess>> {
        const body = {
            url: webhookUrl,
            verify_token: verifyToken,
        };

        return this.client.sendRequest(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/webhooks`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }
}
