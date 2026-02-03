// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/

import { MessageTypesEnum } from '../../../types/enums';
import { MessageRequestBody, MessageRequestParams } from './common';

// Text Message Types
export type TextObject = {
    body: string;
    preview_url?: boolean;
};

export type TextMessageRequestBody = MessageRequestBody<MessageTypesEnum.Text> & {
    [MessageTypesEnum.Text]: [TextObject];
};

export interface TextMessageParams extends MessageRequestParams<TextObject | string> {
    previewUrl?: boolean;
}
