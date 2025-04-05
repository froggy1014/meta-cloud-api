import { RegistrationClass } from '../types/registration';
import type { WabaConfigType } from '../types/config';
import { HttpMethodsEnum, WabaConfigEnum, DataLocalizationRegionEnum } from '../types/enums';
import type { RequesterClass, RequesterResponseInterface, ResponseSuccess } from '../types/request';
import BaseAPI from './base';

export default class RegistrationAPI extends BaseAPI implements RegistrationClass {
    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    async register(
        pin: string,
        dataLocalizationRegion?: DataLocalizationRegionEnum,
    ): Promise<RequesterResponseInterface<ResponseSuccess>> {
        const body = {
            messaging_product: 'whatsapp',
            pin,
            ...(dataLocalizationRegion && { data_localization_region: dataLocalizationRegion }),
        };

        return this.client.sendRequest(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/register`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }

    async deregister(): Promise<RequesterResponseInterface<ResponseSuccess>> {
        return this.client.sendRequest(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/deregister`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }
}
