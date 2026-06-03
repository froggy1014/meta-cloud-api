// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/orderdetailstemplate/

import type { OrderDetailsBrInput, OrderDetailsBrParameters } from './orders/orders-br';
import type { OrderDetailsInInput, OrderDetailsInParameters } from './orders/orders-in';

export type OrderDetailsTemplateActionParameterBr = {
    type: 'action';
    action: {
        order_details: OrderDetailsBrParameters;
    };
};

export type OrderDetailsTemplateActionParameterIn = {
    type: 'action';
    action: {
        order_details: OrderDetailsInParameters;
    };
};

export type OrderDetailsTemplateButtonComponentBr = {
    type: 'button';
    sub_type: 'order_details';
    index: number;
    parameters: [OrderDetailsTemplateActionParameterBr];
};

export type OrderDetailsTemplateButtonComponentIn = {
    type: 'button';
    sub_type: 'order_details';
    index: number;
    parameters: [OrderDetailsTemplateActionParameterIn];
};

export type OrderDetailsTemplateComponent =
    | OrderDetailsTemplateButtonComponentBr
    | OrderDetailsTemplateButtonComponentIn;

export type OrderDetailsTemplateLanguage = {
    policy: 'deterministic';
    code: string;
};

export type OrderDetailsTemplateBodyBase = {
    name: string;
    language: OrderDetailsTemplateLanguage;
};

export type OrderDetailsTemplateBrInput = OrderDetailsBrInput;
export type OrderDetailsTemplateInInput = OrderDetailsInInput;
