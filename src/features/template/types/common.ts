import { CategoryEnum, LanguagesEnum, TemplateStatusEnum } from '@shared/types/enums';
import { GeneralRequestBody, ResponsePagination, ResponseSuccess } from '@shared/types/request';

export type TemplateFormat = 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION' | 'PRODUCT';

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
    action?: {
        thumbnail_product_retailer_id: string;
        sections: Array<{
            title?: string;
            product_items: Array<{
                product_retailer_id: string;
            }>;
        }>;
    };
};

export type OTPButton = {
    type: 'OTP';
};

export type SPMButton = {
    type: 'SPM';
    action?: {
        product_retailer_id: string;
    };
};

export type CatalogButton = {
    type: 'CATALOG';
    action?: {
        thumbnail_product_retailer_id: string;
    };
};

export type TemplateButton =
    | PhoneNumberButton
    | URLButton
    | QuickReplyButton
    | CopyCodeButton
    | FlowButton
    | MPMButton
    | OTPButton
    | SPMButton
    | CatalogButton;

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

export type TemplateButtons = {
    type: 'BUTTONS';
    buttons: TemplateButton[];
};

export type TemplateLimitedTimeOffer = {
    type: 'LIMITED_TIME_OFFER';
    limited_time_offer: {
        expiration_time_ms: number;
    };
};

export type TemplateCarousel = {
    type: 'CAROUSEL';
    cards: Array<{
        card_index: number;
        components: ComponentTypes[];
    }>;
};

export type ComponentTypes =
    | TemplateHeader
    | TemplateBody
    | TemplateFooter
    | TemplateButtons
    | TemplateLimitedTimeOffer
    | TemplateCarousel;

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
    getTemplate(templateId: string): Promise<TemplateResponse>;
    updateTemplate(templateId: string, template: Partial<TemplateRequestBody>): Promise<ResponseSuccess>;
    getTemplates(params?: TemplateGetParams): Promise<ResponsePagination<TemplateResponse>>;
    createTemplate(template: TemplateRequestBody): Promise<TemplateResponse>;
    deleteTemplate(params: TemplateDeleteParams): Promise<ResponseSuccess>;
}
