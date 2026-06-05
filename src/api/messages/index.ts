// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/

import MessagesApi from './MessageApi';

export default MessagesApi;

export type {
    AudioMediaObject,
    ContactObject,
    DocumentMediaObject,
    ImageMediaObject,
    InteractiveObject,
    LocationObject,
    MessageRecipientType,
    MessageRequestParams,
    MessagesResponse,
    MessageTemplateObject,
    ReactionParams,
    StatusParams,
    StatusResponse,
    StickerMediaObject,
    TextMessageParams,
    TextObject,
    VideoMediaObject,
} from './types';
export { MessagesApi, MessagesApi as MessageApi };
