import { ResponseSuccess } from './request';

import { RequesterResponseInterface, ResponseData } from './request';

export type QrCodeResponse = {
    code: string;
    prefilled_message: string;
    deep_link_url: string;
    qr_image_url?: string;
};

export type QrCodesResponse = ResponseData<QrCodeResponse[]>;

export type CreateQrCodeRequest = {
    prefilled_message: string;
    generate_qr_image?: 'SVG' | 'PNG';
};

export type UpdateQrCodeRequest = {
    code: string;
    prefilled_message: string;
};

export interface QrCodeClass {
    createQrCode(
        businessPhoneNumberId: string,
        request: CreateQrCodeRequest,
    ): Promise<RequesterResponseInterface<QrCodeResponse>>;

    getQrCodes(businessPhoneNumberId: string): Promise<RequesterResponseInterface<QrCodesResponse>>;

    getQrCode(businessPhoneNumberId: string, qrCodeId: string): Promise<RequesterResponseInterface<QrCodeResponse>>;

    updateQrCode(
        businessPhoneNumberId: string,
        request: UpdateQrCodeRequest,
    ): Promise<RequesterResponseInterface<QrCodeResponse>>;

    deleteQrCode(businessPhoneNumberId: string, qrCodeId: string): Promise<RequesterResponseInterface<ResponseSuccess>>;
}
