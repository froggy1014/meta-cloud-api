import { CategoryEnum, CurrencyCodesEnum, LanguagesEnum } from '@shared/types/enums';
import type { TemplateFormat } from './common';

// Parameter types for template factory functions
export interface TextParameter {
    type: 'text';
    value: string;
}

export interface CurrencyParameter {
    type: 'currency';
    amount_1000: number; // Amount multiplied by 1000
    code: CurrencyCodesEnum;
    fallback_value: string;
}

export interface DateTimeParameter {
    type: 'date_time';
    fallback_value: string;
}

export interface MediaParameter {
    type: 'image' | 'video' | 'document';
    handle?: string; // Media handle from Resumable Upload API
    link?: string; // Media URL
}

export interface LocationParameter {
    type: 'location';
    latitude?: number;
    longitude?: number;
    name?: string;
    address?: string;
}

export interface ProductParameter {
    type: 'product';
    product_retailer_id: string;
}

export type TemplateParameter =
    | TextParameter
    | CurrencyParameter
    | DateTimeParameter
    | MediaParameter
    | LocationParameter
    | ProductParameter;

// Header factory options
export interface HeaderOptions {
    format: TemplateFormat;
    text?: string;
    parameters?: TemplateParameter[];
    example?: {
        header_text?: string[];
        header_text_named_params?: Array<{
            param_name: string;
            example: string;
        }>;
        header_handle?: string[];
    };
}

// Body factory options
export interface BodyOptions {
    text: string;
    parameters?: TemplateParameter[];
    example?: {
        body_text?: string[][];
        body_text_named_params?: Array<{
            param_name: string;
            example: string;
        }>;
    };
}

// Footer factory options
export interface FooterOptions {
    text: string;
}

// Button factory options
export interface ButtonOptions {
    phone_number?: {
        text: string;
        phone_number: string;
    };
    url?: {
        text: string;
        url: string;
        example?: string;
    };
    quick_reply?: {
        text: string;
    }[];
    copy_code?: {
        example: string;
    };
    flow?: {
        text: string;
        flow_id?: string;
        flow_name?: string;
        flow_json?: string;
        flow_action?: 'navigate' | 'data_exchange';
        navigate_screen?: string;
    };
    mpm?: boolean;
    otp?: boolean;
    spm?: boolean;
}

// Carousel options
export interface CarouselCard {
    image?: string; // Image handle
    video?: string; // Video handle
    product?: string; // Product retailer ID
    body?: string;
    bodyParameters?: TemplateParameter[];
    buttons?: ButtonOptions;
}

export interface CarouselOptions {
    cards: CarouselCard[];
}

// Limited Time Offer options
export interface LimitedTimeOfferOptions {
    expiration_time_ms: number;
}

// Product section for MPM
export interface ProductSection {
    title?: string;
    product_items: Array<{
        product_retailer_id: string;
    }>;
}

// Template creation options
export interface TemplateOptions {
    name: string;
    language: LanguagesEnum;
    category: CategoryEnum;
    header?: HeaderOptions;
    body?: BodyOptions;
    footer?: FooterOptions;
    buttons?: ButtonOptions;
    carousel?: CarouselOptions;
    limitedTimeOffer?: LimitedTimeOfferOptions;
}

// Specific template type options
export interface OTPTemplateOptions {
    name: string;
    language: LanguagesEnum;
    code_expiration_minutes?: number;
    add_security_recommendation?: boolean;
}

export interface AuthenticationTemplateOptions {
    name: string;
    language: LanguagesEnum;
    code_expiration_minutes?: number;
    add_security_recommendation?: boolean;
    copy_code_button?: boolean;
}

export interface CatalogTemplateOptions {
    name: string;
    language: LanguagesEnum;
    header?: Omit<HeaderOptions, 'format'>;
    body: BodyOptions;
    footer?: FooterOptions;
    thumbnail_product_retailer_id: string;
}

export interface CouponTemplateOptions {
    name: string;
    language: LanguagesEnum;
    header?: Omit<HeaderOptions, 'format'>;
    body: BodyOptions;
    footer?: FooterOptions;
    coupon_code: string;
}

export interface LimitedTimeOfferTemplateOptions {
    name: string;
    language: LanguagesEnum;
    header?: Omit<HeaderOptions, 'format'>;
    body: BodyOptions;
    footer?: FooterOptions;
    expiration_time_ms: number;
}

export interface MediaCardCarouselTemplateOptions {
    name: string;
    language: LanguagesEnum;
    cards: Array<{
        header: {
            format: 'IMAGE' | 'VIDEO';
            example: {
                header_handle: string[];
            };
        };
        body: BodyOptions;
        buttons?: ButtonOptions;
    }>;
}

export interface MPMTemplateOptions {
    name: string;
    language: LanguagesEnum;
    header?: Omit<HeaderOptions, 'format'>;
    body: BodyOptions;
    footer?: FooterOptions;
    thumbnail_product_retailer_id: string;
    sections: ProductSection[];
}

export interface ProductCardCarouselTemplateOptions {
    name: string;
    language: LanguagesEnum;
    header?: Omit<HeaderOptions, 'format'>;
    body: BodyOptions;
    footer?: FooterOptions;
    cards: Array<{
        product_retailer_id: string;
    }>;
}

export interface SPMTemplateOptions {
    name: string;
    language: LanguagesEnum;
    header?: Omit<HeaderOptions, 'format'>;
    body: BodyOptions;
    footer?: FooterOptions;
    product_retailer_id: string;
}
