import type { ComponentTypesEnum } from '../../../types/enums';
import type { MessagesResponse, MessageTemplateObject } from '../../messages/types';

/**
 * Marketing Messages API Types
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/send-marketing-messages/
 */

export type MarketingMessageRequest = {
    to: string;
    template: MessageTemplateObject<ComponentTypesEnum>;
    message_activity_sharing?: boolean;
};

export interface MarketingMessagesClass {
    sendTemplateMessage(params: MarketingMessageRequest): Promise<MessagesResponse>;
}
