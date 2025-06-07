import { BaseAPI } from '../../shared/types/base';
import type { WabaConfigType } from '../../shared/types/config';
import { DataLocalizationRegionEnum, HttpMethodsEnum, WabaConfigEnum } from '../../shared/types/enums';
import type { RequesterClass, ResponseSuccess } from '../../shared/types/request';

import type * as registration from './types';

/**
 * API for managing WhatsApp Business Account registration.
 *
 * This API allows you to:
 * - Register a WhatsApp Business Account with a PIN
 * - Deregister a WhatsApp Business Account
 */
export default class RegistrationApi extends BaseAPI implements registration.RegistrationClass {
    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    /**
     * Register a WhatsApp Business Account using a PIN.
     *
     * @param pin The registration PIN received via SMS or voice call
     * @param dataLocalizationRegion Optional data localization region
     * @returns Response indicating success or failure
     *
     * @example
     * await whatsappClient.registration.register('123456', DataLocalizationRegionEnum.Asia);
     */
    async register(pin: string, dataLocalizationRegion?: DataLocalizationRegionEnum): Promise<ResponseSuccess> {
        const body: registration.RegistrationRequest = {
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

    /**
     * Deregister a WhatsApp Business Account.
     *
     * @returns Response indicating success or failure
     *
     * @example
     * await whatsappClient.registration.deregister();
     */
    async deregister(): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/deregister`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }
}
