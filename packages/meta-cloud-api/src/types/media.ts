import type { RequesterResponseInterface, ResponseSuccess } from './request';

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

export interface MediaClass {
    getMediaById(mediaId: string, phone_number_id?: string): Promise<RequesterResponseInterface<MediaResponse>>;
    uploadMedia(file: File, messagingProduct?: string): Promise<RequesterResponseInterface<UploadMediaResponse>>;
    deleteMedia(mediaId: string, phone_number_id?: string): Promise<RequesterResponseInterface<ResponseSuccess>>;
    downloadMedia(mediaUrl: string): Promise<RequesterResponseInterface<Blob>>;
}
