import type { WabaConfigType } from '../types/config';
import {
    ComponentTypesEnum,
    HttpMethodsEnum,
    InteractiveTypesEnum,
    MessageTypesEnum,
    WabaConfigEnum,
} from '../types/enums';

import * as m from '../types/messages';
import type { RequesterClass, RequesterResponseInterface } from '../types/request';
import BaseAPI from './base';

/**
 * Maps each message type to its appropriate payload type
 */
export type MessagePayloadType<T extends MessageTypesEnum> = T extends MessageTypesEnum.Audio
    ? m.AudioMediaObject
    : T extends MessageTypesEnum.Contacts
      ? [m.ContactObject]
      : T extends MessageTypesEnum.Document
        ? m.DocumentMediaObject
        : T extends MessageTypesEnum.Image
          ? m.ImageMediaObject
          : T extends MessageTypesEnum.Interactive
            ? m.InteractiveObject
            : T extends MessageTypesEnum.Location
              ? m.LocationObject
              : T extends MessageTypesEnum.Template
                ? m.MessageTemplateObject<ComponentTypesEnum>
                : T extends MessageTypesEnum.Sticker
                  ? m.StickerMediaObject
                  : T extends MessageTypesEnum.Text
                    ? m.TextObject
                    : T extends MessageTypesEnum.Video
                      ? m.VideoMediaObject
                      : T extends MessageTypesEnum.Reaction
                        ? { message_id: string; emoji: string }
                        : never;

export default class MessagesApi extends BaseAPI implements m.MessagesClass {
    private readonly commonMethod = HttpMethodsEnum.Post;
    private readonly commonEndpoint = 'messages';

    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    /**
     * Builds the request body for WhatsApp API messages
     * @param type The type of message to send
     * @param payload The message payload object
     * @param toNumber The recipient's phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns The formatted request body
     */
    bodyBuilder<T extends MessageTypesEnum>(
        type: T,
        payload: MessagePayloadType<T>,
        to: string,
        replyMessageId?: string,
    ) {
        const body: m.MessageRequestBody<T> = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type,
            [type]: payload,
        };

        if (replyMessageId) body['context'] = { message_id: replyMessageId };

        return body;
    }

    /**
     * Sends a request to the WhatsApp API
     * @param body The request body to send
     * @returns Promise with the API response
     */
    private send(body: BodyInit | null): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.client.sendRequest(
            this.commonMethod,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.commonEndpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            body,
        );
    }

    /**
     * Sends an audio message via WhatsApp
     * @param body The audio media object
     * @param to Recipient's phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the message response
     */
    async audio(
        body: m.AudioMediaObject,
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Audio, body, to, replyMessageId)));
    }

    /**
     * Sends a contact card via WhatsApp
     * @param body The contact object
     * @param to Recipient's phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the message response
     */
    async contacts(
        body: [m.ContactObject],
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Contacts, body, to, replyMessageId)));
    }

    /**
     * Sends a document via WhatsApp
     * @param body The document media object
     * @param to Recipient's phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the message response
     */
    async document(
        body: m.DocumentMediaObject,
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Document, body, to, replyMessageId)));
    }

    /**
     * Sends an image via WhatsApp
     * @param body The image media object
     * @param to Recipient's phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the message response
     */
    async image(
        body: m.ImageMediaObject,
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Image, body, to, replyMessageId)));
    }

    /**
     * Sends an interactive message via WhatsApp
     * @param body The interactive object (buttons, lists, etc.)
     * @param to Recipient's phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the message response
     */
    async interactive(
        body: m.InteractiveObject,
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Interactive, body, to, replyMessageId)));
    }

    /**
     * Sends a location via WhatsApp
     * @param body The location object with coordinates
     * @param to Recipient's phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the message response
     */
    async location(
        body: m.LocationObject,
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Location, body, to, replyMessageId)));
    }

    /**
     * Sends a sticker via WhatsApp
     * @param body The sticker media object
     * @param to Recipient's phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the message response
     */
    async sticker(
        body: m.StickerMediaObject,
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Sticker, body, to, replyMessageId)));
    }

    /**
     * Sends a template message via WhatsApp
     * @param body The message template object
     * @param to Recipient's phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the message response
     */
    async template(
        body: m.MessageTemplateObject<ComponentTypesEnum>,
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Template, body, to, replyMessageId)));
    }

    /**
     * Sends a text message via WhatsApp
     * @param body The text object containing the message
     * @param to Recipient's phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the message response
     */
    async text(
        body: m.TextObject,
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Text, body, to, replyMessageId)));
    }

    /**
     * Sends a video via WhatsApp
     * @param body The video media object
     * @param to Recipient's phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the message response
     */
    async video(
        body: m.VideoMediaObject,
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Video, body, to, replyMessageId)));
    }

    /**
     * Updates message status (used for read receipts and typing indicators)
     * @param body The status object
     * @returns Promise with the response
     */
    async status(body: m.StatusObject): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        const bodyToSend = {
            messaging_product: 'whatsapp',
            ...body,
        };

        return this.send(JSON.stringify(bodyToSend));
    }

    /**
     * Marks a message as read in WhatsApp
     * @param messageId ID of the message to mark as read
     * @returns Promise with the response
     */
    async markAsRead(messageId: string): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.status({
            status: 'read',
            message_id: messageId,
        });
    }

    /**
     * Marks a message as read and shows a typing indicator in WhatsApp
     * @param messageId ID of the message to mark as read
     * @returns Promise with the response
     */
    async showTypingIndicator(messageId: string): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.status({
            status: 'read',
            message_id: messageId,
            typing_indicator: {
                type: 'text',
            },
        });
    }

    /**
     * Sends an interactive list message
     * @param body The list message content
     * @param to Recipient phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the response
     */
    async interactiveList(
        body: m.InteractiveObject & { type: InteractiveTypesEnum.List },
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Interactive, body, to, replyMessageId)));
    }

    /**
     * Sends an interactive CTA URL message
     * @param body The CTA URL message content
     * @param to Recipient phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the response
     */
    async interactiveCtaUrl(
        body: m.InteractiveObject & { type: InteractiveTypesEnum.CtaUrl },
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Interactive, body, to, replyMessageId)));
    }

    /**
     * Sends a location request message
     * @param body The location request message content
     * @param to Recipient phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the response
     */
    async interactiveLocationRequest(
        body: m.InteractiveObject & { type: InteractiveTypesEnum.LocationRequest },
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Interactive, body, to, replyMessageId)));
    }

    /**
     * Sends an address message to request shipping address from the user
     * Note: This feature is only available for businesses based in India and their India customers
     * @param body The address message content
     * @param to Recipient phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the response
     */
    async interactiveAddressMessage(
        body: m.InteractiveObject & { type: InteractiveTypesEnum.AddressMessage },
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Interactive, body, to, replyMessageId)));
    }

    /**
     * Sends an interactive reply buttons message
     * @param body The reply buttons message content
     * @param to Recipient phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the response
     */
    async interactiveReplyButtons(
        body: m.InteractiveObject & { type: InteractiveTypesEnum.Button },
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Interactive, body, to, replyMessageId)));
    }

    /**
     * Sends an interactive Flow message
     * @param body The Flow message content
     * @param to Recipient phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the response
     */
    async interactiveFlow(
        body: m.InteractiveObject & { type: InteractiveTypesEnum.Flow },
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Interactive, body, to, replyMessageId)));
    }

    /**
     * Sends a reaction to a message (emoji response)
     * @param messageId ID of the message to react to
     * @param emoji The emoji to send as reaction (e.g. "😀", "❤️", "👍")
     * @param to Recipient phone number
     * @returns Promise with the response
     */
    async reaction(
        messageId: string,
        emoji: string,
        to: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        const body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to,
            type: 'reaction',
            reaction: {
                message_id: messageId,
                emoji: emoji,
            },
        };

        return this.send(JSON.stringify(body));
    }
}
