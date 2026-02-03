// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/qr-codes/

import type { ResponseData, ResponseSuccess } from '../../../types/request';

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
    createQrCode(request: CreateQrCodeRequest): Promise<QrCodeResponse>;
    getQrCodes(): Promise<QrCodesResponse>;
    getQrCode(qrCodeId: string): Promise<QrCodeResponse>;
    updateQrCode(request: UpdateQrCodeRequest): Promise<QrCodeResponse>;
    deleteQrCode(qrCodeId: string): Promise<ResponseSuccess>;
}
