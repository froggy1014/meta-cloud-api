// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/catalogs/sell-products-and-services/set-commerce-settings/

import type { ResponseSuccess } from '../../../types/request';

/**
 * Commerce Settings API Types
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/catalogs/sell-products-and-services/set-commerce-settings/
 */

export type CommerceSetting = {
    id: string;
    is_cart_enabled?: boolean;
    is_catalog_visible?: boolean;
};

export type CommerceSettingsResponse = {
    data: CommerceSetting[];
};

export type UpdateCommerceSettingsRequest = {
    is_cart_enabled?: boolean;
    is_catalog_visible?: boolean;
};

export interface CommerceClass {
    getCommerceSettings(): Promise<CommerceSettingsResponse>;
    updateCommerceSettings(params: UpdateCommerceSettingsRequest): Promise<ResponseSuccess>;
}
