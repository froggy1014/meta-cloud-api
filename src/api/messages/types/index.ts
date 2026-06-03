// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/

// 중복 export 제거, 명시적 export만 사용
export type {
    GeneralMessageBody,
    MessageRecipientType,
    MessageRequestBody,
    MessageRequestParams,
    MessagesClass,
    MessagesResponse,
    StatusParams,
    StatusResponse,
} from './common';
export type { ContactObject } from './contact';
export type { InteractiveObject } from './interactive';
export type { LocationObject } from './location';
export type {
    AudioMediaObject,
    DocumentMediaObject,
    ImageMediaObject,
    StickerMediaObject,
    VideoMediaObject,
} from './media';
export type {
    OrderDetailsTemplateBrMessageParams,
    OrderDetailsTemplateInMessageParams,
    OrderDetailsTemplatePixBrMessageParams,
} from './order-details-template-messages';
export type {
    OrderDetailsBrMessageParams,
    OrderDetailsInMessageParams,
    OrderDetailsPixBrMessageParams,
    OrderStatusBrMessageParams,
    OrderStatusInMessageParams,
} from './order-messages';
export type { OrderStatusTemplateMessageParams } from './order-status-template-messages';
export type * from './orders';
export type { ReactionParams } from './reaction';
export * from './template';
export type * from './template-order-details';
export type * from './template-order-status';
export type { TextMessageParams, TextObject } from './text';
