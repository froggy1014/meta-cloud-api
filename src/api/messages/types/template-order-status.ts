// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/orderstatustemplate/

import type { OrderStatusOrder, OrderStatusPayment } from './orders/common';

export type OrderStatusTemplateInput = {
    reference_id: string;
    order?: OrderStatusOrder;
    payment?: OrderStatusPayment;
};

export type OrderStatusTemplateParameter = {
    type: 'order_status';
    order_status: OrderStatusTemplateInput;
};

export type OrderStatusTemplateComponent = {
    type: 'order_status';
    parameters: [OrderStatusTemplateParameter];
};

export type OrderStatusTemplateLanguage = {
    policy: 'deterministic';
    code: string;
};
