import type { ResponseSuccess } from '../../../shared/types/request';

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
    getMediaById(mediaId: string, phone_number_id?: string): Promise<MediaResponse>;
    uploadMedia(file: File, messagingProduct?: string): Promise<UploadMediaResponse>;
    deleteMedia(mediaId: string, phone_number_id?: string): Promise<ResponseSuccess>;
    downloadMedia(mediaUrl: string): Promise<Blob>;
}
