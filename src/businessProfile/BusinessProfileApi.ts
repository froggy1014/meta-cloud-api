import BaseAPI from '../api/base';
import type { WabaConfigType } from '../types/config';
import { HttpMethodsEnum, WabaConfigEnum } from '../types/enums';
import type { RequesterClass, ResponseSuccess } from '../types/request';
import { buildFieldsQueryString } from '../utils/buildFieldsQueryString';
import { objectToQueryString } from '../utils/objectToQueryString';

import type * as bp from './types';

/**
 * API for managing WhatsApp Business Profiles and profile pictures.
 *
 * This API allows you to:
 * - Get business profile information
 * - Update business profile details
 * - Upload profile pictures using a three-step process:
 *   1. Create an upload session
 *   2. Upload the image binary data
 *   3. Get the upload handle to use when updating the profile
 */
export default class BusinessProfileApi extends BaseAPI implements bp.BusinessProfileClass {
    private readonly endpoint = 'whatsapp_business_profile';

    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    /**
     * Get your business profile information.
     *
     * Use this method to retrieve details about your WhatsApp business profile, including
     * about text, address, description, email, profile picture URL, websites, and vertical.
     *
     * @param fields Fields to be returned in the response. If not specified, all fields will be returned.
     *               Possible values: about, address, description, email, profile_picture_url, websites, vertical
     * @returns The business profile information.
     *
     * @example
     * // Get all business profile fields
     * const profile = await whatsappClient.businessProfile.getBusinessProfile();
     *
     * // Get specific business profile fields
     * const profile = await whatsappClient.businessProfile.getBusinessProfile('about,address,email');
     *
     * // Using the BusinessProfileFieldsParam type
     * const profile = await whatsappClient.businessProfile.getBusinessProfile(['about', 'address', 'email']);
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
     * Update your business profile.
     *
     * Use this method to update one or more fields of your WhatsApp business profile.
     *
     * @param updateRequest The request object containing the fields to update.
     *        - messaging_product: Required. Always set to "whatsapp".
     *        - about: Optional. Business's About text (1-139 characters).
     *        - address: Optional. Business address (max 256 characters).
     *        - description: Optional. Business description (max 512 characters).
     *        - vertical: Optional. Business category (use BusinessVerticalEnum for type safety).
     *        - email: Optional. Contact email (valid format, max 128 characters).
     *        - websites: Optional. Up to 2 URLs (max 256 characters each).
     *        - profile_picture_handle: Optional. Handle from upload process.
     * @returns Response indicating success or failure.
     *
     * @example
     * // Update business profile with multiple fields including vertical using enum
     * await whatsappClient.businessProfile.updateBusinessProfile({
     *   messaging_product: 'whatsapp',
     *   about: 'We provide excellent service',
     *   email: 'contact@example.com',
     *   websites: ['https://example.com'],
     *   vertical: BusinessVerticalEnum.RETAIL
     * });
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
     * This is the first step in the profile picture upload process.
     *
     * @param fileLength Length of the file to be uploaded in bytes.
     * @param fileType MIME type of the file (e.g., 'image/jpeg').
     * @param fileName Name of the file with extension.
     * @returns Response containing the upload session ID needed for the next step.
     *
     * @example
     * // Create upload session for profile picture
     * const session = await whatsappClient.businessProfile.createUploadSession(
     *   fileBuffer.length,
     *   'image/jpeg',
     *   'profile.jpg'
     * );
     * const uploadSessionId = session.upload_session_id;
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
     * Upload media file to the upload session.
     *
     * This is the second step in the profile picture upload process.
     * Upload the binary content of the file to the previously created upload session.
     *
     * @param uploadId The upload session ID from createUploadSession response.
     * @param file The binary data of the file (Buffer).
     * @returns Response indicating success or failure.
     *
     * @example
     * // Upload the actual file content
     * await whatsappClient.businessProfile.uploadMedia(
     *   uploadSessionId,
     *   fileBuffer
     * );
     */
    async uploadMedia(uploadId: string, file: Buffer): Promise<bp.UploadBusinessProfileResponse> {
        return this.sendJson(HttpMethodsEnum.Post, `${uploadId}`, this.config[WabaConfigEnum.RequestTimeout], file);
    }

    /**
     * Get the upload handle information.
     *
     * This is the third step in the profile picture upload process.
     * After uploading the file, get the handle to use when updating the profile.
     *
     * @param uploadId The upload session ID from createUploadSession response.
     * @returns Response containing the upload handle information.
     *
     * @example
     * // Complete profile picture update process
     * // 1. Create upload session
     * const session = await whatsappClient.businessProfile.createUploadSession(
     *   fileBuffer.length, 'image/jpeg', 'profile.jpg'
     * );
     *
     * // 2. Upload the image data
     * await whatsappClient.businessProfile.uploadMedia(
     *   session.upload_session_id, fileBuffer
     * );
     *
     * // 3. Get the handle for the uploaded file
     * const handleInfo = await whatsappClient.businessProfile.getUploadHandle(
     *   session.upload_session_id
     * );
     *
     * // 4. Update profile with new picture and business information
     * await whatsappClient.businessProfile.updateBusinessProfile({
     *   messaging_product: 'whatsapp',
     *   profile_picture_handle: handleInfo.handle,
     *   vertical: BusinessVerticalEnum.RESTAURANT,
     *   about: 'Delicious food served daily'
     * });
     */
    async getUploadHandle(uploadId: string): Promise<bp.UploadHandle> {
        return this.sendJson(HttpMethodsEnum.Get, `${uploadId}`, this.config[WabaConfigEnum.RequestTimeout], null);
    }
}
