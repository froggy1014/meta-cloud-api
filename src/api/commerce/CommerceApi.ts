// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/catalogs/sell-products-and-services/set-commerce-settings/

// Endpoints:
// - GET /{PHONE_NUMBER_ID}/whatsapp_commerce_settings
// - POST /{PHONE_NUMBER_ID}/whatsapp_commerce_settings?is_cart_enabled&is_catalog_visible

import { BaseAPI } from '../../types/base';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import type { ResponseSuccess } from '../../types/request';
import { objectToQueryString } from '../../utils/objectToQueryString';

import type * as commerce from './types';

/**
 * API for WhatsApp Commerce Settings.
 *
 * Provides methods to retrieve and update commerce settings such as cart
 * and catalog visibility for your WhatsApp Business phone number.
 *
 * Endpoints covered:
 * - `GET /{PHONE_NUMBER_ID}/whatsapp_commerce_settings` - Get commerce settings
 * - `POST /{PHONE_NUMBER_ID}/whatsapp_commerce_settings` - Update commerce settings
 *
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/catalogs/sell-products-and-services/set-commerce-settings/
 */
export default class CommerceApi extends BaseAPI implements commerce.CommerceClass {
    private readonly endpoint = 'whatsapp_commerce_settings';

    /**
     * Retrieve the current commerce settings for the phone number.
     *
     * @returns The current commerce settings including cart and catalog visibility state.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/catalogs/sell-products-and-services/set-commerce-settings/
     */
    async getCommerceSettings(): Promise<commerce.CommerceSettingsResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    /**
     * Update commerce settings for the phone number (e.g., enable/disable cart or catalog).
     *
     * @param params - The commerce settings to update (e.g., is_cart_enabled, is_catalog_visible).
     * @returns A success response confirming the settings were updated.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/catalogs/sell-products-and-services/set-commerce-settings/
     */
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
