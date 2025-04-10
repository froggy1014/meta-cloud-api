import { objectToQueryString } from 'src/utils/objectToQueryString';
import type { WabaConfigType } from '../types/config';
import { HttpMethodsEnum, WabaConfigEnum } from '../types/enums';
import type { RequesterClass, RequesterResponseInterface, ResponsePagination, ResponseSuccess } from '../types/request';
import type {
    TemplateClass,
    TemplateDeleteParams,
    TemplateGetParams,
    TemplateRequestBody,
    TemplateResponse,
} from '../types/template';
import BaseAPI from './base';

export default class TemplateApi extends BaseAPI implements TemplateClass {
    private readonly endpoint = 'message_templates';

    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    async getTemplate(templateId: string): Promise<RequesterResponseInterface<TemplateResponse>> {
        return this.client.sendRequest(
            HttpMethodsEnum.Get,
            `${templateId}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async updateTemplate(
        templateId: string,
        template: Partial<TemplateRequestBody>,
    ): Promise<RequesterResponseInterface<ResponseSuccess>> {
        return this.client.sendRequest(
            HttpMethodsEnum.Post,
            `${templateId}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(template),
        );
    }

    async getTemplates(
        params: TemplateGetParams,
    ): Promise<RequesterResponseInterface<ResponsePagination<TemplateResponse>>> {
        return this.client.sendRequest(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/${this.endpoint}${objectToQueryString(params)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async createTemplate(template: TemplateRequestBody): Promise<RequesterResponseInterface<TemplateResponse>> {
        return this.client.sendRequest(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(template),
        );
    }

    async deleteTemplate(params: TemplateDeleteParams): Promise<RequesterResponseInterface<ResponseSuccess>> {
        return this.client.sendRequest(
            HttpMethodsEnum.Delete,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/${this.endpoint}${objectToQueryString(params)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }
}
