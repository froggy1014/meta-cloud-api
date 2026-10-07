// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/

import type {
    ButtonPositionEnum,
    ComponentTypesEnum,
    CurrencyCodesEnum,
    LanguagesEnum,
    MessageTypesEnum,
    ParametersTypesEnum,
    SubTypeEnum,
} from '../../../types/enums';
import type { MessageRequestBody } from './common';

// Template Message Types
type LanguageObject = {
    policy: 'deterministic';
    code: LanguagesEnum | (string & {});
};

type ParametersObject<T extends ParametersTypesEnum> = {
    type: T;
};

type SimpleTextObject = {
    text: string;
};

type TextParametersObject = ParametersObject<ParametersTypesEnum.Text> & SimpleTextObject;
type CouponCodeParametersObject = ParametersObject<ParametersTypesEnum.CouponCode> & {
    coupon_code: string;
};

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

/**
 * Payment request CTA amount (Brazil). `value` is the amount multiplied by `offset`
 * (12.34 BRL is `{ value: 1234, offset: 100 }`); `offset` must be 100 for BRL.
 */
export type PaymentRequestAmount = {
    value: number;
    offset: number;
};

export type PaymentRequestSetting =
    | { type: 'pix_dynamic_code'; pix_dynamic_code: { code: string } }
    | { type: 'boleto'; boleto: { digitable_line: string } }
    | { type: 'payment_link'; payment_link: { uri: string } }
    | {
          type: 'offsite_card_pay';
          offsite_card_pay: {
              /** Last four card digits shown to the user for confirmation. */
              last_four_digits: string;
              /** Echoed in the payment confirmation webhook when provided. */
              credential_id?: string;
          };
      };

/**
 * `payment_request` object sent in a payment request CTA button component.
 * `currency` and `total_amount` are siblings of `payment_setting`: required for one-click
 * payment (`offsite_card_pay`), optional for Pix (amount shown to the user), and not used
 * for Boleto or Payment Link.
 * Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/payment-request-cta/
 */
export type PaymentRequestObject =
    | {
          payment_setting: Extract<PaymentRequestSetting, { type: 'offsite_card_pay' }>;
          currency: 'BRL';
          total_amount: PaymentRequestAmount;
      }
    | {
          payment_setting: Extract<PaymentRequestSetting, { type: 'pix_dynamic_code' }>;
          currency?: 'BRL';
          total_amount?: PaymentRequestAmount;
      }
    | {
          payment_setting: Extract<PaymentRequestSetting, { type: 'boleto' | 'payment_link' }>;
      };

export type PaymentRequestActionParametersObject = ParametersObject<ParametersTypesEnum.Action> & {
    action: {
        payment_request: PaymentRequestObject;
    };
};

type ButtonComponentObject = Omit<ComponentObject<ComponentTypesEnum.Button>, 'parameters'> & {
    parameters?: (TextParametersObject | PayloadParametersObject | PaymentRequestActionParametersObject)[];
    sub_type: SubTypeEnum;
    index: ButtonPositionEnum;
};

type PayloadParametersObject = ParametersObject<ParametersTypesEnum.Payload> & {
    payload: string;
};

export type MessageTemplateObject<T extends ComponentTypesEnum> = {
    name: string;
    language: LanguageObject;
    components?: (ComponentObject<T> | ButtonComponentObject)[];
};

export type MessageTemplateRequestBody<T extends ComponentTypesEnum> = MessageRequestBody<MessageTypesEnum.Template> &
    MessageTemplateObject<T>;
