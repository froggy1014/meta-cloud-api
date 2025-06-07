import { BaseClass } from '@shared/types/base';
import { ComponentTypesEnum, InteractiveTypesEnum, MessageTypesEnum } from '@shared/types/enums';
import { GeneralRequestBody } from '@shared/types/request';

export type GeneralMessageBody = GeneralRequestBody & {
    /**
     * The Meta messaging product name.
     * @default 'whatsapp'
     */
    messaging_product: 'whatsapp';
};

export type StatusObject = {
    status: 'read';
    message_id: string;
    typing_indicator?: TypingIndicatorObject;
};

export type TypingIndicatorObject = {
    type: 'text';
};

export type StatusRequestBody = GeneralMessageBody & StatusObject;

type ConTextObject = {
    message_id: string;
};

export type MessageRequestBody<T extends MessageTypesEnum> = GeneralMessageBody & {
    recipient_type?: string;
    to: string;
    context?: ConTextObject;
    type?: T;
};

// Request Parameter Interfaces
export interface MessageRequestParams<T> {
    body: T;
    to: string;
    replyMessageId?: string;
}

export interface StatusParams {
    status: string;
    messageId: string;
    typingIndicator?: {
        type: string;
    };
}

// Response Types
export type MessagesResponse = GeneralMessageBody & {
    contacts: [
        {
            input: string;
            wa_id: string;
        },
    ];
    messages: [
        {
            id: string;
        },
    ];
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
    contacts(params: MessageRequestParams<[import('./contact').ContactObject]>): Promise<MessagesResponse>;

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

    // Reaction and status messages
    reaction(params: import('./reaction').ReactionParams): Promise<MessagesResponse>;
    markAsRead(params: { messageId: string }): Promise<MessagesResponse>;
    showTypingIndicator(params: { messageId: string }): Promise<MessagesResponse>;
    status(params: StatusParams): Promise<MessagesResponse>;
}
