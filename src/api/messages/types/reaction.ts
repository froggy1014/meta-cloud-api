// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/

import type { MessageTypesEnum } from '../../../types/enums';
import type { MessageRecipientType, MessageRequestBody } from './common';

// Reaction Message Types
type ReActionObject = {
    message_id: string;
    emoji: string;
};

export type ReactionMessageRequestBody = MessageRequestBody<MessageTypesEnum.Reaction> & ReActionObject;

export interface ReactionParams {
    messageId: string;
    emoji: string;
    to?: string;
    /** Business-scoped user ID (BSUID) or parent BSUID; `to` takes precedence when both are set. */
    recipient?: string;
    recipientType?: MessageRecipientType;
}
