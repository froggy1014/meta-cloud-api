// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/orderstatustemplate/

import type { OrderStatusTemplateComponent, OrderStatusTemplateInput } from '../types/template-order-status';

export function buildOrderStatusTemplateComponent(orderStatus: OrderStatusTemplateInput): OrderStatusTemplateComponent {
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
