// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/pg/

import type {
    IndiaOrderHeader,
    IndiaOrderSimpleText,
    OrderDetailsInInput,
    OrderDetailsInParameters,
    OrderDetailsInteractiveObjectIn,
    OrderDetailsTemplateButtonComponentIn,
    OrderStatusInInput,
    OrderStatusInteractiveObjectIn,
    OrderStatusTemplateComponentIn,
    OrderStatusTemplateInputIn,
} from '../types/payments-in';

export type BuildOrderDetailsInOptions = {
    body: IndiaOrderSimpleText;
    footer?: IndiaOrderSimpleText;
    header?: IndiaOrderHeader;
    parameters: OrderDetailsInInput;
};

export type BuildOrderStatusInOptions = {
    body: IndiaOrderSimpleText;
    footer?: IndiaOrderSimpleText;
    header?: IndiaOrderHeader;
    parameters: OrderStatusInInput;
};

function toOrderSimpleText(body: string | IndiaOrderSimpleText): IndiaOrderSimpleText {
    return typeof body === 'string' ? { text: body } : body;
}

function applyInDefaults(orderDetails: OrderDetailsInInput): OrderDetailsInParameters {
    return {
        ...orderDetails,
        payment_type: 'upi',
        currency: 'INR',
    };
}

export function buildOrderDetailsInteractiveIn(options: BuildOrderDetailsInOptions): OrderDetailsInteractiveObjectIn {
    return {
        type: 'order_details',
        ...(options.header ? { header: options.header } : {}),
        body: options.body,
        ...(options.footer ? { footer: options.footer } : {}),
        action: {
            name: 'review_and_pay',
            parameters: applyInDefaults(options.parameters),
        },
    };
}

export function buildOrderStatusInteractiveIn(options: BuildOrderStatusInOptions): OrderStatusInteractiveObjectIn {
    return {
        type: 'order_status',
        ...(options.header ? { header: options.header } : {}),
        body: options.body,
        ...(options.footer ? { footer: options.footer } : {}),
        action: {
            name: 'review_order',
            parameters: options.parameters,
        },
    };
}

export function buildOrderDetailsTemplateButtonIn(
    orderDetails: OrderDetailsInInput,
    index = 0,
): OrderDetailsTemplateButtonComponentIn {
    return {
        type: 'button',
        sub_type: 'order_details',
        index,
        parameters: [
            {
                type: 'action',
                action: {
                    order_details: applyInDefaults(orderDetails),
                },
            },
        ],
    };
}

export function buildOrderStatusTemplateComponentIn(
    orderStatus: OrderStatusTemplateInputIn,
): OrderStatusTemplateComponentIn {
    return {
        type: 'order_status',
        parameters: [
            {
                type: 'order_status',
                order_status: orderStatus,
            },
        ],
    };
}

export { toOrderSimpleText as toIndiaOrderSimpleText };
