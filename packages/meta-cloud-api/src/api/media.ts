import type { WabaConfigType } from '../types/config';
import { HttpMethodsEnum, WabaConfigEnum } from '../types/enums';
import type { MediaClass, MediaResponse, UploadMediaResponse } from '../types/media';
import type { RequesterClass, RequesterResponseInterface, ResponseSuccess } from '../types/request';
import BaseAPI from './base';

export default class MediaAPI extends BaseAPI implements MediaClass {
    private readonly endpoint = 'media';

    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    async getMediaById(mediaId: string): Promise<RequesterResponseInterface<MediaResponse>> {
        return this.sendJson(HttpMethodsEnum.Get, `${mediaId}`, this.config[WabaConfigEnum.RequestTimeout], null);
    }

    async uploadMedia(
        file: File,
        messagingProduct: string = 'whatsapp',
    ): Promise<RequesterResponseInterface<UploadMediaResponse>> {
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

    async deleteMedia(mediaId: string): Promise<RequesterResponseInterface<ResponseSuccess>> {
        return this.sendJson(HttpMethodsEnum.Delete, `${mediaId}`, this.config[WabaConfigEnum.RequestTimeout], null);
    }

    async downloadMedia(mediaUrl: string): Promise<RequesterResponseInterface<Blob>> {
        return this.sendJson(HttpMethodsEnum.Get, mediaUrl, this.config[WabaConfigEnum.RequestTimeout], null);
    }
}
