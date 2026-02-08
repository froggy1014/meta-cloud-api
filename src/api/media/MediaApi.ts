// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/media/

// Endpoints:
// - GET /{MEDIA_ID}
// - POST /{PHONE_NUMBER_ID}/media
// - DELETE /{MEDIA_ID}
// - GET {MEDIA_URL}

import { BaseAPI } from '../../types/base';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import type { ResponseSuccess } from '../../types/request';

import type * as media from './types';

/**
 * API for managing WhatsApp Media.
 *
 * This API allows you to:
 * - Get media information by ID
 * - Upload media files
 * - Delete media files
 * - Download media files from URLs
 */
export default class MediaApi extends BaseAPI implements media.MediaClass {
    private readonly endpoint = 'media';

    /**
     * Retrieve media information by media ID.
     *
     * @param mediaId The media ID to retrieve information for
     * @param phone_number_id Optional phone number ID (defaults to configured one)
     * @returns Media information including URL, mime type, file size, etc.
     *
     * @example
     * const mediaInfo = await whatsappClient.media.getMediaById('media_id_123');
     */
    async getMediaById(mediaId: string, _phone_number_id?: string): Promise<media.MediaResponse> {
        return this.sendJson(HttpMethodsEnum.Get, `${mediaId}`, this.config[WabaConfigEnum.RequestTimeout], null);
    }

    /**
     * Upload a media file to WhatsApp.
     *
     * @param file The file to upload
     * @param messagingProduct The messaging product (default: 'whatsapp')
     * @returns Upload response containing the media ID
     *
     * @example
     * const file = new File([buffer], 'image.jpg', { type: 'image/jpeg' });
     * const result = await whatsappClient.media.uploadMedia(file);
     */
    async uploadMedia(file: File, messagingProduct: string = 'whatsapp'): Promise<media.UploadMediaResponse> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('messaging_product', messagingProduct);
        formData.append('type', file.type);

        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            formData,
        );
    }

    /**
     * Delete a media file.
     *
     * @param mediaId The media ID to delete
     * @param phone_number_id Optional phone number ID (defaults to configured one)
     * @returns Response indicating success or failure
     *
     * @example
     * await whatsappClient.media.deleteMedia('media_id_123');
     */
    async deleteMedia(mediaId: string, _phone_number_id?: string): Promise<ResponseSuccess> {
        return this.sendJson(HttpMethodsEnum.Delete, `${mediaId}`, this.config[WabaConfigEnum.RequestTimeout], null);
    }

    /**
     * Download media from a URL.
     *
     * @param mediaUrl The URL to download media from
     * @returns Blob containing the media data
     *
     * @example
     * const blob = await whatsappClient.media.downloadMedia('https://...');
     */
    async downloadMedia(mediaUrl: string): Promise<Blob> {
        return this.sendJson(HttpMethodsEnum.Get, mediaUrl, this.config[WabaConfigEnum.RequestTimeout], null);
    }
}
