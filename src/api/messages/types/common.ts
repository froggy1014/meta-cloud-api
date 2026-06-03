// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/

import type { BaseClass } from '../../../types/base';
import type { ComponentTypesEnum, InteractiveTypesEnum, MessageTypesEnum } from '../../../types/enums';
import type { GeneralRequestBody, ResponseSuccess } from '../../../types/request';

export type GeneralMessageBody = GeneralRequestBody & {
    /**
     * The Meta messaging product name.
     * @default 'whatsapp'
     */
    messaging_product: 'whatsapp';
};

export type StatusObject = {
    status: 'read' | 'typing';
    message_id: string;
    typing_indicator?: TypingIndicatorObject;
};

export type TypingIndicatorObject = {
    type: 'text';
};

export type StatusRequestBody = GeneralMessageBody & StatusObject;
export type StatusResponse = ResponseSuccess;

type ConTextObject = {
    message_id: string;
};

export type MessageRecipientType = 'individual' | 'group';

export type MessageRequestBody<T extends MessageTypesEnum> = GeneralMessageBody & {
    recipient_type?: MessageRecipientType;
    to: string;
    context?: ConTextObject;
    type?: T;
};

// Request Parameter Interfaces
export interface MessageRequestParams<T> {
    body: T;
    to: string;
    recipientType?: MessageRecipientType;
    replyMessageId?: string;
}

export interface StatusParams {
    status: StatusObject['status'];
    messageId: string;
    typingIndicator?: TypingIndicatorObject;
}

// Response Types
export type MessagesResponse = GeneralMessageBody & {
    contacts: Array<{
        input: string;
        wa_id: string;
    }>;
    messages: Array<{
        id: string;
        message_status?: 'accepted' | 'held_for_quality_assessment' | 'paused';
    }>;
};

// Messages API Class Interface - Complete definition
export declare class MessagesClass extends BaseClass {
    // Text messages
    text(params: import('./text').TextMessageParams): Promise<MessagesResponse>;

    // Template messages
    template(
        params: MessageRequestParams<import('./template').MessageTemplateObject<ComponentTypesEnum>>,
    ): Promise<MessagesResponse>;

    // Media messages
    audio(params: MessageRequestParams<import('./media').AudioMediaObject>): Promise<MessagesResponse>;
    document(params: MessageRequestParams<import('./media').DocumentMediaObject>): Promise<MessagesResponse>;
    image(params: MessageRequestParams<import('./media').ImageMediaObject>): Promise<MessagesResponse>;
    video(params: MessageRequestParams<import('./media').VideoMediaObject>): Promise<MessagesResponse>;
    sticker(params: MessageRequestParams<import('./media').StickerMediaObject>): Promise<MessagesResponse>;

    // Contact messages
    contacts(params: MessageRequestParams<import('./contact').ContactObject[]>): Promise<MessagesResponse>;

    // Location messages
    location(params: MessageRequestParams<import('./location').LocationObject>): Promise<MessagesResponse>;

    // Interactive messages
    interactive(params: MessageRequestParams<import('./interactive').InteractiveObject>): Promise<MessagesResponse>;
    interactiveList(
        params: MessageRequestParams<import('./interactive').InteractiveObject & { type: InteractiveTypesEnum.List }>,
    ): Promise<MessagesResponse>;
    interactiveCtaUrl(
        params: MessageRequestParams<
            import('./interactive').InteractiveObject & {
                type: InteractiveTypesEnum.CtaUrl;
            }
        >,
    ): Promise<MessagesResponse>;
    interactiveLocationRequest(
        params: MessageRequestParams<
            import('./interactive').InteractiveObject & {
                type: InteractiveTypesEnum.LocationRequest;
            }
        >,
    ): Promise<MessagesResponse>;
    interactiveAddressMessage(
        params: MessageRequestParams<
            import('./interactive').InteractiveObject & {
                type: InteractiveTypesEnum.AddressMessage;
            }
        >,
    ): Promise<MessagesResponse>;
    interactiveReplyButtons(
        params: MessageRequestParams<
            import('./interactive').InteractiveObject & {
                type: InteractiveTypesEnum.Button;
            }
        >,
    ): Promise<MessagesResponse>;
    interactiveFlow(
        params: MessageRequestParams<
            import('./interactive').InteractiveObject & {
                type: InteractiveTypesEnum.Flow;
            }
        >,
    ): Promise<MessagesResponse>;
    interactiveCarousel(
        params: MessageRequestParams<
            import('./interactive').InteractiveObject & {
                type: InteractiveTypesEnum.Carousel;
            }
        >,
    ): Promise<MessagesResponse>;
    interactiveOrderDetailsBr(
        params: import('./order-messages').OrderDetailsBrMessageParams,
    ): Promise<MessagesResponse>;
    interactiveOrderDetailsBrPix(
        params: import('./order-messages').OrderDetailsPixBrMessageParams,
    ): Promise<MessagesResponse>;
    interactiveOrderStatusBr(params: import('./order-messages').OrderStatusBrMessageParams): Promise<MessagesResponse>;
    interactiveOrderDetailsIn(
        params: import('./order-messages').OrderDetailsInMessageParams,
    ): Promise<MessagesResponse>;
    interactiveOrderStatusIn(params: import('./order-messages').OrderStatusInMessageParams): Promise<MessagesResponse>;
    templateOrderDetailsBr(
        params: import('./order-details-template-messages').OrderDetailsTemplateBrMessageParams,
    ): Promise<MessagesResponse>;
    templateOrderDetailsBrPix(
        params: import('./order-details-template-messages').OrderDetailsTemplatePixBrMessageParams,
    ): Promise<MessagesResponse>;
    templateOrderDetailsIn(
        params: import('./order-details-template-messages').OrderDetailsTemplateInMessageParams,
    ): Promise<MessagesResponse>;
    templateOrderStatus(
        params: import('./order-status-template-messages').OrderStatusTemplateMessageParams,
    ): Promise<MessagesResponse>;

    // Reaction and status messages
    reaction(params: import('./reaction').ReactionParams): Promise<MessagesResponse>;
    markAsRead(params: { messageId: string }): Promise<StatusResponse>;
    showTypingIndicator(params: { messageId: string }): Promise<StatusResponse>;
    status(params: StatusParams): Promise<StatusResponse>;
}
