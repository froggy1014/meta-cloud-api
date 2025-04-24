import type { WabaConfigType } from '../types/config';
import { HttpMethodsEnum, WabaConfigEnum } from '../types/enums';
import type { RequesterClass, RequesterResponseInterface, ResponseSuccess } from '../types/request';
import { UpdateWabaSubscription, WABAClass, WabaSubscriptions } from '../types/waba';
import BaseAPI from './base';

export default class WabaAPI extends BaseAPI implements WABAClass {
    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    async getAllWabaSubscriptions(): Promise<RequesterResponseInterface<WabaSubscriptions>> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/subscribed_apps`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async updateWabaSubscription({
        override_callback_uri,
        verify_token,
    }: UpdateWabaSubscription): Promise<RequesterResponseInterface<ResponseSuccess>> {
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

    async unsubscribeFromWaba(): Promise<RequesterResponseInterface<ResponseSuccess>> {
        return this.sendJson(
            HttpMethodsEnum.Delete,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/subscribed_apps`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }
}
