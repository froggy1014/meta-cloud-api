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

export type WabaSubscriptions = ResponseData<Array<WabaSubscription>>;

export declare class WABAClass {
    getAllWabaSubscriptions(): Promise<RequesterResponseInterface<WabaSubscriptions>>;
    subscribeToWaba(): Promise<RequesterResponseInterface<ResponseSuccess>>;
    unsubscribeFromWaba(): Promise<RequesterResponseInterface<ResponseSuccess>>;
    overrideWabaWebhook(webhookUrl: string, verifyToken: string): Promise<RequesterResponseInterface<ResponseSuccess>>;
}
