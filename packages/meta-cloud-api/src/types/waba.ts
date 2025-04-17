import { RequesterResponseInterface, ResponseData, ResponseSuccess } from './request';

export type WabaSubscription = {
    whatsapp_business_api_data: {
        id: string;
        link: string;
        name: string;
        category: string;
    };
    override_callback_uri?: string;
};

export type UpdateWabaSubscription = {
    override_callback_uri: string;
    verify_token: string;
};

export type WabaSubscriptions = ResponseData<Array<WabaSubscription>>;

export declare class WABAClass {
    getAllWabaSubscriptions(): Promise<RequesterResponseInterface<WabaSubscriptions>>;
    updateWabaSubscription({
        override_callback_uri,
        verify_token,
    }: UpdateWabaSubscription): Promise<RequesterResponseInterface<ResponseSuccess>>;
    unsubscribeFromWaba(): Promise<RequesterResponseInterface<ResponseSuccess>>;
}
