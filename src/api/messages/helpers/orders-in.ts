// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/pg/

import type { OrderHeaderObject, OrderSimpleText } from '../types/orders/common';
import type {
    OrderDetailsInInput,
    OrderDetailsInteractiveObjectIn,
    OrderStatusInInput,
    OrderStatusInteractiveObjectIn,
} from '../types/orders/orders-in';
import { toOrderSimpleText } from './orders-br';

export type BuildOrderDetailsInOptions = {
    body: OrderSimpleText;
    footer?: OrderSimpleText;
    header?: OrderHeaderObject;
    parameters: OrderDetailsInInput;
};

export type BuildOrderStatusInOptions = {
    body: OrderSimpleText;
    footer?: OrderSimpleText;
    header?: OrderHeaderObject;
    parameters: OrderStatusInInput;
};

export function buildOrderDetailsInteractiveIn(options: BuildOrderDetailsInOptions): OrderDetailsInteractiveObjectIn {
    return {
        type: 'order_details',
        ...(options.header ? { header: options.header } : {}),
        body: options.body,
        ...(options.footer ? { footer: options.footer } : {}),
        action: {
            name: 'review_and_pay',
            parameters: {
                ...options.parameters,
                payment_type: 'upi',
                currency: 'INR',
            },
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

export { toOrderSimpleText };
