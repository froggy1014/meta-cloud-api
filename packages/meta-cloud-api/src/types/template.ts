import { CategoryEnum, LanguagesEnum, TemplateStatusEnum } from './enums';
import { GeneralRequestBody, RequesterResponseInterface, ResponsePagination, ResponseSuccess } from './request';

export type TemplateFormat = 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION';

export type PhoneNumberButton = {
    type: 'PHONE_NUMBER';
    text: string; // max 25 chars
    phone_number: string; // max 20 chars
};

export type URLButton = {
    type: 'URL';
    text: string; // max 25 chars
    url: string; // max 2000 chars
    example?: string[]; // Required if url contains variable
};

export type QuickReplyButton = {
    type: 'QUICK_REPLY';
    text: string; // max 25 chars
};

export type CopyCodeButton = {
    type: 'COPY_CODE';
    example: string; // max 15 chars
};

export type FlowButton = {
    type: 'FLOW';
    text: string; // max 25 chars
    flow_id?: string;
    flow_name?: string;
    flow_json?: string;
    flow_action?: 'navigate' | 'data_exchange';
    navigate_screen?: string;
};

export type MPMButton = {
    type: 'MPM';
};

export type OTPButton = {
    type: 'OTP';
};

export type SPMButton = {
    type: 'SPM';
};

export type TemplateButton =
    | PhoneNumberButton
    | URLButton
    | QuickReplyButton
    | CopyCodeButton
    | FlowButton
    | MPMButton
    | OTPButton
    | SPMButton;

export type TemplateHeaderExample = {
    header_text?: string[];
    header_text_named_params?: Array<{
        param_name: string;
        example: string;
    }>;
    header_handle?: string[];
};

export type TemplateHeader = {
    type: 'HEADER';
    format: TemplateFormat;
    text?: string; // max 60 chars
    example?: TemplateHeaderExample;
};

export type TemplateBody = {
    type: 'BODY';
    text: string; // max 1024 chars
    example?: {
        body_text?: Array<Array<string>>; // For positional parameters
        body_text_named_params?: Array<{
            param_name: string; // lowercase letters and underscores only
            example: string;
        }>; // For named parameters
    };
};

export type TemplateFooter = {
    type: 'FOOTER';
    text: string; // max 60 chars
};

export type ComponentTypes = TemplateHeader | TemplateBody | TemplateFooter | TemplateButton;

export type TemplateRequestBody = GeneralRequestBody & {
    name: string;
    language: LanguagesEnum;
    category?: CategoryEnum;
    components?: ComponentTypes[];
};

export type TemplateResponse = {
    id: string;
    status: string;
    language: LanguagesEnum;
    category: CategoryEnum;
    name: string;
    components: ComponentTypes[];
};

export type TemplateGetParams = {
    limit?: number;
    name?: string;
    language?: LanguagesEnum;
    category?: CategoryEnum;
    status?: TemplateStatusEnum;
};

export type TemplateDeleteParams = {
    hsm_id: string;
    name: string;
};

export declare class TemplateClass {
    getTemplate(templateId: string): Promise<RequesterResponseInterface<TemplateResponse>>;
    updateTemplate(
        templateId: string,
        template: Partial<TemplateRequestBody>,
    ): Promise<RequesterResponseInterface<ResponseSuccess>>;
    getTemplates(params: TemplateGetParams): Promise<RequesterResponseInterface<ResponsePagination<TemplateResponse>>>;
    createTemplate(template: TemplateRequestBody): Promise<RequesterResponseInterface<TemplateResponse>>;
    deleteTemplate(params: TemplateDeleteParams): Promise<RequesterResponseInterface<ResponseSuccess>>;
}
