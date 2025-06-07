import { BaseAPI } from '@shared/types/base';
import type { WabaConfigType } from '@shared/types/config';
import { HttpMethodsEnum, WabaConfigEnum } from '@shared/types/enums';
import type { RequesterClass, ResponsePagination, ResponseSuccess } from '@shared/types/request';
import { objectToQueryString } from '@shared/utils/objectToQueryString';
import type {
    TemplateClass,
    TemplateDeleteParams,
    TemplateGetParams,
    TemplateRequestBody,
    TemplateResponse,
} from './types';

export default class TemplateApi extends BaseAPI implements TemplateClass {
    private readonly endpoint = 'message_templates';

    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    async getTemplate(templateId: string): Promise<TemplateResponse> {
        return this.sendJson(HttpMethodsEnum.Get, `${templateId}`, this.config[WabaConfigEnum.RequestTimeout], null);
    }

    async updateTemplate(templateId: string, template: Partial<TemplateRequestBody>): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${templateId}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(template),
        );
    }

    async getTemplates(params?: TemplateGetParams): Promise<ResponsePagination<TemplateResponse>> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/${this.endpoint}${objectToQueryString(params ?? {})}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async createTemplate(template: TemplateRequestBody): Promise<TemplateResponse> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(template),
        );
    }

    async deleteTemplate(params: TemplateDeleteParams): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Delete,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/${this.endpoint}${objectToQueryString(params)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }
}
