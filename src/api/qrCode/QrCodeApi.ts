// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/qr-codes/

// Endpoints:
// - POST /{PHONE_NUMBER_ID}/message_qrdls
// - GET /{PHONE_NUMBER_ID}/message_qrdls
// - GET /{PHONE_NUMBER_ID}/message_qrdls/{QR_CODE_ID}
// - POST /{PHONE_NUMBER_ID}/message_qrdls
// - DELETE /{PHONE_NUMBER_ID}/message_qrdls/{QR_CODE_ID}

import { BaseAPI } from '../../types/base';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import type { ResponseSuccess } from '../../types/request';

import type * as qrCode from './types';

/**
 * API for managing WhatsApp QR Codes.
 *
 * This API allows you to:
 * - Create QR codes with prefilled messages
 * - Get all QR codes
 * - Get specific QR code details
 * - Update QR code messages
 * - Delete QR codes
 */
export default class QrCodeApi extends BaseAPI implements qrCode.QrCodeClass {
    private readonly endpoint = 'message_qrdls';

    /**
     * Create a new QR code with a prefilled message.
     *
     * @param request The QR code creation request
     * @returns QR code information including code, deep link URL, and optional image URL
     *
     * @example
     * const qrCode = await whatsappClient.qrCode.createQrCode({
     *   prefilled_message: 'Hello from WhatsApp!',
     *   generate_qr_image: 'PNG'
     * });
     */
    async createQrCode(request: qrCode.CreateQrCodeRequest): Promise<qrCode.QrCodeResponse> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(request),
        );
    }

    /**
     * Get all QR codes for the current phone number.
     *
     * @returns List of all QR codes
     *
     * @example
     * const qrCodes = await whatsappClient.qrCode.getQrCodes();
     */
    async getQrCodes(): Promise<qrCode.QrCodesResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    /**
     * Get a specific QR code by ID.
     *
     * @param qrCodeId The QR code ID to retrieve
     * @returns QR code information
     *
     * @example
     * const qrCode = await whatsappClient.qrCode.getQrCode('qr_code_123');
     */
    async getQrCode(qrCodeId: string): Promise<qrCode.QrCodeResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}/${qrCodeId}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    /**
     * Update an existing QR code's prefilled message.
     *
     * @param request The QR code update request containing code and new message
     * @returns Updated QR code information
     *
     * @example
     * const updatedQrCode = await whatsappClient.qrCode.updateQrCode({
     *   code: 'existing_qr_code',
     *   prefilled_message: 'Updated message!'
     * });
     */
    async updateQrCode(request: qrCode.UpdateQrCodeRequest): Promise<qrCode.QrCodeResponse> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(request),
        );
    }

    /**
     * Delete a QR code.
     *
     * @param qrCodeId The QR code ID to delete
     * @returns Response indicating success or failure
     *
     * @example
     * await whatsappClient.qrCode.deleteQrCode('qr_code_123');
     */
    async deleteQrCode(qrCodeId: string): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Delete,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}/${qrCodeId}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }
}
