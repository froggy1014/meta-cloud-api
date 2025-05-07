import { DataLocalizationRegionEnum } from './enums';
import { ResponseSuccess } from './request';

export type RegistrationRequest = {
    messaging_product: 'whatsapp';
    pin: string;
    data_localization_region?: DataLocalizationRegionEnum;
};

export interface RegistrationClass {
    register(pin: string, dataLocalizationRegion?: DataLocalizationRegionEnum): Promise<ResponseSuccess>;
    deregister(): Promise<ResponseSuccess>;
}
