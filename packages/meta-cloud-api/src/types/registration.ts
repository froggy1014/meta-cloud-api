import { RequesterResponseInterface, ResponseSuccess } from './request';
import { DataLocalizationRegionEnum } from './enums';

export type RegistrationRequest = {
    messaging_product: 'whatsapp';
    pin: string;
    data_localization_region?: DataLocalizationRegionEnum;
};

export interface RegistrationClass {
    register(
        pin: string,
        dataLocalizationRegion?: DataLocalizationRegionEnum,
    ): Promise<RequesterResponseInterface<ResponseSuccess>>;

    deregister(): Promise<RequesterResponseInterface<ResponseSuccess>>;
}
