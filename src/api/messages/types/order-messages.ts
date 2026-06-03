// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/orders/

import type { MessageRecipientType } from './common';
import type { OrderHeaderObject, OrderSimpleText } from './orders/common';
import type { BrazilPixDynamicCode, OrderDetailsBrInput, OrderStatusBrInput } from './orders/orders-br';
import type { OrderDetailsInInput, OrderStatusInInput } from './orders/orders-in';

type OrderInteractiveBaseParams = {
    to: string;
    recipientType?: MessageRecipientType;
    replyMessageId?: string;
    body: string | OrderSimpleText;
    footer?: OrderSimpleText;
    header?: OrderHeaderObject;
};

export type OrderDetailsBrMessageParams = OrderInteractiveBaseParams & {
    orderDetails: OrderDetailsBrInput;
};

export type OrderDetailsPixBrMessageParams = OrderInteractiveBaseParams & {
    pix: BrazilPixDynamicCode;
    orderDetails: Omit<OrderDetailsBrInput, 'payment_settings'>;
};

export type OrderStatusBrMessageParams = OrderInteractiveBaseParams & {
    orderStatus: OrderStatusBrInput;
};

export type OrderDetailsInMessageParams = OrderInteractiveBaseParams & {
    orderDetails: OrderDetailsInInput;
};

export type OrderStatusInMessageParams = OrderInteractiveBaseParams & {
    orderStatus: OrderStatusInInput;
};
