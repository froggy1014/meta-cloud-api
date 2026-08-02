// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/

import type { BaseClass } from '../../../types/base';
import type {
    ComponentTypesEnum,
    InteractiveTypesEnum,
    MessageCategoryEnum,
    MessageTypesEnum,
} from '../../../types/enums';
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

/**
 * Category of a Direct Send message. Omitting it is equivalent to `'service'`
 * and keeps the existing free-form Cloud API send behavior.
 *
 * @see {@link https://developers.facebook.com/documentation/business-messaging/whatsapp/direct-send/send-utility-and-authentication-messages | Direct Send}
 */
export type DirectSendCategory = MessageCategoryEnum | 'authentication' | 'service' | 'utility';

/**
 * Optional Direct Send configuration.
 *
 * Supplying `template_name` makes message-to-template attribution predictable:
 * Direct Send creates or reuses a template with that exact name instead of
 * auto-matching. Supported for `category: 'utility'` only.
 *
 * @see {@link https://developers.facebook.com/documentation/business-messaging/whatsapp/direct-send/business-named-templates | Business-named templates}
 */
export type DirectSendConfig = {
    /**
     * Unique template name within the WABA.
     * Lowercase alphanumeric characters and underscores only (`^[a-z0-9_]+$`), max 512 characters.
     */
    template_name?: string;
};

/** Direct Send options accepted by `MessagesApi.bodyBuilder`. */
export type DirectSendOptions = {
    category?: DirectSendCategory;
    directSendConfig?: DirectSendConfig;
};

export type MessageRequestBody<T extends MessageTypesEnum> = GeneralMessageBody & {
    recipient_type?: MessageRecipientType;
    to: string;
    context?: ConTextObject;
    type?: T;
    category?: DirectSendCategory;
    direct_send_config?: DirectSendConfig;
};

// Request Parameter Interfaces
export interface MessageRequestParams<T> {
    body: T;
    to: string;
    recipientType?: MessageRecipientType;
    replyMessageId?: string;
    /**
     * Direct Send category. Set to `'utility'` or `'authentication'` to send a
     * business-initiated message without a pre-approved template.
     */
    category?: DirectSendCategory;
    /** Direct Send configuration, applied only when {@link MessageRequestParams.category} is set. */
    directSendConfig?: DirectSendConfig;
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

export type EncryptedMessageRequest = {
    messaging_product: 'whatsapp';
    encrypted_contents: string;
};

export type EncryptedMessagesResponse = {
    encrypted_contents: string;
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
    interactiveVoiceCall(
        params: MessageRequestParams<
            import('./interactive').InteractiveObject & {
                type: InteractiveTypesEnum.VoiceCall;
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

    // Reaction and status messages
    reaction(params: import('./reaction').ReactionParams): Promise<MessagesResponse>;
    encrypted(params: EncryptedMessageRequest): Promise<EncryptedMessagesResponse>;
    markAsRead(params: { messageId: string }): Promise<StatusResponse>;
    showTypingIndicator(params: { messageId: string }): Promise<StatusResponse>;
    status(params: StatusParams): Promise<StatusResponse>;
}
