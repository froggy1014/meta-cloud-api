// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/orders/
// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/orderdetailstemplate/
// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/payment-request-cta/

import type { ComponentTypesEnum } from '../../../types/enums';
import type { MessageRecipientType } from './common';
import type { MessageTemplateObject } from './template';

// ---------------------------------------------------------------------------
// Primitives (Brazil-only; duplicated from India on purpose)
// ---------------------------------------------------------------------------

export type BrazilOrderAmount = {
    value: number;
    offset: number;
};

export type BrazilOrderAmountWithDescription = BrazilOrderAmount & {
    description?: string;
};

export type BrazilOrderDiscount = BrazilOrderAmountWithDescription & {
    discount_program_name?: string;
};

export type BrazilOrderItem = {
    retailer_id: string;
    name: string;
    amount: BrazilOrderAmount;
    quantity: number;
    sale_amount?: BrazilOrderAmount;
};

export type BrazilOrderExpiration = {
    timestamp: string;
    description: string;
};

export type BrazilOrder = {
    status: 'pending';
    catalog_id?: string;
    expiration?: BrazilOrderExpiration;
    items: BrazilOrderItem[];
    subtotal: BrazilOrderAmount;
    tax: BrazilOrderAmountWithDescription;
    shipping?: BrazilOrderAmountWithDescription;
    discount?: BrazilOrderDiscount;
};

export type BrazilOrderGoodsType = 'digital-goods' | 'physical-goods';

export type BrazilOrderStatusValue =
    | 'pending'
    | 'processing'
    | 'partially_shipped'
    | 'shipped'
    | 'completed'
    | 'canceled';

export type BrazilPaymentStatusValue = 'pending' | 'captured' | 'failed';

export type BrazilOrderStatusPayment = {
    status: BrazilPaymentStatusValue;
    timestamp?: number;
};

export type BrazilOrderStatusOrder = {
    status: BrazilOrderStatusValue;
    description?: string;
};

export type BrazilOrderSimpleText = {
    text: string;
};

export type BrazilOrderHeader = {
    type: 'document' | 'image' | 'text' | 'video';
    document?: {
        id?: string;
        link?: string;
        filename?: string;
    };
    image?: {
        id?: string;
        link?: string;
    };
    text?: string;
    video?: {
        id?: string;
        link?: string;
    };
};

// ---------------------------------------------------------------------------
// Order details payment settings
// ---------------------------------------------------------------------------

export type BrazilPixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP';

export type BrazilPixDynamicCode = {
    code: string;
    merchant_name: string;
    key: string;
    key_type: BrazilPixKeyType;
};

export type BrazilBoleto = {
    digitable_line: string;
};

export type BrazilPaymentLink = {
    uri: string;
};

export type BrazilOffsiteCardPay = {
    last_four_digits: string;
    credential_id: string;
};

export type BrazilPaymentSetting =
    | { type: 'pix_dynamic_code'; pix_dynamic_code: BrazilPixDynamicCode }
    | { type: 'boleto'; boleto: BrazilBoleto }
    | { type: 'payment_link'; payment_link: BrazilPaymentLink }
    | { type: 'offsite_card_pay'; offsite_card_pay: BrazilOffsiteCardPay };

// ---------------------------------------------------------------------------
// Payment Request CTA payment settings (simpler pix shape than order_details)
// ---------------------------------------------------------------------------

export type BrazilPaymentRequestPixCode = {
    code: string;
};

export type BrazilPaymentRequestBoleto = {
    digitable_line: string;
};

export type BrazilPaymentRequestPaymentLink = {
    uri: string;
};

export type BrazilPaymentRequestSetting =
    | { type: 'pix_dynamic_code'; pix_dynamic_code: BrazilPaymentRequestPixCode }
    | { type: 'boleto'; boleto: BrazilPaymentRequestBoleto }
    | { type: 'payment_link'; payment_link: BrazilPaymentRequestPaymentLink };

// ---------------------------------------------------------------------------
// Interactive order_details / order_status
// ---------------------------------------------------------------------------

export type OrderDetailsBrParameters = {
    reference_id: string;
    type: BrazilOrderGoodsType;
    payment_type: 'br';
    payment_settings?: BrazilPaymentSetting[];
    currency: 'BRL';
    total_amount: BrazilOrderAmount;
    order?: BrazilOrder;
};

export type OrderDetailsBrAction = {
    name: 'review_and_pay';
    parameters: OrderDetailsBrParameters;
};

export type OrderDetailsInteractiveObjectBr = {
    type: 'order_details';
    header?: BrazilOrderHeader;
    body: BrazilOrderSimpleText;
    footer?: BrazilOrderSimpleText;
    action: OrderDetailsBrAction;
};

export type OrderStatusBrParameters = {
    reference_id: string;
    order?: BrazilOrderStatusOrder;
    payment?: BrazilOrderStatusPayment;
};

export type OrderStatusBrAction = {
    name: 'review_order';
    parameters: OrderStatusBrParameters;
};

export type OrderStatusInteractiveObjectBr = {
    type: 'order_status';
    header?: BrazilOrderHeader;
    body: BrazilOrderSimpleText;
    footer?: BrazilOrderSimpleText;
    action: OrderStatusBrAction;
};

/** Parameters for order_details without auto-filled Brazil fields. */
export type OrderDetailsBrInput = Omit<OrderDetailsBrParameters, 'payment_type' | 'currency'>;

/** Parameters for order_status messages. */
export type OrderStatusBrInput = OrderStatusBrParameters;

/** Pix-only order_details input. */
export type OrderDetailsPixBrInput = OrderDetailsBrInput & {
    pix: BrazilPixDynamicCode;
};

// ---------------------------------------------------------------------------
// Order details template (send)
// ---------------------------------------------------------------------------

export type OrderDetailsTemplateActionParameterBr = {
    type: 'action';
    action: {
        order_details: OrderDetailsBrParameters;
    };
};

export type OrderDetailsTemplateButtonComponentBr = {
    type: 'button';
    sub_type: 'order_details';
    index: number;
    parameters: [OrderDetailsTemplateActionParameterBr];
};

export type OrderDetailsTemplateLanguageBr = {
    policy: 'deterministic';
    code: string;
};

type OrderDetailsTemplateComponentsBr = NonNullable<MessageTemplateObject<ComponentTypesEnum>['components']>;

export type OrderDetailsTemplateBrMessageParams = {
    to: string;
    recipientType?: MessageRecipientType;
    replyMessageId?: string;
    template: {
        name: string;
        language: OrderDetailsTemplateLanguageBr;
        components?: OrderDetailsTemplateComponentsBr;
    };
    orderDetails: OrderDetailsBrInput;
    buttonIndex?: number;
};

export type OrderDetailsTemplatePixBrMessageParams = Omit<OrderDetailsTemplateBrMessageParams, 'orderDetails'> & {
    pix: BrazilPixDynamicCode;
    orderDetails: Omit<OrderDetailsBrInput, 'payment_settings'>;
};

// ---------------------------------------------------------------------------
// Order status template (send)
// ---------------------------------------------------------------------------

export type OrderStatusTemplateInputBr = {
    reference_id: string;
    order?: BrazilOrderStatusOrder;
    payment?: BrazilOrderStatusPayment;
};

export type OrderStatusTemplateParameterBr = {
    type: 'order_status';
    order_status: OrderStatusTemplateInputBr;
};

export type OrderStatusTemplateComponentBr = {
    type: 'order_status';
    parameters: [OrderStatusTemplateParameterBr];
};

export type OrderStatusTemplateLanguageBr = {
    policy: 'deterministic';
    code: string;
};

type OrderStatusTemplateComponentsBr = NonNullable<MessageTemplateObject<ComponentTypesEnum>['components']>;

export type OrderStatusTemplateBrMessageParams = {
    region: 'br';
    to: string;
    recipientType?: MessageRecipientType;
    replyMessageId?: string;
    template: {
        name: string;
        language: OrderStatusTemplateLanguageBr;
        components?: OrderStatusTemplateComponentsBr;
    };
    orderStatus: OrderStatusTemplateInputBr;
};

// ---------------------------------------------------------------------------
// Payment Request CTA template (send)
// ---------------------------------------------------------------------------

export type PaymentRequestTemplateActionParameterBr = {
    type: 'action';
    action: {
        payment_request: {
            payment_setting: BrazilPaymentRequestSetting;
        };
    };
};

export type PaymentRequestTemplateButtonComponentBr = {
    type: 'button';
    sub_type: 'payment_request';
    index: number | string;
    parameters: [PaymentRequestTemplateActionParameterBr];
};

export type PaymentRequestTemplateLanguageBr = {
    code: string;
};

type PaymentRequestTemplateComponentsBr = NonNullable<MessageTemplateObject<ComponentTypesEnum>['components']>;

export type PaymentRequestTemplateButtonBr = {
    paymentSetting: BrazilPaymentRequestSetting;
    index?: number;
};

export type PaymentRequestTemplateBrMessageParams = {
    to: string;
    recipientType?: MessageRecipientType;
    replyMessageId?: string;
    template: {
        name: string;
        language: PaymentRequestTemplateLanguageBr;
        components?: PaymentRequestTemplateComponentsBr;
    };
    paymentRequests: PaymentRequestTemplateButtonBr[];
};

// ---------------------------------------------------------------------------
// Interactive message API params
// ---------------------------------------------------------------------------

type OrderInteractiveBaseParamsBr = {
    to: string;
    recipientType?: MessageRecipientType;
    replyMessageId?: string;
    body: string | BrazilOrderSimpleText;
    footer?: BrazilOrderSimpleText;
    header?: BrazilOrderHeader;
};

export type OrderDetailsBrMessageParams = OrderInteractiveBaseParamsBr & {
    orderDetails: OrderDetailsBrInput;
};

export type OrderDetailsPixBrMessageParams = OrderInteractiveBaseParamsBr & {
    pix: BrazilPixDynamicCode;
    orderDetails: Omit<OrderDetailsBrInput, 'payment_settings'>;
};

export type OrderStatusBrMessageParams = OrderInteractiveBaseParamsBr & {
    orderStatus: OrderStatusBrInput;
};
