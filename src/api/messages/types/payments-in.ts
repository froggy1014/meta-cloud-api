// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/pg/
// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/orderstatustemplate/

import type { ComponentTypesEnum } from '../../../types/enums';
import type { MessageRecipientType } from './common';
import type { MessageTemplateObject } from './template';

// ---------------------------------------------------------------------------
// Primitives (India-only; duplicated from Brazil on purpose)
// ---------------------------------------------------------------------------

export type IndiaOrderAmount = {
    value: number;
    offset: number;
};

export type IndiaOrderAmountWithDescription = IndiaOrderAmount & {
    description?: string;
};

export type IndiaOrderDiscount = IndiaOrderAmountWithDescription & {
    discount_program_name?: string;
};

export type IndiaOrderItem = {
    retailer_id: string;
    name: string;
    amount: IndiaOrderAmount;
    quantity: number;
    sale_amount?: IndiaOrderAmount;
};

export type IndiaOrderExpiration = {
    timestamp: string;
    description: string;
};

export type IndiaOrder = {
    status: 'pending';
    catalog_id?: string;
    expiration?: IndiaOrderExpiration;
    items: IndiaOrderItem[];
    subtotal: IndiaOrderAmount;
    tax: IndiaOrderAmountWithDescription;
    shipping?: IndiaOrderAmountWithDescription;
    discount?: IndiaOrderDiscount;
};

export type IndiaOrderGoodsType = 'digital-goods' | 'physical-goods';

export type IndiaOrderStatusValue =
    | 'pending'
    | 'processing'
    | 'partially_shipped'
    | 'shipped'
    | 'completed'
    | 'canceled';

export type IndiaPaymentStatusValue = 'pending' | 'captured' | 'failed';

export type IndiaOrderStatusPayment = {
    status: IndiaPaymentStatusValue;
    timestamp?: number;
};

export type IndiaOrderStatusOrder = {
    status: IndiaOrderStatusValue;
    description?: string;
};

export type IndiaOrderSimpleText = {
    text: string;
};

export type IndiaOrderHeader = {
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
// Interactive order_details / order_status
// ---------------------------------------------------------------------------

export type OrderDetailsInParameters = {
    reference_id: string;
    type: IndiaOrderGoodsType;
    payment_type: 'upi';
    payment_configuration: string;
    currency: 'INR';
    total_amount: IndiaOrderAmount;
    order?: IndiaOrder;
};

export type OrderDetailsInAction = {
    name: 'review_and_pay';
    parameters: OrderDetailsInParameters;
};

export type OrderDetailsInteractiveObjectIn = {
    type: 'order_details';
    header?: IndiaOrderHeader;
    body: IndiaOrderSimpleText;
    footer?: IndiaOrderSimpleText;
    action: OrderDetailsInAction;
};

export type OrderStatusInParameters = {
    reference_id: string;
    order?: IndiaOrderStatusOrder;
    payment?: IndiaOrderStatusPayment;
};

export type OrderStatusInAction = {
    name: 'review_order';
    parameters: OrderStatusInParameters;
};

export type OrderStatusInteractiveObjectIn = {
    type: 'order_status';
    header?: IndiaOrderHeader;
    body: IndiaOrderSimpleText;
    footer?: IndiaOrderSimpleText;
    action: OrderStatusInAction;
};

/** Parameters for order_details without auto-filled India fields. */
export type OrderDetailsInInput = Omit<OrderDetailsInParameters, 'payment_type' | 'currency'>;

/** Parameters for order_status messages. */
export type OrderStatusInInput = OrderStatusInParameters;

// ---------------------------------------------------------------------------
// Order details template (send)
// ---------------------------------------------------------------------------

export type OrderDetailsTemplateActionParameterIn = {
    type: 'action';
    action: {
        order_details: OrderDetailsInParameters;
    };
};

export type OrderDetailsTemplateButtonComponentIn = {
    type: 'button';
    sub_type: 'order_details';
    index: number;
    parameters: [OrderDetailsTemplateActionParameterIn];
};

export type OrderDetailsTemplateLanguageIn = {
    policy: 'deterministic';
    code: string;
};

type OrderDetailsTemplateComponentsIn = NonNullable<MessageTemplateObject<ComponentTypesEnum>['components']>;

export type OrderDetailsTemplateInMessageParams = {
    to: string;
    recipientType?: MessageRecipientType;
    replyMessageId?: string;
    template: {
        name: string;
        language: OrderDetailsTemplateLanguageIn;
        components?: OrderDetailsTemplateComponentsIn;
    };
    orderDetails: OrderDetailsInInput;
    buttonIndex?: number;
};

// ---------------------------------------------------------------------------
// Order status template (send)
// ---------------------------------------------------------------------------

export type OrderStatusTemplateInputIn = {
    reference_id: string;
    order?: IndiaOrderStatusOrder;
    payment?: IndiaOrderStatusPayment;
};

export type OrderStatusTemplateParameterIn = {
    type: 'order_status';
    order_status: OrderStatusTemplateInputIn;
};

export type OrderStatusTemplateComponentIn = {
    type: 'order_status';
    parameters: [OrderStatusTemplateParameterIn];
};

export type OrderStatusTemplateLanguageIn = {
    policy: 'deterministic';
    code: string;
};

type OrderStatusTemplateComponentsIn = NonNullable<MessageTemplateObject<ComponentTypesEnum>['components']>;

export type OrderStatusTemplateInMessageParams = {
    region: 'in';
    to: string;
    recipientType?: MessageRecipientType;
    replyMessageId?: string;
    template: {
        name: string;
        language: OrderStatusTemplateLanguageIn;
        components?: OrderStatusTemplateComponentsIn;
    };
    orderStatus: OrderStatusTemplateInputIn;
};

// ---------------------------------------------------------------------------
// Interactive message API params
// ---------------------------------------------------------------------------

type OrderInteractiveBaseParamsIn = {
    to: string;
    recipientType?: MessageRecipientType;
    replyMessageId?: string;
    body: string | IndiaOrderSimpleText;
    footer?: IndiaOrderSimpleText;
    header?: IndiaOrderHeader;
};

export type OrderDetailsInMessageParams = OrderInteractiveBaseParamsIn & {
    orderDetails: OrderDetailsInInput;
};

export type OrderStatusInMessageParams = OrderInteractiveBaseParamsIn & {
    orderStatus: OrderStatusInInput;
};
