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
export type * from './payments-br';
export type * from './payments-in';
export type { ReactionParams } from './reaction';
export * from './template';
export type { TextMessageParams, TextObject } from './text';

/** @deprecated Use OrderStatusTemplateBrMessageParams or OrderStatusTemplateInMessageParams */
export type OrderStatusTemplateMessageParams =
    | import('./payments-br').OrderStatusTemplateBrMessageParams
    | import('./payments-in').OrderStatusTemplateInMessageParams;

/** @deprecated Use OrderStatusTemplateInputBr or OrderStatusTemplateInputIn */
export type OrderStatusTemplateInput =
    | import('./payments-br').OrderStatusTemplateInputBr
    | import('./payments-in').OrderStatusTemplateInputIn;

/** @deprecated Use OrderStatusTemplateComponentBr or OrderStatusTemplateComponentIn */
export type OrderStatusTemplateComponent =
    | import('./payments-br').OrderStatusTemplateComponentBr
    | import('./payments-in').OrderStatusTemplateComponentIn;

/** @deprecated Use OrderDetailsTemplateLanguageBr or OrderDetailsTemplateLanguageIn */
export type OrderDetailsTemplateLanguage =
    | import('./payments-br').OrderDetailsTemplateLanguageBr
    | import('./payments-in').OrderDetailsTemplateLanguageIn;

/** @deprecated Use region-specific order amount types */
export type OrderAmount = import('./payments-br').BrazilOrderAmount;

/** @deprecated Use BrazilOrder or IndiaOrder */
export type OrderDetailsOrder = import('./payments-br').BrazilOrder;

/** @deprecated Use BrazilOrderGoodsType or IndiaOrderGoodsType */
export type OrderGoodsType = import('./payments-br').BrazilOrderGoodsType;

/** @deprecated Use BrazilOrderStatusValue or IndiaOrderStatusValue */
export type OrderStatusValue = import('./payments-br').BrazilOrderStatusValue;

/** @deprecated Use BrazilPaymentStatusValue or IndiaPaymentStatusValue */
export type PaymentStatusValue = import('./payments-br').BrazilPaymentStatusValue;

/** @deprecated Use BrazilOrderStatusPayment or IndiaOrderStatusPayment */
export type OrderStatusPayment = import('./payments-br').BrazilOrderStatusPayment;

/** @deprecated Use BrazilOrderSimpleText or IndiaOrderSimpleText */
export type OrderSimpleText = import('./payments-br').BrazilOrderSimpleText;

/** @deprecated Use BrazilOrderHeader or IndiaOrderHeader */
export type OrderHeaderObject = import('./payments-br').BrazilOrderHeader;

/** @deprecated Use OrderDetailsTemplateButtonComponentBr or OrderDetailsTemplateButtonComponentIn */
export type OrderDetailsTemplateComponent =
    | import('./payments-br').OrderDetailsTemplateButtonComponentBr
    | import('./payments-in').OrderDetailsTemplateButtonComponentIn;
