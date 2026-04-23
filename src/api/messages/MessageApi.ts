// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/

// Endpoints:
// - POST /{PHONE_NUMBER_ID}/messages

import { BaseAPI } from '../../types/base';
import {
    type ComponentTypesEnum,
    HttpMethodsEnum,
    type InteractiveTypesEnum,
    MessageTypesEnum,
    WabaConfigEnum,
} from '../../types/enums';
import { assertPhoneNumber } from '../../utils/validate';
import type * as m from './types';

/**
 * Maps each message type to its appropriate payload type.
 *
 * This conditional type resolves the correct payload interface based on the {@link MessageTypesEnum} value,
 * ensuring type-safe message construction at compile time.
 */
export type MessagePayloadType<T extends MessageTypesEnum> = T extends MessageTypesEnum.Audio
    ? m.AudioMediaObject
    : T extends MessageTypesEnum.Contacts
      ? m.ContactObject[]
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

/**
 * WhatsApp Messages API client for sending various message types.
 *
 * Provides methods to send text, media, interactive, template, location, contact,
 * reaction, and status messages through the WhatsApp Cloud API.
 *
 * **Endpoint:** `POST /{PHONE_NUMBER_ID}/messages`
 *
 * **Covered operations:**
 * - {@link MessagesApi.text | text} - Send plain text messages
 * - {@link MessagesApi.audio | audio} - Send audio messages
 * - {@link MessagesApi.image | image} - Send image messages
 * - {@link MessagesApi.video | video} - Send video messages
 * - {@link MessagesApi.document | document} - Send document messages
 * - {@link MessagesApi.sticker | sticker} - Send sticker messages
 * - {@link MessagesApi.location | location} - Send location messages
 * - {@link MessagesApi.contacts | contacts} - Send contact card(s)
 * - {@link MessagesApi.template | template} - Send template messages
 * - {@link MessagesApi.interactive | interactive} - Send interactive messages (generic)
 * - {@link MessagesApi.interactiveList | interactiveList} - Send list interactive messages
 * - {@link MessagesApi.interactiveCtaUrl | interactiveCtaUrl} - Send CTA URL interactive messages
 * - {@link MessagesApi.interactiveLocationRequest | interactiveLocationRequest} - Send location request messages
 * - {@link MessagesApi.interactiveAddressMessage | interactiveAddressMessage} - Send address message interactive messages
 * - {@link MessagesApi.interactiveReplyButtons | interactiveReplyButtons} - Send reply button interactive messages
 * - {@link MessagesApi.interactiveFlow | interactiveFlow} - Send flow interactive messages
 * - {@link MessagesApi.interactiveCarousel | interactiveCarousel} - Send carousel interactive messages
 * - {@link MessagesApi.reaction | reaction} - Send reaction emoji to a message
 * - {@link MessagesApi.status | status} - Update message status (read, typing)
 * - {@link MessagesApi.markAsRead | markAsRead} - Mark a message as read
 * - {@link MessagesApi.showTypingIndicator | showTypingIndicator} - Show typing indicator
 *
 * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages | WhatsApp Messages API Reference}
 * @see {@link https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/ | WhatsApp Messages Documentation}
 *
 * @example
 * ```ts
 * const client = new WhatsApp({ accessToken: '...', phoneNumberId: '...' });
 *
 * // Send a text message
 * await client.messages.text({ body: 'Hello!', to: '1234567890' });
 *
 * // Send an image
 * await client.messages.image({ body: { link: 'https://example.com/image.jpg' }, to: '1234567890' });
 * ```
 */
export default class MessagesApi extends BaseAPI implements m.MessagesClass {
    private readonly commonMethod = HttpMethodsEnum.Post;
    private readonly commonEndpoint = 'messages';

    /**
     * Builds the request body for WhatsApp API messages.
     *
     * Constructs a properly formatted message payload including the messaging product,
     * recipient type, recipient phone number, message type, and optional reply context.
     *
     * @param type - The type of message to send (e.g., text, image, template)
     * @param payload - The message payload object matching the specified type
     * @param to - The recipient's phone number in international format (e.g., "1234567890")
     * @param replyMessageId - Optional message ID to reply to, setting the message context
     * @returns The formatted request body ready to be serialized and sent
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages | Messages API Reference}
     *
     * @example
     * ```ts
     * const body = messagesApi.bodyBuilder(
     *   MessageTypesEnum.Text,
     *   { body: 'Hello!' },
     *   '1234567890',
     * );
     * ```
     */
    bodyBuilder<T extends MessageTypesEnum>(
        type: T,
        payload: MessagePayloadType<T>,
        to: string,
        replyMessageId?: string,
    ) {
        assertPhoneNumber(to);
        const body: m.MessageRequestBody<T> = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type,
            [type]: payload,
        };

        if (replyMessageId) body.context = { message_id: replyMessageId };

        return body;
    }

    /**
     * Sends a request to the WhatsApp Cloud API messages endpoint.
     *
     * Internal method that dispatches the serialized JSON body to
     * `POST /{PHONE_NUMBER_ID}/messages`.
     *
     * @param body - The serialized JSON request body to send
     * @returns A promise resolving to the WhatsApp messages API response containing the message ID
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages | Messages API Reference}
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
     * Sends an audio message via the WhatsApp Cloud API.
     *
     * The audio can be specified by a media ID (previously uploaded) or a public URL link.
     * Supported formats: audio/aac, audio/mp4, audio/mpeg, audio/amr, audio/ogg (with opus codec).
     * Maximum file size: 16 MB.
     *
     * @param params - The audio message parameters
     * @param params.body - Audio media object containing either `id` (media ID) or `link` (URL)
     * @param params.to - Recipient phone number in international format
     * @param params.replyMessageId - Optional message ID to reply to
     * @returns A promise resolving to the message response with the sent message ID
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#audio-object | Audio Object Reference}
     *
     * @example
     * ```ts
     * // Send audio by URL
     * await client.messages.audio({
     *   body: { link: 'https://example.com/audio.mp3' },
     *   to: '1234567890',
     * });
     *
     * // Send audio by media ID
     * await client.messages.audio({
     *   body: { id: 'media_id_123' },
     *   to: '1234567890',
     * });
     * ```
     */
    async audio(params: m.MessageRequestParams<m.AudioMediaObject>): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Audio, body, to, replyMessageId)));
    }

    /**
     * Sends one or more contact cards via the WhatsApp Cloud API.
     *
     * Contact messages allow sharing structured contact information including names,
     * phone numbers, email addresses, and more.
     *
     * @param params - The contact message parameters
     * @param params.body - Array of {@link m.ContactObject} containing contact details (name, phones, emails, etc.)
     * @param params.to - Recipient phone number in international format
     * @param params.replyMessageId - Optional message ID to reply to
     * @returns A promise resolving to the message response with the sent message ID
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#contacts-object | Contacts Object Reference}
     *
     * @example
     * ```ts
     * await client.messages.contacts({
     *   body: [{
     *     name: { formatted_name: 'John Doe', first_name: 'John', last_name: 'Doe' },
     *     phones: [{ phone: '+1234567890', type: 'MOBILE' }],
     *   }],
     *   to: '1234567890',
     * });
     * ```
     */
    async contacts(params: m.MessageRequestParams<m.ContactObject[]>): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Contacts, body, to, replyMessageId)));
    }

    /**
     * Sends a document message via the WhatsApp Cloud API.
     *
     * Documents can be specified by media ID or public URL. Supports various formats
     * including PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, and more.
     * Maximum file size: 100 MB.
     *
     * @param params - The document message parameters
     * @param params.body - Document media object containing `id` or `link`, and optional `caption` and `filename`
     * @param params.to - Recipient phone number in international format
     * @param params.replyMessageId - Optional message ID to reply to
     * @returns A promise resolving to the message response with the sent message ID
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#document-object | Document Object Reference}
     *
     * @example
     * ```ts
     * await client.messages.document({
     *   body: {
     *     link: 'https://example.com/report.pdf',
     *     caption: 'Monthly Report',
     *     filename: 'report.pdf',
     *   },
     *   to: '1234567890',
     * });
     * ```
     */
    async document(params: m.MessageRequestParams<m.DocumentMediaObject>): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Document, body, to, replyMessageId)));
    }

    /**
     * Sends an image message via the WhatsApp Cloud API.
     *
     * Images can be specified by media ID or public URL.
     * Supported formats: image/jpeg, image/png. Maximum file size: 5 MB.
     *
     * @param params - The image message parameters
     * @param params.body - Image media object containing `id` or `link`, and optional `caption`
     * @param params.to - Recipient phone number in international format
     * @param params.replyMessageId - Optional message ID to reply to
     * @returns A promise resolving to the message response with the sent message ID
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#image-object | Image Object Reference}
     *
     * @example
     * ```ts
     * await client.messages.image({
     *   body: { link: 'https://example.com/photo.jpg', caption: 'Check this out!' },
     *   to: '1234567890',
     * });
     * ```
     */
    async image(params: m.MessageRequestParams<m.ImageMediaObject>): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Image, body, to, replyMessageId)));
    }

    /**
     * Sends an interactive message via the WhatsApp Cloud API.
     *
     * Interactive messages allow rich user interactions such as lists, buttons, CTAs,
     * flows, location requests, address messages, and carousels. For type-specific
     * convenience methods, see {@link MessagesApi.interactiveList}, {@link MessagesApi.interactiveReplyButtons}, etc.
     *
     * @param params - The interactive message parameters
     * @param params.body - Interactive object containing the `type` and type-specific action/body/header/footer
     * @param params.to - Recipient phone number in international format
     * @param params.replyMessageId - Optional message ID to reply to
     * @returns A promise resolving to the message response with the sent message ID
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#interactive-object | Interactive Object Reference}
     *
     * @example
     * ```ts
     * await client.messages.interactive({
     *   body: {
     *     type: 'button',
     *     body: { text: 'Choose an option' },
     *     action: {
     *       buttons: [
     *         { type: 'reply', reply: { id: 'btn1', title: 'Option 1' } },
     *         { type: 'reply', reply: { id: 'btn2', title: 'Option 2' } },
     *       ],
     *     },
     *   },
     *   to: '1234567890',
     * });
     * ```
     */
    async interactive(params: m.MessageRequestParams<m.InteractiveObject>): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Interactive, body, to, replyMessageId)));
    }

    /**
     * Sends a location message via the WhatsApp Cloud API.
     *
     * Shares a geographic location with the recipient, displayed as a map pin.
     *
     * @param params - The location message parameters
     * @param params.body - Location object containing `latitude`, `longitude`, and optional `name` and `address`
     * @param params.to - Recipient phone number in international format
     * @param params.replyMessageId - Optional message ID to reply to
     * @returns A promise resolving to the message response with the sent message ID
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#location-object | Location Object Reference}
     *
     * @example
     * ```ts
     * await client.messages.location({
     *   body: {
     *     latitude: 37.4220936,
     *     longitude: -122.083922,
     *     name: 'Googleplex',
     *     address: '1600 Amphitheatre Parkway, Mountain View, CA',
     *   },
     *   to: '1234567890',
     * });
     * ```
     */
    async location(params: m.MessageRequestParams<m.LocationObject>): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Location, body, to, replyMessageId)));
    }

    /**
     * Sends a sticker message via the WhatsApp Cloud API.
     *
     * Stickers can be specified by media ID or public URL.
     * Supported format: image/webp. Maximum file size: 100 KB (animated), 500 KB (static).
     *
     * @param params - The sticker message parameters
     * @param params.body - Sticker media object containing `id` or `link`
     * @param params.to - Recipient phone number in international format
     * @param params.replyMessageId - Optional message ID to reply to
     * @returns A promise resolving to the message response with the sent message ID
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#sticker-object | Sticker Object Reference}
     *
     * @example
     * ```ts
     * await client.messages.sticker({
     *   body: { link: 'https://example.com/sticker.webp' },
     *   to: '1234567890',
     * });
     * ```
     */
    async sticker(params: m.MessageRequestParams<m.StickerMediaObject>): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Sticker, body, to, replyMessageId)));
    }

    /**
     * Sends a template message via the WhatsApp Cloud API.
     *
     * Template messages use pre-approved message templates and can include header,
     * body, and button components with dynamic parameters. Templates must be
     * approved before use.
     *
     * @param params - The template message parameters
     * @param params.body - Template object containing `name`, `language`, and optional `components`
     * @param params.to - Recipient phone number in international format
     * @param params.replyMessageId - Optional message ID to reply to
     * @returns A promise resolving to the message response with the sent message ID
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#template-object | Template Object Reference}
     *
     * @example
     * ```ts
     * await client.messages.template({
     *   body: {
     *     name: 'hello_world',
     *     language: { code: 'en_US' },
     *     components: [
     *       { type: 'body', parameters: [{ type: 'text', text: 'John' }] },
     *     ],
     *   },
     *   to: '1234567890',
     * });
     * ```
     */
    async template(
        params: m.MessageRequestParams<m.MessageTemplateObject<ComponentTypesEnum>>,
    ): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Template, body, to, replyMessageId)));
    }

    /**
     * Sends a text message via the WhatsApp Cloud API.
     *
     * Sends a plain text message. The `body` can be a string or a {@link m.TextObject}.
     * URL preview is enabled by default.
     *
     * @param params - The text message parameters
     * @param params.body - Message text as a string, or a {@link m.TextObject} with `body` and optional `preview_url`
     * @param params.to - Recipient phone number in international format
     * @param params.replyMessageId - Optional message ID to reply to
     * @param params.previewUrl - Whether to show a URL preview (defaults to `true`)
     * @returns A promise resolving to the message response with the sent message ID
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#text-object | Text Object Reference}
     *
     * @example
     * ```ts
     * // Simple text
     * await client.messages.text({ body: 'Hello, World!', to: '1234567890' });
     *
     * // With URL preview disabled
     * await client.messages.text({
     *   body: { body: 'Visit https://example.com', preview_url: false },
     *   to: '1234567890',
     * });
     * ```
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
     * Sends a video message via the WhatsApp Cloud API.
     *
     * Videos can be specified by media ID or public URL.
     * Supported formats: video/mp4, video/3gp. Maximum file size: 16 MB.
     * Only H.264 video codec and AAC audio codec are supported.
     *
     * @param params - The video message parameters
     * @param params.body - Video media object containing `id` or `link`, and optional `caption`
     * @param params.to - Recipient phone number in international format
     * @param params.replyMessageId - Optional message ID to reply to
     * @returns A promise resolving to the message response with the sent message ID
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#video-object | Video Object Reference}
     *
     * @example
     * ```ts
     * await client.messages.video({
     *   body: { link: 'https://example.com/video.mp4', caption: 'Watch this!' },
     *   to: '1234567890',
     * });
     * ```
     */
    async video(params: m.MessageRequestParams<m.VideoMediaObject>): Promise<m.MessagesResponse> {
        const { body, to, replyMessageId } = params;
        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Video, body, to, replyMessageId)));
    }

    /**
     * Updates the status of a message (e.g., mark as read or show typing indicator).
     *
     * This is the low-level status method. For convenience, use {@link MessagesApi.markAsRead}
     * or {@link MessagesApi.showTypingIndicator} instead.
     *
     * @param params - The status update parameters
     * @param params.status - The status to set (e.g., `'read'`, `'typing'`)
     * @param params.messageId - The ID of the message to update
     * @param params.typingIndicator - Optional typing indicator configuration
     * @returns A promise resolving to the API response
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#status-object | Status Object Reference}
     *
     * @example
     * ```ts
     * await client.messages.status({
     *   status: 'read',
     *   messageId: 'wamid.ABC123',
     * });
     * ```
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
     * Marks a message as read, sending a read receipt to the sender.
     *
     * This is a convenience wrapper around {@link MessagesApi.status} that sets the status to `'read'`.
     * When a message is marked as read, all previous messages in the conversation are also marked as read.
     *
     * @param params - The parameters
     * @param params.messageId - The ID of the incoming message to mark as read (the `wamid` value)
     * @returns A promise resolving to the API response
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#status-object | Status Object Reference}
     *
     * @example
     * ```ts
     * await client.messages.markAsRead({ messageId: 'wamid.ABC123' });
     * ```
     */
    async markAsRead(params: { messageId: string }): Promise<m.MessagesResponse> {
        return this.status({
            status: 'read',
            messageId: params.messageId,
        });
    }

    /**
     * Shows a typing indicator to the user, indicating that a response is being composed.
     *
     * The typing indicator is displayed for approximately 25 seconds or until a message
     * is sent, whichever comes first.
     *
     * @param params - The parameters
     * @param params.messageId - The ID of the incoming message to associate the typing indicator with
     * @returns A promise resolving to the API response
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#status-object | Status Object Reference}
     *
     * @example
     * ```ts
     * await client.messages.showTypingIndicator({ messageId: 'wamid.ABC123' });
     * ```
     */
    async showTypingIndicator(params: { messageId: string }): Promise<m.MessagesResponse> {
        const body = {
            messaging_product: 'whatsapp',
            status: 'typing',
            message_id: params.messageId,
            typing_indicator: { type: 'text' },
        };

        return this.send(JSON.stringify(body));
    }

    /**
     * Sends a list interactive message via the WhatsApp Cloud API.
     *
     * List messages present up to 10 selectable options in a menu-style list.
     * Each section can have a title and multiple rows with title, description, and ID.
     *
     * @param params - The list interactive message parameters
     * @param params.body - Interactive object with `type: 'list'` and action containing sections
     * @param params.to - Recipient phone number in international format
     * @param params.replyMessageId - Optional message ID to reply to
     * @returns A promise resolving to the message response with the sent message ID
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#list-messages | List Messages Reference}
     *
     * @example
     * ```ts
     * await client.messages.interactiveList({
     *   body: {
     *     type: 'list',
     *     body: { text: 'Choose an option' },
     *     action: {
     *       button: 'View Options',
     *       sections: [{ title: 'Section 1', rows: [{ id: '1', title: 'Option 1' }] }],
     *     },
     *   },
     *   to: '1234567890',
     * });
     * ```
     */
    async interactiveList(
        params: m.MessageRequestParams<m.InteractiveObject & { type: InteractiveTypesEnum.List | 'list' }>,
    ): Promise<m.MessagesResponse> {
        return this.interactive(params);
    }

    /**
     * Sends a Call-to-Action (CTA) URL button interactive message via the WhatsApp Cloud API.
     *
     * CTA URL messages display a button that opens a URL when tapped.
     *
     * @param params - The CTA URL interactive message parameters
     * @param params.body - Interactive object with `type: 'cta_url'` and action containing the URL and display text
     * @param params.to - Recipient phone number in international format
     * @param params.replyMessageId - Optional message ID to reply to
     * @returns A promise resolving to the message response with the sent message ID
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#interactive-object | Interactive Object Reference}
     *
     * @example
     * ```ts
     * await client.messages.interactiveCtaUrl({
     *   body: {
     *     type: 'cta_url',
     *     body: { text: 'Visit our website' },
     *     action: { name: 'cta_url', parameters: { display_text: 'Open', url: 'https://example.com' } },
     *   },
     *   to: '1234567890',
     * });
     * ```
     */
    async interactiveCtaUrl(
        params: m.MessageRequestParams<m.InteractiveObject & { type: InteractiveTypesEnum.CtaUrl | 'cta_url' }>,
    ): Promise<m.MessagesResponse> {
        return this.interactive(params);
    }

    /**
     * Sends a location request interactive message via the WhatsApp Cloud API.
     *
     * Prompts the recipient to share their current location.
     *
     * @param params - The location request interactive message parameters
     * @param params.body - Interactive object with `type: 'location_request_message'`
     * @param params.to - Recipient phone number in international format
     * @param params.replyMessageId - Optional message ID to reply to
     * @returns A promise resolving to the message response with the sent message ID
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#interactive-object | Interactive Object Reference}
     *
     * @example
     * ```ts
     * await client.messages.interactiveLocationRequest({
     *   body: {
     *     type: 'location_request_message',
     *     body: { text: 'Please share your location' },
     *     action: { name: 'send_location' },
     *   },
     *   to: '1234567890',
     * });
     * ```
     */
    async interactiveLocationRequest(
        params: m.MessageRequestParams<m.InteractiveObject & { type: InteractiveTypesEnum.LocationRequest }>,
    ): Promise<m.MessagesResponse> {
        return this.interactive(params);
    }

    /**
     * Sends an address message interactive message via the WhatsApp Cloud API.
     *
     * Prompts the recipient to provide or confirm a shipping/delivery address.
     *
     * @param params - The address message interactive message parameters
     * @param params.body - Interactive object with `type: 'address_message'`
     * @param params.to - Recipient phone number in international format
     * @param params.replyMessageId - Optional message ID to reply to
     * @returns A promise resolving to the message response with the sent message ID
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#interactive-object | Interactive Object Reference}
     *
     * @example
     * ```ts
     * await client.messages.interactiveAddressMessage({
     *   body: {
     *     type: 'address_message',
     *     body: { text: 'Please confirm your delivery address' },
     *     action: { name: 'address_message', parameters: { country: 'US' } },
     *   },
     *   to: '1234567890',
     * });
     * ```
     */
    async interactiveAddressMessage(
        params: m.MessageRequestParams<m.InteractiveObject & { type: InteractiveTypesEnum.AddressMessage }>,
    ): Promise<m.MessagesResponse> {
        return this.interactive(params);
    }

    /**
     * Sends a reply buttons interactive message via the WhatsApp Cloud API.
     *
     * Reply button messages display up to 3 quick-reply buttons. Each button has
     * a unique ID and title (up to 20 characters).
     *
     * @param params - The reply buttons interactive message parameters
     * @param params.body - Interactive object with `type: 'button'` and action containing up to 3 reply buttons
     * @param params.to - Recipient phone number in international format
     * @param params.replyMessageId - Optional message ID to reply to
     * @returns A promise resolving to the message response with the sent message ID
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#reply-button | Reply Button Reference}
     *
     * @example
     * ```ts
     * await client.messages.interactiveReplyButtons({
     *   body: {
     *     type: 'button',
     *     body: { text: 'Do you agree?' },
     *     action: {
     *       buttons: [
     *         { type: 'reply', reply: { id: 'yes', title: 'Yes' } },
     *         { type: 'reply', reply: { id: 'no', title: 'No' } },
     *       ],
     *     },
     *   },
     *   to: '1234567890',
     * });
     * ```
     */
    async interactiveReplyButtons(
        params: m.MessageRequestParams<m.InteractiveObject & { type: InteractiveTypesEnum.Button | 'button' }>,
    ): Promise<m.MessagesResponse> {
        return this.interactive(params);
    }

    /**
     * Sends a flow interactive message via the WhatsApp Cloud API.
     *
     * Flow messages launch a WhatsApp Flow, which provides structured multi-step interactions
     * (forms, surveys, appointment booking, etc.) within the chat.
     *
     * @param params - The flow interactive message parameters
     * @param params.body - Interactive object with `type: 'flow'` and action containing the flow token and configuration
     * @param params.to - Recipient phone number in international format
     * @param params.replyMessageId - Optional message ID to reply to
     * @returns A promise resolving to the message response with the sent message ID
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#interactive-object | Interactive Object Reference}
     * @see {@link https://developers.facebook.com/docs/whatsapp/flows | WhatsApp Flows Documentation}
     *
     * @example
     * ```ts
     * await client.messages.interactiveFlow({
     *   body: {
     *     type: 'flow',
     *     body: { text: 'Book an appointment' },
     *     action: {
     *       name: 'flow',
     *       parameters: { flow_message_version: '3', flow_id: '123456', flow_cta: 'Book Now' },
     *     },
     *   },
     *   to: '1234567890',
     * });
     * ```
     */
    async interactiveFlow(
        params: m.MessageRequestParams<m.InteractiveObject & { type: InteractiveTypesEnum.Flow | 'flow' }>,
    ): Promise<m.MessagesResponse> {
        return this.interactive(params);
    }

    /**
     * Sends a carousel interactive message via the WhatsApp Cloud API.
     *
     * Carousel messages display a horizontally scrollable set of cards, each with
     * an image, body text, and up to 2 quick-reply buttons.
     *
     * @param params - The carousel interactive message parameters
     * @param params.body - Interactive object with `type: 'carousel'` and action containing carousel cards
     * @param params.to - Recipient phone number in international format
     * @param params.replyMessageId - Optional message ID to reply to
     * @returns A promise resolving to the message response with the sent message ID
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#interactive-object | Interactive Object Reference}
     *
     * @example
     * ```ts
     * await client.messages.interactiveCarousel({
     *   body: {
     *     type: 'carousel',
     *     body: { text: 'Browse our products' },
     *     action: {
     *       cards: [
     *         {
     *           header: { type: 'image', image: { link: 'https://example.com/product1.jpg' } },
     *           body: { text: 'Product 1 - $10' },
     *           buttons: [{ type: 'reply', reply: { id: 'buy_1', title: 'Buy' } }],
     *         },
     *       ],
     *     },
     *   },
     *   to: '1234567890',
     * });
     * ```
     */
    async interactiveCarousel(
        params: m.MessageRequestParams<m.InteractiveObject & { type: InteractiveTypesEnum.Carousel }>,
    ): Promise<m.MessagesResponse> {
        return this.interactive(params);
    }

    /**
     * Sends a reaction emoji to an existing message via the WhatsApp Cloud API.
     *
     * Reactions allow users to respond to messages with a single emoji.
     * To remove a reaction, send an empty string as the emoji.
     *
     * @param params - The reaction parameters
     * @param params.messageId - The ID of the message to react to
     * @param params.emoji - The emoji character to react with (e.g., "\uD83D\uDC4D"), or empty string to remove reaction
     * @param params.to - Recipient phone number in international format
     * @returns A promise resolving to the message response with the sent message ID
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#reaction-object | Reaction Object Reference}
     *
     * @example
     * ```ts
     * // Add a reaction
     * await client.messages.reaction({
     *   messageId: 'wamid.ABC123',
     *   emoji: '\uD83D\uDC4D',
     *   to: '1234567890',
     * });
     *
     * // Remove a reaction
     * await client.messages.reaction({
     *   messageId: 'wamid.ABC123',
     *   emoji: '',
     *   to: '1234567890',
     * });
     * ```
     */
    async reaction(params: m.ReactionParams): Promise<m.MessagesResponse> {
        const reactionPayload = {
            message_id: params.messageId,
            emoji: params.emoji,
        };

        return this.send(JSON.stringify(this.bodyBuilder(MessageTypesEnum.Reaction, reactionPayload, params.to)));
    }
}
