import { BaseAPI } from '../../types/base';
import type { WabaConfigType } from '../../types/config';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import type { RequesterClass, ResponseSuccess } from '../../types/request';
import { objectToQueryString } from '../../utils/objectToQueryString';

import type * as commerce from './types';

/**
 * API for WhatsApp Commerce Settings.
 */
export default class CommerceApi extends BaseAPI implements commerce.CommerceClass {
    private readonly endpoint = 'whatsapp_commerce_settings';

    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    async getCommerceSettings(): Promise<commerce.CommerceSettingsResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async updateCommerceSettings(params: commerce.UpdateCommerceSettingsRequest): Promise<ResponseSuccess> {
        const queryParams = objectToQueryString(params);
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}${queryParams}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }
}
