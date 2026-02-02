import { BaseAPI } from '../../types/base';
import type { WabaConfigType } from '../../types/config';
import {
    type ComponentTypesEnum,
    HttpMethodsEnum,
    type InteractiveTypesEnum,
    MessageTypesEnum,
    WabaConfigEnum,
} from '../../types/enums';
import type { RequesterClass } from '../../types/request';

import type * as m from './types';

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
     * @param to The recipient's phone number
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
    private send(body: BodyInit | null): Promise<m.MessagesResponse> {
        return this.sendJson(
            this.commonMethod,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.commonEndpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            body,
        );
    }

    /**
     * Sends an audio message via WhatsApp
     * @param params The audio message parameter object
     * @returns Promise with the message response
     */
    async audio(params: m.MessageRequestParams<m.AudioMediaObject>): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Audio, body, to, replyMessageId)));
    }

    /**
     * Sends a contact card via WhatsApp
     * @param params The contact message parameter object
     * @returns Promise with the message response
     */
    async contacts(params: m.MessageRequestParams<[m.ContactObject]>): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Contacts, body, to, replyMessageId)));
    }

    /**
     * Sends a document via WhatsApp
     * @param params The document message parameter object
     * @returns Promise with the message response
     */
    async document(params: m.MessageRequestParams<m.DocumentMediaObject>): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Document, body, to, replyMessageId)));
    }

    /**
     * Sends an image via WhatsApp
     * @param params The image message parameter object
     * @returns Promise with the message response
     */
    async image(params: m.MessageRequestParams<m.ImageMediaObject>): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Image, body, to, replyMessageId)));
    }

    /**
     * Sends an interactive message via WhatsApp
     * @param params The interactive message parameter object
     * @returns Promise with the message response
     */
    async interactive(params: m.MessageRequestParams<m.InteractiveObject>): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Interactive, body, to, replyMessageId)));
    }

    /**
     * Sends a location via WhatsApp
     * @param params The location message parameter object
     * @returns Promise with the message response
     */
    async location(params: m.MessageRequestParams<m.LocationObject>): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Location, body, to, replyMessageId)));
    }

    /**
     * Sends a sticker via WhatsApp
     * @param params The sticker message parameter object
     * @returns Promise with the message response
     */
    async sticker(params: m.MessageRequestParams<m.StickerMediaObject>): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Sticker, body, to, replyMessageId)));
    }

    /**
     * Sends a template message via WhatsApp
     * @param params The template message parameter object
     * @returns Promise with the message response
     */
    async template(
        params: m.MessageRequestParams<m.MessageTemplateObject<ComponentTypesEnum>>,
    ): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Template, body, to, replyMessageId)));
    }

    /**
     * Sends a text message via WhatsApp
     * @param params The text message parameter object
     * @returns Promise with the message response
     */
    async text(params: m.TextMessageParams): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId, previewUrl } = params;

        // Handle both string and TextObject types
        const textPayload: m.TextObject =
            typeof body === 'string'
                ? { body, preview_url: previewUrl ?? true }
                : { ...body, preview_url: previewUrl ?? body.preview_url ?? true };

        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Text, textPayload, to, replyMessageId)));
    }

    /**
     * Sends a video message via WhatsApp
     * @param params The video message parameter object
     * @returns Promise with the message response
     */
    async video(params: m.MessageRequestParams<m.VideoMediaObject>): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Video, body, to, replyMessageId)));
    }

    /**
     * Updates message status (mark as read, etc.)
     * @param params The status update parameters
     * @returns Promise with the API response
     */
    async status(params: m.StatusParams): Promise<m.MessagesResponse> {
        const body = {
            messaging_product: 'whatsapp',
            status: params.status,
            message_id: params.messageId,
            ...(params.typingIndicator && { typing_indicator: params.typingIndicator }),
        };

        return this.send(JSON.stringify(body));
    }

    /**
     * Marks a message as read
     * @param params Object containing messageId
     * @returns Promise with the API response
     */
    async markAsRead(params: { messageId: string }): Promise<m.MessagesResponse> {
        return this.status({
            status: 'read',
            messageId: params.messageId,
        });
    }

    /**
     * Shows typing indicator
     * @param params Object containing messageId
     * @returns Promise with the API response
     */
    async showTypingIndicator(params: { messageId: string }): Promise<m.MessagesResponse> {
        return this.status({
            status: 'read',
            messageId: params.messageId,
            typingIndicator: { type: 'text' },
        });
    }

    /**
     * Sends a list interactive message
     * @param params The list interactive message parameters
     * @returns Promise with the message response
     */
    async interactiveList(
        params: m.MessageRequestParams<m.InteractiveObject & { type: InteractiveTypesEnum.List }>,
    ): Promise<m.MessagesResponse> {
        return this.interactive(params);
    }

    /**
     * Sends a CTA URL interactive message
     * @param params The CTA URL interactive message parameters
     * @returns Promise with the message response
     */
    async interactiveCtaUrl(
        params: m.MessageRequestParams<m.InteractiveObject & { type: InteractiveTypesEnum.CtaUrl }>,
    ): Promise<m.MessagesResponse> {
        return this.interactive(params);
    }

    /**
     * Sends a location request interactive message
     * @param params The location request interactive message parameters
     * @returns Promise with the message response
     */
    async interactiveLocationRequest(
        params: m.MessageRequestParams<m.InteractiveObject & { type: InteractiveTypesEnum.LocationRequest }>,
    ): Promise<m.MessagesResponse> {
        return this.interactive(params);
    }

    /**
     * Sends an address message interactive message
     * @param params The address message interactive message parameters
     * @returns Promise with the message response
     */
    async interactiveAddressMessage(
        params: m.MessageRequestParams<m.InteractiveObject & { type: InteractiveTypesEnum.AddressMessage }>,
    ): Promise<m.MessagesResponse> {
        return this.interactive(params);
    }

    /**
     * Sends a reply buttons interactive message
     * @param params The reply buttons interactive message parameters
     * @returns Promise with the message response
     */
    async interactiveReplyButtons(
        params: m.MessageRequestParams<m.InteractiveObject & { type: InteractiveTypesEnum.Button }>,
    ): Promise<m.MessagesResponse> {
        return this.interactive(params);
    }

    /**
     * Sends a flow interactive message
     * @param params The flow interactive message parameters
     * @returns Promise with the message response
     */
    async interactiveFlow(
        params: m.MessageRequestParams<m.InteractiveObject & { type: InteractiveTypesEnum.Flow }>,
    ): Promise<m.MessagesResponse> {
        return this.interactive(params);
    }

    /**
     * Sends a carousel interactive message
     * @param params The carousel interactive message parameters
     * @returns Promise with the message response
     */
    async interactiveCarousel(
        params: m.MessageRequestParams<m.InteractiveObject & { type: InteractiveTypesEnum.Carousel }>,
    ): Promise<m.MessagesResponse> {
        return this.interactive(params);
    }

    /**
     * Sends a reaction to a message
     * @param params The reaction parameters
     * @returns Promise with the message response
     */
    async reaction(params: m.ReactionParams): Promise<m.MessagesResponse> {
        const reactionPayload = {
            message_id: params.messageId,
            emoji: params.emoji,
        };

        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Reaction, reactionPayload, params.to)));
    }
}
