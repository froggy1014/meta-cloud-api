// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/pg/

import type {
    OrderAmount,
    OrderDetailsOrder,
    OrderGoodsType,
    OrderHeaderObject,
    OrderSimpleText,
    OrderStatusOrder,
    OrderStatusPayment,
} from './common';

export type OrderDetailsInParameters = {
    reference_id: string;
    type: OrderGoodsType;
    payment_type: 'upi';
    payment_configuration: string;
    currency: 'INR';
    total_amount: OrderAmount;
    order?: OrderDetailsOrder;
};

export type OrderDetailsInAction = {
    name: 'review_and_pay';
    parameters: OrderDetailsInParameters;
};

export type OrderDetailsInteractiveObjectIn = {
    type: 'order_details';
    header?: OrderHeaderObject;
    body: OrderSimpleText;
    footer?: OrderSimpleText;
    action: OrderDetailsInAction;
};

export type OrderStatusInParameters = {
    reference_id: string;
    order?: OrderStatusOrder;
    payment?: OrderStatusPayment;
};

export type OrderStatusInAction = {
    name: 'review_order';
    parameters: OrderStatusInParameters;
};

export type OrderStatusInteractiveObjectIn = {
    type: 'order_status';
    header?: OrderHeaderObject;
    body: OrderSimpleText;
    footer?: OrderSimpleText;
    action: OrderStatusInAction;
};

/** Parameters for order_details without auto-filled India fields. */
export type OrderDetailsInInput = Omit<OrderDetailsInParameters, 'payment_type' | 'currency'>;

/** Parameters for order_status messages. */
export type OrderStatusInInput = OrderStatusInParameters;
