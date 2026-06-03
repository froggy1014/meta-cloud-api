// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/orders/

import type {
    OrderAmount,
    OrderDetailsOrder,
    OrderGoodsType,
    OrderHeaderObject,
    OrderSimpleText,
    OrderStatusOrder,
    OrderStatusPayment,
} from './common';

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

export type OrderDetailsBrParameters = {
    reference_id: string;
    type: OrderGoodsType;
    payment_type: 'br';
    payment_settings?: BrazilPaymentSetting[];
    currency: 'BRL';
    total_amount: OrderAmount;
    order?: OrderDetailsOrder;
};

export type OrderDetailsBrAction = {
    name: 'review_and_pay';
    parameters: OrderDetailsBrParameters;
};

export type OrderDetailsInteractiveObjectBr = {
    type: 'order_details';
    header?: OrderHeaderObject;
    body: OrderSimpleText;
    footer?: OrderSimpleText;
    action: OrderDetailsBrAction;
};

export type OrderStatusBrParameters = {
    reference_id: string;
    order?: OrderStatusOrder;
    payment?: OrderStatusPayment;
};

export type OrderStatusBrAction = {
    name: 'review_order';
    parameters: OrderStatusBrParameters;
};

export type OrderStatusInteractiveObjectBr = {
    type: 'order_status';
    header?: OrderHeaderObject;
    body: OrderSimpleText;
    footer?: OrderSimpleText;
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
