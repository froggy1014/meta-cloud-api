import { buildFieldsQueryString } from 'src/utils/buildFieldsQueryString';
import type { WabaConfigType } from '../types/config';
import { HttpMethodsEnum, WabaConfigEnum } from '../types/enums';
import type { RequesterClass, ResponseSuccess } from '../types/request';
import type {
    UpdateWabaSubscription,
    WABAClass,
    WabaAccount,
    WabaAccountFieldsParam,
    WabaSubscriptions,
} from '../types/waba';
import BaseAPI from './base';

export default class WabaAPI extends BaseAPI implements WABAClass {
    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    async getWabaAccount(fields?: WabaAccountFieldsParam): Promise<WabaAccount> {
        const queryString = buildFieldsQueryString(fields)?.replace(/,/g, '%2C');

        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.BusinessAcctId]}${queryString}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async getAllWabaSubscriptions(): Promise<WabaSubscriptions> {
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
    }: UpdateWabaSubscription): Promise<ResponseSuccess> {
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

    async unsubscribeFromWaba(): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Delete,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/subscribed_apps`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }
}
