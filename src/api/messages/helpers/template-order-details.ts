// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/orderdetailstemplate/

import type { BrazilPixDynamicCode, OrderDetailsBrInput } from '../types/orders/orders-br';
import type { OrderDetailsInInput } from '../types/orders/orders-in';
import type {
    OrderDetailsTemplateButtonComponentBr,
    OrderDetailsTemplateButtonComponentIn,
} from '../types/template-order-details';
import { buildPixPaymentSetting } from './orders-br';

function toOrderDetailsBrParameters(orderDetails: OrderDetailsBrInput) {
    return {
        ...orderDetails,
        payment_type: 'br' as const,
        currency: 'BRL' as const,
    };
}

function toOrderDetailsInParameters(orderDetails: OrderDetailsInInput) {
    return {
        ...orderDetails,
        payment_type: 'upi' as const,
        currency: 'INR' as const,
    };
}

export function buildOrderDetailsTemplateButtonBr(
    orderDetails: OrderDetailsBrInput,
    index = 0,
): OrderDetailsTemplateButtonComponentBr {
    return {
        type: 'button',
        sub_type: 'order_details',
        index,
        parameters: [
            {
                type: 'action',
                action: {
                    order_details: toOrderDetailsBrParameters(orderDetails),
                },
            },
        ],
    };
}

export function buildOrderDetailsTemplateButtonBrPix(
    orderDetails: Omit<OrderDetailsBrInput, 'payment_settings'>,
    pix: BrazilPixDynamicCode,
    index = 0,
): OrderDetailsTemplateButtonComponentBr {
    return buildOrderDetailsTemplateButtonBr(
        {
            ...orderDetails,
            payment_settings: [buildPixPaymentSetting(pix)],
        },
        index,
    );
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
                    order_details: toOrderDetailsInParameters(orderDetails),
                },
            },
        ],
    };
}
