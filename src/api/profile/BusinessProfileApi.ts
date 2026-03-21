// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-profiles/

// Endpoints:
// - GET /{PHONE_NUMBER_ID}/whatsapp_business_profile?fields
// - POST /{PHONE_NUMBER_ID}/whatsapp_business_profile
// - POST /app/uploads?file_length&file_type&file_name
// - POST /{UPLOAD_ID}
// - GET /{UPLOAD_ID}

import { BaseAPI } from '../../types/base';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import type { ResponseSuccess } from '../../types/request';
import { buildFieldsQueryString } from '../../utils/buildFieldsQueryString';
import { objectToQueryString } from '../../utils/objectToQueryString';

import type * as bp from './types';

/**
 * API for managing WhatsApp Business Profiles and profile pictures.
 *
 * Business profiles let customers see relevant information about your business,
 * such as a description, email, address, website, and profile picture.
 *
 * Covered endpoints:
 * - Get business profile (`GET /{PHONE_NUMBER_ID}/whatsapp_business_profile`)
 * - Update business profile (`POST /{PHONE_NUMBER_ID}/whatsapp_business_profile`)
 * - Create an upload session for profile pictures (`POST /app/uploads`)
 * - Upload file binary data (`POST /{UPLOAD_ID}`)
 * - Get upload handle (`GET /{UPLOAD_ID}`)
 *
 * Profile picture upload follows a three-step process:
 * 1. Create an upload session ({@link createUploadSession})
 * 2. Upload the image binary data ({@link uploadMedia})
 * 3. Get the upload handle ({@link getUploadHandle}) and pass it to {@link updateBusinessProfile}
 *
 * Available business profile fields: `about`, `address`, `description`, `email`,
 * `profile_picture_url`, `websites`, `vertical`, `messaging_product`.
 *
 * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/business-profiles | Business Profiles API Reference}
 * @see {@link https://developers.facebook.com/documentation/business-messaging/whatsapp/business-profiles/ | Business Profiles Documentation}
 */
export default class BusinessProfileApi extends BaseAPI implements bp.BusinessProfileClass {
    private readonly endpoint = 'whatsapp_business_profile';

    /**
     * Get your WhatsApp Business profile information.
     *
     * Retrieves the business profile details for the configured phone number.
     * You can request all fields or specify a subset using the `fields` parameter.
     *
     * @param fields - Optional fields to return. Can be a comma-separated string
     *   (e.g., `'about,address,email'`) or an array of field names. If omitted,
     *   all fields are returned. Available fields: `about`, `address`, `description`,
     *   `email`, `profile_picture_url`, `websites`, `vertical`.
     * @returns A promise that resolves with the business profile information.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/business-profiles#get-business-profile | Get Business Profile}
     *
     * @example
     * ```ts
     * // Get all business profile fields
     * const profile = await whatsappClient.businessProfile.getBusinessProfile();
     *
     * // Get specific fields as a string
     * const profile = await whatsappClient.businessProfile.getBusinessProfile('about,address,email');
     *
     * // Get specific fields as an array
     * const profile = await whatsappClient.businessProfile.getBusinessProfile(['about', 'address', 'email']);
     * ```
     */
    async getBusinessProfile(fields?: bp.BusinessProfileFieldsParam): Promise<bp.BusinessProfileResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}${buildFieldsQueryString(fields)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    /**
     * Update your WhatsApp Business profile.
     *
     * Updates one or more fields of the business profile for the configured phone number.
     * Only the fields included in the request body are updated; omitted fields remain unchanged.
     *
     * @param updateRequest - The profile fields to update.
     * @param updateRequest.messaging_product - Required. Must be set to `'whatsapp'`.
     * @param updateRequest.about - Optional. Business About text (1-139 characters).
     * @param updateRequest.address - Optional. Business address (max 256 characters).
     * @param updateRequest.description - Optional. Business description (max 512 characters).
     * @param updateRequest.vertical - Optional. Business industry/category.
     * @param updateRequest.email - Optional. Contact email address (max 128 characters).
     * @param updateRequest.websites - Optional. Up to 2 website URLs (max 256 characters each).
     * @param updateRequest.profile_picture_handle - Optional. Handle obtained from the upload process.
     * @returns A promise that resolves with a success indicator.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/business-profiles#update-business-profile | Update Business Profile}
     *
     * @example
     * ```ts
     * await whatsappClient.businessProfile.updateBusinessProfile({
     *     messaging_product: 'whatsapp',
     *     about: 'We provide excellent service',
     *     description: 'Your trusted partner for quality products',
     *     email: 'contact@example.com',
     *     websites: ['https://example.com'],
     * });
     * ```
     */
    async updateBusinessProfile(updateRequest: bp.UpdateBusinessProfileRequest): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(updateRequest),
        );
    }

    /**
     * Create an upload session for a profile picture.
     *
     * This is **step 1** of the three-step profile picture upload process.
     * It initializes a resumable upload session on the server and returns a session ID
     * to use in subsequent upload calls.
     *
     * @param fileLength - The size of the file in bytes.
     * @param fileType - The MIME type of the file (e.g., `'image/jpeg'`, `'image/png'`).
     * @param fileName - The file name with extension (e.g., `'profile.jpg'`).
     * @returns A promise that resolves with the upload session ID.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/business-profiles | Business Profiles - Upload}
     *
     * @example
     * ```ts
     * const session = await whatsappClient.businessProfile.createUploadSession(
     *     fileBuffer.length,
     *     'image/jpeg',
     *     'profile.jpg',
     * );
     * console.log(session.upload_session_id);
     * ```
     */
    async createUploadSession(
        fileLength: number,
        fileType: string,
        fileName: string,
    ): Promise<bp.UploadSessionResponse> {
        const queryParams = objectToQueryString({
            file_length: fileLength,
            file_type: fileType,
            file_name: fileName,
        });

        return this.sendJson(
            HttpMethodsEnum.Post,
            `app/uploads/${queryParams}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    /**
     * Upload media file binary data to an upload session.
     *
     * This is **step 2** of the three-step profile picture upload process.
     * Uploads the raw binary content of the image to the previously created upload session.
     *
     * @param uploadId - The upload session ID returned from {@link createUploadSession}.
     * @param file - The binary data of the file as a Buffer.
     * @returns A promise that resolves with the upload response.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/business-profiles | Business Profiles - Upload}
     *
     * @example
     * ```ts
     * const fileBuffer = fs.readFileSync('profile.jpg');
     * await whatsappClient.businessProfile.uploadMedia(
     *     session.upload_session_id,
     *     fileBuffer,
     * );
     * ```
     */
    async uploadMedia(uploadId: string, file: Buffer): Promise<bp.UploadBusinessProfileResponse> {
        return this.sendJson(HttpMethodsEnum.Post, `${uploadId}`, this.config[WabaConfigEnum.RequestTimeout], file);
    }

    /**
     * Get the upload handle for a completed upload.
     *
     * This is **step 3** of the three-step profile picture upload process.
     * After uploading the file binary, retrieve the handle to use when updating
     * the business profile's `profile_picture_handle` field.
     *
     * @param uploadId - The upload session ID returned from {@link createUploadSession}.
     * @returns A promise that resolves with the upload handle information.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/business-profiles | Business Profiles - Upload}
     *
     * @example
     * ```ts
     * // Complete three-step profile picture upload
     * const session = await whatsappClient.businessProfile.createUploadSession(
     *     fileBuffer.length, 'image/jpeg', 'profile.jpg',
     * );
     * await whatsappClient.businessProfile.uploadMedia(session.upload_session_id, fileBuffer);
     * const handleInfo = await whatsappClient.businessProfile.getUploadHandle(session.upload_session_id);
     *
     * // Use the handle to update the profile picture
     * await whatsappClient.businessProfile.updateBusinessProfile({
     *     messaging_product: 'whatsapp',
     *     profile_picture_handle: handleInfo.handle,
     * });
     * ```
     */
    async getUploadHandle(uploadId: string): Promise<bp.UploadHandle> {
        return this.sendJson(HttpMethodsEnum.Get, `${uploadId}`, this.config[WabaConfigEnum.RequestTimeout], null);
    }
}
