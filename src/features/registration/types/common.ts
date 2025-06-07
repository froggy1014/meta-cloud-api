import { DataLocalizationRegionEnum } from '../../../shared/types/enums';
import type { ResponseSuccess } from '../../../shared/types/request';

export type RegistrationRequest = {
    messaging_product: 'whatsapp';
    pin: string;
    data_localization_region?: DataLocalizationRegionEnum;
};

export interface RegistrationClass {
    register(pin: string, dataLocalizationRegion?: DataLocalizationRegionEnum): Promise<ResponseSuccess>;
    deregister(): Promise<ResponseSuccess>;
}
