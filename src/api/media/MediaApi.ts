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
 * WhatsApp Media API client for uploading, retrieving, downloading, and deleting media.
 *
 * Media uploaded to the WhatsApp API can be used in messages (images, audio, video,
 * documents, stickers). Each media object is identified by a unique media ID.
 *
 * **Covered endpoints:**
 * - `GET /{MEDIA_ID}` - Retrieve media info ({@link MediaApi.getMediaById})
 * - `POST /{PHONE_NUMBER_ID}/media` - Upload media ({@link MediaApi.uploadMedia})
 * - `DELETE /{MEDIA_ID}` - Delete media ({@link MediaApi.deleteMedia})
 * - `GET {MEDIA_URL}` - Download media content ({@link MediaApi.downloadMedia})
 *
 * **Supported media types and size limits:**
 * | Type | MIME Types | Max Size |
 * |------|-----------|----------|
 * | Audio | audio/aac, audio/mp4, audio/mpeg, audio/amr, audio/ogg | 16 MB |
 * | Document | Various (PDF, DOC, DOCX, PPT, XLS, etc.) | 100 MB |
 * | Image | image/jpeg, image/png | 5 MB |
 * | Sticker | image/webp | 100 KB (animated), 500 KB (static) |
 * | Video | video/mp4, video/3gp | 16 MB |
 *
 * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media | WhatsApp Media API Reference}
 * @see {@link https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/media/ | WhatsApp Media Documentation}
 *
 * @example
 * ```ts
 * const client = new WhatsApp({ accessToken: '...', phoneNumberId: '...' });
 *
 * // Upload, send, then clean up
 * const { id } = await client.media.uploadMedia(file);
 * await client.messages.image({ body: { id }, to: '1234567890' });
 * await client.media.deleteMedia(id);
 * ```
 */
export default class MediaApi extends BaseAPI implements media.MediaClass {
    private readonly endpoint = 'media';

    /**
     * Retrieves media information by media ID.
     *
     * Returns metadata about the media object including its URL, MIME type, file size,
     * and SHA-256 hash. The returned URL can be used with {@link MediaApi.downloadMedia}
     * to fetch the actual media content.
     *
     * **Endpoint:** `GET /{MEDIA_ID}`
     *
     * @param mediaId - The unique identifier of the media to retrieve
     * @returns A promise resolving to the media metadata including `url`, `mime_type`, `sha256`, and `file_size`
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media#get-media-id | Get Media ID Reference}
     *
     * @example
     * ```ts
     * const mediaInfo = await client.media.getMediaById('media_id_123');
     * console.log(mediaInfo.url);       // URL to download the media
     * console.log(mediaInfo.mime_type);  // e.g., "image/jpeg"
     * console.log(mediaInfo.file_size);  // size in bytes
     * ```
     */
    async getMediaById(mediaId: string): Promise<media.MediaResponse> {
        return this.sendJson(HttpMethodsEnum.Get, `${mediaId}`, this.config[WabaConfigEnum.RequestTimeout], null);
    }

    /**
     * Uploads a media file to the WhatsApp Cloud API.
     *
     * The uploaded media is assigned a unique media ID that can be used to send
     * messages containing that media. Media is automatically encrypted and stored
     * on Meta's servers.
     *
     * **Endpoint:** `POST /{PHONE_NUMBER_ID}/media`
     *
     * @param file - The `File` object to upload. The `type` property must match a supported MIME type.
     * @param messagingProduct - The messaging product identifier (defaults to `'whatsapp'`)
     * @returns A promise resolving to the upload response containing the assigned `id` (media ID)
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media#upload-media | Upload Media Reference}
     *
     * @example
     * ```ts
     * const file = new File([buffer], 'image.jpg', { type: 'image/jpeg' });
     * const { id } = await client.media.uploadMedia(file);
     * // Use the media ID to send an image message
     * await client.messages.image({ body: { id }, to: '1234567890' });
     * ```
     */
    async uploadMedia(file: File, messagingProduct: string = 'whatsapp'): Promise<media.UploadMediaResponse> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('messaging_product', messagingProduct);
        formData.append('type', file.type);

        return this.sendFormData(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            formData,
        );
    }

    /**
     * Deletes a media file from WhatsApp servers.
     *
     * Once deleted, the media ID can no longer be used in messages. Any messages
     * already sent with this media will continue to display the media.
     *
     * **Endpoint:** `DELETE /{MEDIA_ID}`
     *
     * @param mediaId - The unique identifier of the media to delete
     * @returns A promise resolving to a success response (`{ success: true }`)
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media#delete-media | Delete Media Reference}
     *
     * @example
     * ```ts
     * const result = await client.media.deleteMedia('media_id_123');
     * console.log(result.success); // true
     * ```
     */
    async deleteMedia(mediaId: string): Promise<ResponseSuccess> {
        return this.sendJson(HttpMethodsEnum.Delete, `${mediaId}`, this.config[WabaConfigEnum.RequestTimeout], null);
    }

    /**
     * Downloads media content from a WhatsApp media URL.
     *
     * Use {@link MediaApi.getMediaById} first to obtain the media URL, then pass it
     * to this method to download the actual file content. The returned URL from
     * `getMediaById` is only valid for a limited time.
     *
     * **Endpoint:** `GET {MEDIA_URL}`
     *
     * @param mediaUrl - The media download URL obtained from {@link MediaApi.getMediaById}
     * @returns A promise resolving to a `Blob` containing the raw media data
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media#download-media | Download Media Reference}
     *
     * @example
     * ```ts
     * // First get the media URL, then download it
     * const mediaInfo = await client.media.getMediaById('media_id_123');
     * const blob = await client.media.downloadMedia(mediaInfo.url);
     * ```
     */
    async downloadMedia(mediaUrl: string): Promise<Blob> {
        return this.sendJson(HttpMethodsEnum.Get, mediaUrl, this.config[WabaConfigEnum.RequestTimeout], null);
    }
}
