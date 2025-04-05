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
    createQrCode(request: CreateQrCodeRequest): Promise<RequesterResponseInterface<QrCodeResponse>>;
    getQrCodes(): Promise<RequesterResponseInterface<QrCodesResponse>>;
    getQrCode(qrCodeId: string): Promise<RequesterResponseInterface<QrCodeResponse>>;
    updateQrCode(request: UpdateQrCodeRequest): Promise<RequesterResponseInterface<QrCodeResponse>>;
    deleteQrCode(qrCodeId: string): Promise<RequesterResponseInterface<ResponseSuccess>>;
}
