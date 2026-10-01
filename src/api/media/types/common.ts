// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/media/

import type { ResponseSuccess } from '../../../types/request';

export type MediaResponse = {
    id: string;
    url: string;
    mime_type: string;
    sha256: string;
    file_size: number;
    messaging_product: 'whatsapp';
};

export type MediasResponse = {
    data: MediaResponse[];
    paging: {
        cursors: {
            before: string;
            after: string;
        };
    };
};

export type UploadMediaResponse = {
    id: string;
};

/**
 * Media content accepted by `uploadMedia`.
 *
 * A `ReadableStream` is read fully into memory before the upload starts: Meta's endpoint takes
 * `multipart/form-data`, and `fetch` can only send a `FormData` part from a `Blob`.
 */
export type UploadMediaInput = Blob | File | Uint8Array | ArrayBuffer | ReadableStream<Uint8Array>;

export interface UploadMediaOptions {
    /**
     * MIME type sent as the `type` field and as the file part's content type, e.g. `image/jpeg`.
     * Required for `Uint8Array`, `ArrayBuffer` and `ReadableStream` input, and for a `Blob` without a
     * `type`. Overrides the `type` of a `Blob`/`File`.
     */
    type?: string;
    /** File name of the multipart part. Defaults to the `File` name, otherwise `file`. */
    filename?: string;
    /** Messaging product. Defaults to `'whatsapp'`. */
    messagingProduct?: string;
}

export interface MediaClass {
    getMediaById(mediaId: string): Promise<MediaResponse>;
    uploadMedia(file: File, messagingProduct?: string): Promise<UploadMediaResponse>;
    uploadMedia(file: UploadMediaInput, options?: UploadMediaOptions): Promise<UploadMediaResponse>;
    deleteMedia(mediaId: string): Promise<ResponseSuccess>;
    downloadMedia(mediaUrl: string): Promise<Blob>;
}
