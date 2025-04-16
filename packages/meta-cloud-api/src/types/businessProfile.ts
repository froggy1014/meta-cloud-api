import { BusinessVerticalEnum } from './enums';
import { RequesterResponseInterface, ResponseSuccess } from './request';

export interface BusinessProfileData {
    /**
     * The business's About text. This text appears in the business's profile, beneath its profile image,
     * phone number, and contact buttons.
     * - String cannot be empty
     * - Strings must be between 1 and 139 characters
     * - Rendered emojis are supported however their unicode values are not.
     *   Emoji unicode values must be Java- or JavaScript-escape encoded
     * - Hyperlinks can be included but will not render as clickable links
     * - Markdown is not supported
     */
    about?: string;
    /**
     * Address of the business. Character limit 256.
     */
    address?: string;
    /**
     * Description of the business. Character limit 512.
     */
    description?: string;
    /**
     * The contact email address (in valid email format) of the business. Character limit 128.
     */
    email?: string;
    /**
     * The messaging service used for the request. Always set it to "whatsapp" if you are using
     * the WhatsApp Business API.
     */
    messaging_product: string;
    /**
     * Profile picture URL.
     */
    profile_picture_url?: string;
    /**
     * The URLs associated with the business. For instance, a website, Facebook Page, or Instagram.
     * - You must include the http:// or https:// portion of the URL
     * - There is a maximum of 2 websites with a maximum of 256 characters each
     */
    websites?: string[];
    /**
     * Business category. This can be either an empty string or one of the predefined business categories.
     * @see BusinessVerticalEnum for all available options
     */
    vertical?: BusinessVerticalEnum | string;
}

export interface BusinessProfileResponse {
    data: BusinessProfileData[];
}

export interface UpdateBusinessProfileRequest {
    /**
     * The messaging service used for the request. Always set it to "whatsapp" if you are using
     * the WhatsApp Business API.
     * @required
     */
    messaging_product: string;
    /**
     * The business's About text. This text appears in the business's profile, beneath its profile image,
     * phone number, and contact buttons.
     * - String cannot be empty
     * - Strings must be between 1 and 139 characters
     * - Rendered emojis are supported however their unicode values are not.
     *   Emoji unicode values must be Java- or JavaScript-escape encoded
     * - Hyperlinks can be included but will not render as clickable links
     * - Markdown is not supported
     */
    about?: string;
    /**
     * Address of the business. Character limit 256.
     */
    address?: string;
    /**
     * Description of the business. Character limit 512.
     */
    description?: string;
    /**
     * Business category. This can be either an empty string or one of the predefined business categories.
     * @see BusinessVerticalEnum for all available options
     */
    vertical?: BusinessVerticalEnum | string;
    /**
     * The contact email address (in valid email format) of the business. Character limit 128.
     */
    email?: string;
    /**
     * The URLs associated with the business. For instance, a website, Facebook Page, or Instagram.
     * - You must include the http:// or https:// portion of the URL
     * - There is a maximum of 2 websites with a maximum of 256 characters each
     */
    websites?: string[];
    /**
     * Handle of the profile picture. This handle is generated when you upload the binary file
     * for the profile picture to Meta using the Resumable Upload API.
     */
    profile_picture_handle?: string;
}

export interface UploadSession {
    id: string;
    video?: boolean;
}

export interface UploadSessionResponse {
    id: string;
}

export interface UploadHandle {
    handle: string;
    file_size: number;
    upload_result: {
        handle_type: string;
        name: string;
    };
}

export interface BusinessProfileClass {
    /**
     * Get your business profile.
     * @param fields Fields to be returned in the response. If not specified, all fields will be returned.
     * Possible values: about, address, description, email, profile_picture_url, websites, vertical
     */
    getBusinessProfile(fields?: string): Promise<RequesterResponseInterface<BusinessProfileResponse>>;

    /**
     * Update your business profile.
     * @param updateRequest The request object containing the fields to update.
     */
    updateBusinessProfile(
        updateRequest: UpdateBusinessProfileRequest,
    ): Promise<RequesterResponseInterface<ResponseSuccess>>;

    /**
     * Create an upload session for profile picture.
     * @param fileLength Length of the file to be uploaded in bytes.
     * @param fileType MIME type of the file (e.g., 'image/jpeg').
     * @param fileName Name of the file.
     */
    createUploadSession(
        fileLength: number,
        fileType: string,
        fileName: string,
    ): Promise<RequesterResponseInterface<UploadSessionResponse>>;

    /**
     * Upload media file to the upload session.
     * @param uploadId The ID of the upload session.
     * @param file The binary data of the file.
     */
    uploadMedia(uploadId: string, file: Buffer): Promise<RequesterResponseInterface<ResponseSuccess>>;

    /**
     * Get the upload handle information.
     * @param uploadId The ID of the upload session.
     */
    getUploadHandle(uploadId: string): Promise<RequesterResponseInterface<UploadHandle>>;
}
