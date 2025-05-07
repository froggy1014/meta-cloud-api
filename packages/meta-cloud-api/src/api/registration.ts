import type { WabaConfigType } from '../types/config';
import { DataLocalizationRegionEnum, HttpMethodsEnum, WabaConfigEnum } from '../types/enums';
import { RegistrationClass } from '../types/registration';
import type { RequesterClass, ResponseSuccess } from '../types/request';
import BaseAPI from './base';

export default class RegistrationAPI extends BaseAPI implements RegistrationClass {
    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    async register(pin: string, dataLocalizationRegion?: DataLocalizationRegionEnum): Promise<ResponseSuccess> {
        const body = {
            messaging_product: 'whatsapp',
            pin,
            ...(dataLocalizationRegion && { data_localization_region: dataLocalizationRegion }),
        };

        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/register`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }

    async deregister(): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/deregister`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }
}
