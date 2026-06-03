// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/orderstatustemplate/

import type { ComponentTypesEnum } from '../../../types/enums';
import type { MessageRecipientType } from './common';
import type { MessageTemplateObject } from './template';
import type { OrderStatusTemplateInput, OrderStatusTemplateLanguage } from './template-order-status';

type OrderStatusTemplateComponents = NonNullable<MessageTemplateObject<ComponentTypesEnum>['components']>;

export type OrderStatusTemplateMessageParams = {
    to: string;
    recipientType?: MessageRecipientType;
    replyMessageId?: string;
    template: {
        name: string;
        language: OrderStatusTemplateLanguage;
        components?: OrderStatusTemplateComponents;
    };
    orderStatus: OrderStatusTemplateInput;
};
