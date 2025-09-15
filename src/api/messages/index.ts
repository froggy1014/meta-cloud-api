import MessagesApi from './MessageApi';

export default MessagesApi;

export { MessagesApi, MessagesApi as MessageApi };

export type {
    AudioMediaObject,
    ContactObject,
    DocumentMediaObject,
    ImageMediaObject,
    InteractiveObject,
    LocationObject,
    MessageRequestParams,
    MessagesResponse,
    MessageTemplateObject,
    ReactionParams,
    StatusParams,
    StickerMediaObject,
    TextMessageParams,
    TextObject,
    VideoMediaObject,
} from './types';

export * from './builders';
