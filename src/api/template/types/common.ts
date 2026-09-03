// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/

import type { CategoryEnum, LanguagesEnum, TemplateStatusEnum } from '../../../types/enums';
import type { GeneralRequestBody, ResponsePagination, ResponseSuccess } from '../../../types/request';

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

// Reusable carousel card types
export type CarouselCard = {
    card_index: number;
    components: ComponentTypes[];
};

export type MediaCarouselCard = {
    card_index: number;
    components: (TemplateHeader | TemplateBody | TemplateButtons)[];
};

export type ProductCarouselCard = {
    card_index: number;
    components: TemplateHeader[];
};

export type ComponentTypes =
    | TemplateHeader
    | TemplateBody
    | TemplateFooter
    | TemplateButtons
    | TemplateLimitedTimeOffer
    | TemplateCarousel;

/**
 * Max price ("bid") configuration for a marketing template.
 *
 * Max price is set per template, and templates carrying it must be sent through
 * the Marketing Messages API (`POST /{PHONE_NUMBER_ID}/marketing_messages`).
 * Sending one through the Cloud API `/messages` endpoint fails with error
 * `131061`; sending one to a BSUID recipient fails with error `131062`.
 * Omitting `optimization_spec` leaves the template on standard rate card pricing.
 *
 * As of August 31, 2026, eligible templates can be switched between rate card
 * pricing and max price without creating a new template — send
 * `optimization_spec` to `POST /{TEMPLATE_ID}` ({@link TemplateClass.updateTemplate}).
 *
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/pricing
 */
export type TemplateOptimizationSpec = {
    /** Bid strategy. Only `LOWEST_COST_WITH_BID_CAP` is currently accepted. */
    bid_strategy: 'LOWEST_COST_WITH_BID_CAP';
    /**
     * Maximum price per 1,000 message deliveries, in the smallest unit of the
     * WABA's currency. Multiply the desired per-delivery price by 1,000 after
     * converting it to the smallest unit.
     */
    bid_amount: number;
};

/**
 * @deprecated Meta deprecated `bid_spec` on template create/update on
 * July 31, 2026. Use {@link TemplateOptimizationSpec} with `optimization_spec`.
 */
export type TemplateBidSpec = {
    /** Maximum price per 1,000 message deliveries, in the WABA currency's smallest unit. */
    bid_amount: number;
};

export type TemplateRequestBody = GeneralRequestBody & {
    name: string;
    language: LanguagesEnum;
    category?: CategoryEnum;
    components?: ComponentTypes[];
    /** Max price configuration. Marketing templates only, MM API sends only. */
    optimization_spec?: TemplateOptimizationSpec;
    /**
     * @deprecated Deprecated by Meta on July 31, 2026. Use `optimization_spec`.
     */
    bid_spec?: TemplateBidSpec;
};

export type TemplateResponse = {
    id: string;
    status: string;
    language: LanguagesEnum;
    category: CategoryEnum;
    name: string;
    components: ComponentTypes[];
    /** Max price configuration, returned for templates created with one. */
    optimization_spec?: TemplateOptimizationSpec;
};

export type TemplateGetParams = {
    limit?: number;
    name?: string;
    language?: LanguagesEnum;
    category?: CategoryEnum;
    status?: TemplateStatusEnum;
};

export type TemplateDeleteParams = {
    hsm_id?: string;
    name: string;
};

export declare class TemplateClass {
    getTemplate(templateId: string): Promise<TemplateResponse>;
    updateTemplate(templateId: string, template: Partial<TemplateRequestBody>): Promise<ResponseSuccess>;
    getTemplates(params?: TemplateGetParams): Promise<ResponsePagination<TemplateResponse>>;
    createTemplate(template: TemplateRequestBody): Promise<TemplateResponse>;
    deleteTemplate(params: TemplateDeleteParams): Promise<ResponseSuccess>;
}
