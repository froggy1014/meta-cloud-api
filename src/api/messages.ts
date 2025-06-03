import type { WabaConfigType } from '../types/config';
import {
    type ComponentTypesEnum,
    HttpMethodsEnum,
    type InteractiveTypesEnum,
    MessageTypesEnum,
    WabaConfigEnum,
} from '../types/enums';

import type * as m from '../types/messages';
import type { RequesterClass } from '../types/request';
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

// Request object interface type definitions
export interface MessageRequestParams<T> {
    body: T;
    to: string;
    replyMessageId?: string;
}

export interface TextMessageParams extends MessageRequestParams<m.TextObject | string> {
    previewUrl?: boolean;
}

export interface ReactionParams {
    messageId: string;
    emoji: string;
    to: string;
}

export interface StatusParams {
    status: string;
    messageId: string;
    typingIndicator?: {
        type: string;
    };
}

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
        const { body, previewUrl, to, replyMessageId } = params;

        let textObject: m.TextObject;
        if (typeof body === 'string') {
            textObject = {
                body: body,
                preview_url: previewUrl,
            };
        } else {
            textObject = body;
        }

        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Text, textObject, to, replyMessageId)));
    }

    /**
     * Sends a video via WhatsApp
     * @param params The video message parameter object
     * @returns Promise with the message response
     */
    async video(params: m.MessageRequestParams<m.VideoMediaObject>): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Video, body, to, replyMessageId)));
    }

    /**
     * Updates message status (used for read receipts and typing indicators)
     * @param params The status update parameter object
     * @returns Promise with the response
     */
    async status(params: m.StatusParams): Promise<m.MessagesResponse> {
        const { status, messageId, typingIndicator } = params;

        const bodyToSend = {
            messaging_product: 'whatsapp',
            status: status,
            message_id: messageId,
            ...(typingIndicator && { typing_indicator: typingIndicator }),
        };

        return this.send(JSON.stringify(bodyToSend));
    }

    /**
     * Marks a message as read in WhatsApp
     * @param params The parameter object to mark message as read
     * @returns Promise with the response
     */
    async markAsRead(params: { messageId: string }): Promise<m.MessagesResponse> {
        return this.status({
            status: 'read',
            messageId: params.messageId,
        });
    }

    /**
     * Marks a message as read and shows a typing indicator in WhatsApp
     * @param params The typing indicator parameter object
     * @returns Promise with the response
     */
    async showTypingIndicator(params: { messageId: string }): Promise<m.MessagesResponse> {
        return this.status({
            status: 'read',
            messageId: params.messageId,
            typingIndicator: {
                type: 'text',
            },
        });
    }

    /**
     * Sends an interactive list message
     * @param params The list message parameter object
     * @returns Promise with the response
     */
    async interactiveList(
        params: m.MessageRequestParams<m.InteractiveObject & { type: InteractiveTypesEnum.List }>,
    ): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Interactive, body, to, replyMessageId)));
    }

    /**
     * Sends an interactive CTA URL message
     * @param params The CTA URL message parameter object
     * @returns Promise with the response
     */
    async interactiveCtaUrl(
        params: m.MessageRequestParams<m.InteractiveObject & { type: InteractiveTypesEnum.CtaUrl }>,
    ): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Interactive, body, to, replyMessageId)));
    }

    /**
     * Sends a location request message
     * @param params The location request message parameter object
     * @returns Promise with the response
     */
    async interactiveLocationRequest(
        params: m.MessageRequestParams<m.InteractiveObject & { type: InteractiveTypesEnum.LocationRequest }>,
    ): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Interactive, body, to, replyMessageId)));
    }

    /**
     * Sends an address message to request shipping address from the user
     * Note: This feature is only available for businesses based in India and their India customers
     * @param params The address message parameter object
     * @returns Promise with the response
     */
    async interactiveAddressMessage(
        params: m.MessageRequestParams<m.InteractiveObject & { type: InteractiveTypesEnum.AddressMessage }>,
    ): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Interactive, body, to, replyMessageId)));
    }

    /**
     * Sends an interactive reply buttons message
     * @param params The reply buttons message parameter object
     * @returns Promise with the response
     */
    async interactiveReplyButtons(
        params: m.MessageRequestParams<m.InteractiveObject & { type: InteractiveTypesEnum.Button }>,
    ): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Interactive, body, to, replyMessageId)));
    }

    /**
     * Sends an interactive Flow message
     * @param params The Flow message parameter object
     * @returns Promise with the response
     */
    async interactiveFlow(
        params: m.MessageRequestParams<m.InteractiveObject & { type: InteractiveTypesEnum.Flow }>,
    ): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;

        // Apply default values for FlowParameters
        if (body.action.parameters.flow_message_version === undefined) {
            body.action.parameters.flow_message_version = '3';
        }
        if (body.action.parameters.mode === undefined) {
            body.action.parameters.mode = 'published';
        }
        if (body.action.parameters.flow_action === undefined) {
            body.action.parameters.flow_action = 'navigate';
        }

        // Only include flow_action_payload when flow_action is navigate
        if (body.action.parameters.flow_action === 'navigate') {
            if (body.action.parameters.flow_action_payload?.screen === undefined) {
                body.action.parameters.flow_action_payload = {
                    ...body.action.parameters.flow_action_payload,
                    screen: 'INIT',
                };
            }
        } else if (body.action.parameters.flow_action === 'data_exchange') {
            // Remove flow_action_payload when flow_action is data_exchange
            delete body.action.parameters.flow_action_payload;
        }

        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Interactive, body, to, replyMessageId)));
    }

    /**
     * Sends a reaction to a message (emoji response)
     * @param params The reaction message parameter object
     * @returns Promise with the response
     */
    async reaction(params: m.ReactionParams): Promise<m.MessagesResponse> {
        const { messageId, emoji, to } = params;

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
