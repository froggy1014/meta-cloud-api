import {
    ButtonPositionEnum,
    ComponentTypesEnum,
    CurrencyCodesEnum,
    LanguagesEnum,
    MessageTypesEnum,
    ParametersTypesEnum,
    SubTypeEnum,
} from '@shared/types/enums';
import { MessageRequestBody } from './common';

// Template Message Types
type LanguageObject = {
    policy: 'deterministic';
    code: LanguagesEnum;
};

type ParametersObject<T extends ParametersTypesEnum> = {
    type: T;
};

type SimpleTextObject = {
    text: string;
};

type TextParametersObject = ParametersObject<ParametersTypesEnum.Text> & SimpleTextObject;
type CouponCodeParametersObject = ParametersObject<ParametersTypesEnum.CouponCode> & SimpleTextObject;

type CurrencyObject = {
    fallback_value: string;
    code: CurrencyCodesEnum;
    amount_1000: number;
};

type CurrencyParametersObject = ParametersObject<ParametersTypesEnum.Currency> & {
    currency: CurrencyObject;
};

type DateTimeObject = {
    fallback_value: string;
};

type DateTimeParametersObject = ParametersObject<ParametersTypesEnum.Currency> & {
    date_time: DateTimeObject;
};

// Import media types to avoid circular dependencies
type DocumentMediaObject = {
    id?: string;
    link?: string;
    caption?: string;
    filename?: string;
};

type ImageMediaObject = {
    id?: string;
    link?: string;
    caption?: string;
};

type VideoMediaObject = {
    id?: string;
    link?: string;
    caption?: string;
};

type DocumentParametersObject = ParametersObject<ParametersTypesEnum.Document> & DocumentMediaObject;

type ImageParametersObject = ParametersObject<ParametersTypesEnum.Image> & ImageMediaObject;

type VideoParametersObject = ParametersObject<ParametersTypesEnum.Video> & VideoMediaObject;

type ComponentObject<T extends ComponentTypesEnum> = {
    type: T;
    parameters: (
        | CurrencyParametersObject
        | DateTimeParametersObject
        | DocumentParametersObject
        | ImageParametersObject
        | TextParametersObject
        | VideoParametersObject
        | CouponCodeParametersObject
    )[];
};

type ButtonComponentObject = ComponentObject<ComponentTypesEnum.Button> & {
    parameters: Array<ParametersTypesEnum>;
    sub_type: SubTypeEnum;
    index: ButtonPositionEnum;
};

export type MessageTemplateObject<T extends ComponentTypesEnum> = {
    name: string;
    language: LanguageObject;
    components?: (ComponentObject<T> | ButtonComponentObject)[];
};

export type MessageTemplateRequestBody<T extends ComponentTypesEnum> = MessageRequestBody<MessageTypesEnum.Template> &
    MessageTemplateObject<T>;
