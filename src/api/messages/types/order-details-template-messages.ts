// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/orderdetailstemplate/

import type { ComponentTypesEnum } from '../../../types/enums';
import type { MessageRecipientType } from './common';
import type { BrazilPixDynamicCode, OrderDetailsBrInput } from './orders/orders-br';
import type { OrderDetailsInInput } from './orders/orders-in';
import type { MessageTemplateObject } from './template';
import type { OrderDetailsTemplateLanguage } from './template-order-details';

type OrderDetailsTemplateComponents = NonNullable<MessageTemplateObject<ComponentTypesEnum>['components']>;

export type OrderDetailsTemplateBrMessageParams = {
    to: string;
    recipientType?: MessageRecipientType;
    replyMessageId?: string;
    template: {
        name: string;
        language: OrderDetailsTemplateLanguage;
        components?: OrderDetailsTemplateComponents;
    };
    orderDetails: OrderDetailsBrInput;
    buttonIndex?: number;
};

export type OrderDetailsTemplatePixBrMessageParams = Omit<OrderDetailsTemplateBrMessageParams, 'orderDetails'> & {
    pix: BrazilPixDynamicCode;
    orderDetails: Omit<OrderDetailsBrInput, 'payment_settings'>;
};

export type OrderDetailsTemplateInMessageParams = {
    to: string;
    recipientType?: MessageRecipientType;
    replyMessageId?: string;
    template: {
        name: string;
        language: OrderDetailsTemplateLanguage;
        components?: OrderDetailsTemplateComponents;
    };
    orderDetails: OrderDetailsInInput;
    buttonIndex?: number;
};
