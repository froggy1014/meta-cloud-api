// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/registration/

import type { DataLocalizationRegionEnum } from '../../../types/enums';
import type { ResponseSuccess } from '../../../types/request';

export type RegistrationRequest = {
    messaging_product: 'whatsapp';
    pin: string;
    data_localization_region?: DataLocalizationRegionEnum;
};

export interface RegistrationClass {
    register(pin: string, dataLocalizationRegion?: DataLocalizationRegionEnum): Promise<ResponseSuccess>;
    deregister(): Promise<ResponseSuccess>;
}
