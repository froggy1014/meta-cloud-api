// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-profiles/

/**
 * Upload session information for creating upload sessions.
 */
export interface UploadSession {
    id: string;
    video?: boolean;
}

/**
 * Response from creating an upload session.
 */
export interface UploadSessionResponse {
    id: string;
}

/**
 * Response from uploading business profile media.
 */
export interface UploadBusinessProfileResponse {
    h: string;
}

/**
 * Upload handle information containing file details and handle.
 */
export interface UploadHandle {
    handle: string;
    file_size: number;
    upload_result: {
        handle_type: string;
        name: string;
    };
}

/**
 * Request parameters for creating upload session.
 */
export interface CreateUploadSessionParams {
    /**
     * Length of the file to be uploaded in bytes.
     */
    fileLength: number;
    /**
     * MIME type of the file (e.g., 'image/jpeg').
     */
    fileType: string;
    /**
     * Name of the file with extension.
     */
    fileName: string;
}

/**
 * Request parameters for uploading media.
 */
export interface UploadMediaParams {
    /**
     * The upload session ID from createUploadSession response.
     */
    uploadId: string;
    /**
     * The binary data of the file (Buffer).
     */
    file: Buffer;
}

/**
 * Request parameters for getting upload handle.
 */
export interface GetUploadHandleParams {
    /**
     * The upload session ID from createUploadSession response.
     */
    uploadId: string;
}
