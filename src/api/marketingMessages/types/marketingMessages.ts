// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/send-marketing-messages/

import type { ComponentTypesEnum } from '../../../types/enums';
import type { MessagesResponse, MessageTemplateObject } from '../../messages/types';

/**
 * Marketing Messages API Types
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/send-marketing-messages/
 */

export type MarketingMessageRequest = {
    /**
     * WhatsApp user phone number. Omit when addressing the user by `recipient`
     * (BSUID) instead.
     */
    to?: string;
    /**
     * Business-scoped user ID (BSUID) or parent BSUID of the recipient, used in
     * place of `to` for individual messages.
     *
     * Templates carrying `bid_spec` (max price) cannot be sent to a BSUID
     * recipient — that combination fails with error `131062`.
     */
    recipient?: string;
    template: MessageTemplateObject<ComponentTypesEnum>;
    message_activity_sharing?: boolean;
    product_policy?: 'CLOUD_API_FALLBACK' | 'STRICT';
};

export interface MarketingMessagesClass {
    sendTemplateMessage(params: MarketingMessageRequest): Promise<MessagesResponse>;
}
