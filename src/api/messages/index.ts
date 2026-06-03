// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/

import MessagesApi from './MessageApi';

export default MessagesApi;

export {
    buildBoletoPaymentSetting,
    buildOffsiteCardPaySetting,
    buildOrderDetailsInteractiveBr,
    buildOrderDetailsInteractiveIn,
    buildOrderDetailsPixInteractiveBr,
    buildOrderDetailsTemplateButtonBr,
    buildOrderDetailsTemplateButtonBrPix,
    buildOrderDetailsTemplateButtonIn,
    buildOrderStatusInteractiveBr,
    buildOrderStatusInteractiveIn,
    buildOrderStatusTemplateComponent,
    buildPaymentLinkSetting,
    buildPixPaymentSetting,
    toOrderSimpleText,
} from './helpers';
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
