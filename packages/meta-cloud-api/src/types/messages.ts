/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BaseClass } from './base';
import {
    ButtonPositionEnum,
    ButtonTypesEnum,
    ComponentTypesEnum,
    CurrencyCodesEnum,
    InteractiveTypesEnum,
    LanguagesEnum,
    MessageTypesEnum,
    ParametersTypesEnum,
} from './enums';
import { GeneralRequestBody, RequesterResponseInterface } from './request';

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

type MetaAudioMediaObject = {
    id: string;
    link?: never;
};

type HostedAudioMediaObject = {
    id?: never;
    link: string;
};

export type AudioMediaObject = MetaAudioMediaObject | HostedAudioMediaObject;

export type AudioMessageRequestBody = MessageRequestBody<MessageTypesEnum.Audio> & {
    [MessageTypesEnum.Audio]: [AudioMediaObject];
};

type AddressesObject = {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    country_code?: string;
    type?: 'HOME' | 'WORK' | string;
};

type EmailObject = {
    email?: string;
    type?: 'HOME' | 'WORK' | string;
};

type NameObject = {
    formatted_name: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    suffix?: string;
    prefix?: string;
};

type OrgObject = {
    company?: string;
    department?: string;
    title?: string;
};

type PhoneObject = {
    phone?: 'PHONE_NUMBER';
    type?: 'CELL' | 'MAIN' | 'IPHONE' | 'HOME' | 'WORK' | string;
    wa_id?: string;
};

type URLObject = {
    url?: string;
    type?: 'HOME' | 'WORK' | string;
};

export type ContactObject = {
    addresses?: AddressesObject[];
    birthday?: `${number}${number}${number}${number}-${number}${number}-${number}${number}`;
    emails?: EmailObject[];
    name: NameObject;
    org?: OrgObject;
    phones?: PhoneObject[];
    urls?: URLObject[];
};

export type ContactsMessageRequestBody = MessageRequestBody<MessageTypesEnum.Contacts> & {
    [MessageTypesEnum.Contacts]: [ContactObject];
};

type MetaDocumentMediaObject = {
    id: string;
    link?: never;
    caption?: string;
    filename?: string;
};

type HostedDocumentMediaObject = {
    id?: never;
    link: string;
    caption?: string;
    filename?: string;
};

export type DocumentMediaObject = MetaDocumentMediaObject | HostedDocumentMediaObject;

export type DocumentMessageRequestBody = MessageRequestBody<MessageTypesEnum.Document> & {
    [MessageTypesEnum.Document]: [DocumentMediaObject];
};

type MetaImageMediaObject = {
    id: string;
    link?: never;
    caption?: string;
};

type HostedImageMediaObject = {
    id?: never;
    link: string;
    caption?: string;
};

export type ImageMediaObject = MetaImageMediaObject | HostedImageMediaObject;

export type ImageMessageRequestBody = MessageRequestBody<MessageTypesEnum.Image> & {
    [MessageTypesEnum.Image]: [ImageMediaObject];
};

type ProductObject = {
    product_retailer_id: string;
};

type SimpleTextObject = {
    text: string;
};

type RowObject = {
    id: string;
    title: string;
    description?: string;
};

type MultiProductSectionObject = {
    product_items: ProductObject[];
    rows?: never;
    title?: string;
};

type ListSectionObject = {
    product_items?: never;
    rows: RowObject[];
    title?: string;
};

type SectionObject = MultiProductSectionObject | ListSectionObject;

type ButtonObject = {
    title: string;
    id: string;
};

type ReplyButtonObject = {
    type: 'reply';
    reply: ButtonObject;
};

type ActionObject = {
    button?: string;
    buttons?: ReplyButtonObject[];
    catalog_id?: string;
    product_retailer_id?: string;
    sections?: SectionObject;
};

type HeaderObject = {
    type: 'document' | 'image' | 'text' | 'video';
    document?: DocumentMediaObject;
    image?: ImageMediaObject;
    text?: string;
    video?: VideoMediaObject;
};

type ButtonInteractiveObject = {
    type: InteractiveTypesEnum.Button;
    body: SimpleTextObject;
    footer?: SimpleTextObject;
    header?: HeaderObject;
    action: ActionObject;
};

type ListInteractiveObject = {
    type: InteractiveTypesEnum.List;
    body: SimpleTextObject;
    footer?: SimpleTextObject;
    header?: HeaderObject;
    action: ActionObject;
};

type ProductInteractiveObject = {
    type: InteractiveTypesEnum.Product;
    body?: SimpleTextObject;
    footer?: SimpleTextObject;
    header?: HeaderObject;
    action: ActionObject;
};

type ProductListInteractiveObject = {
    type: InteractiveTypesEnum.ProductList;
    body: SimpleTextObject;
    footer?: SimpleTextObject;
    header: HeaderObject;
    action: ActionObject;
};

type CtaUrlParameters = {
    display_text: string;
    url: string;
};

type CtaUrlActionObject = {
    name: 'cta_url';
    parameters: CtaUrlParameters;
};

type CtaUrlInteractiveObject = {
    type: InteractiveTypesEnum.CtaUrl;
    body?: SimpleTextObject;
    footer?: SimpleTextObject;
    header?: HeaderObject;
    action: CtaUrlActionObject;
};

type LocationRequestActionObject = {
    name: 'send_location';
};

type LocationRequestInteractiveObject = {
    type: InteractiveTypesEnum.LocationRequest;
    body: SimpleTextObject;
    footer?: SimpleTextObject;
    header?: HeaderObject;
    action: LocationRequestActionObject;
};

// Address message types
type AddressValues = {
    name?: string;
    phone_number?: string;
    in_pin_code?: string;
    house_number?: string;
    floor_number?: string;
    tower_number?: string;
    building_name?: string;
    address?: string;
    landmark_area?: string;
    city?: string;
    state?: string;
};

type SavedAddress = {
    id: string;
    value: AddressValues;
};

type ValidationErrors = {
    [key in keyof AddressValues]?: string;
};

type AddressMessageParameters = {
    country: string; // ISO country code, e.g., "IN" for India
    values?: AddressValues;
    saved_addresses?: SavedAddress[];
    validation_errors?: ValidationErrors;
};

type AddressMessageActionObject = {
    name: 'address_message';
    parameters: AddressMessageParameters;
};

type AddressMessageInteractiveObject = {
    type: InteractiveTypesEnum.AddressMessage;
    body: SimpleTextObject;
    footer?: SimpleTextObject;
    header?: HeaderObject;
    action: AddressMessageActionObject;
};

// Flow message types
type FlowParameters = {
    flow_token: string;
    flow_id?: string;
    flow_cta?: string;
    screen?: string;
    mode?: 'fullscreen' | 'drawer';
    data?: Record<string, string>;
};

type FlowActionObject = {
    name: 'flow';
    parameters: FlowParameters;
};

type FlowInteractiveObject = {
    type: InteractiveTypesEnum.Flow;
    body: SimpleTextObject;
    footer?: SimpleTextObject;
    header?: HeaderObject;
    action: FlowActionObject;
};

// Update InteractiveObject type
export type InteractiveObject =
    | ButtonInteractiveObject
    | ListInteractiveObject
    | ProductInteractiveObject
    | ProductListInteractiveObject
    | CtaUrlInteractiveObject
    | LocationRequestInteractiveObject
    | AddressMessageInteractiveObject
    | FlowInteractiveObject;

export type InteractiveMessageRequestBody = MessageRequestBody<MessageTypesEnum.Interactive> & {
    [MessageTypesEnum.Interactive]: InteractiveObject;
};

type MetaStickerMediaObject = {
    id: string;
    link?: never;
};

type HostedStickerMediaObject = {
    id?: never;
    link: string;
};

export type StickerMediaObject = MetaStickerMediaObject | HostedStickerMediaObject;

export type StickerMessageRequestBody = MessageRequestBody<MessageTypesEnum.Sticker> & {
    [MessageTypesEnum.Sticker]: [StickerMediaObject];
};

type ReActionObject = {
    message_id: string;
    emoji: string;
};

export type ReactionMessageRequestBody = MessageRequestBody<MessageTypesEnum.Reaction> & ReActionObject;

export type TextObject = {
    body: string;
    preview_url?: boolean;
};

export type TextMessageRequestBody = MessageRequestBody<MessageTypesEnum.Text> & {
    [MessageTypesEnum.Text]: [TextObject];
};

type MetaHostedVideoMediaObject = {
    id: string;
    link?: never;
    caption?: string;
};

type SelfHostedVideoMediaObject = {
    id?: never;
    link: string;
    caption?: string;
};

export type VideoMediaObject = MetaHostedVideoMediaObject | SelfHostedVideoMediaObject;

export type VideoMessageRequestBody = MessageRequestBody<MessageTypesEnum.Video> & {
    [MessageTypesEnum.Video]: [VideoMediaObject];
};

type LanguageObject = {
    policy: 'deterministic';
    code: LanguagesEnum;
};

type ParametersObject<T extends ParametersTypesEnum> = {
    type: T;
};

type TextParametersObject = ParametersObject<ParametersTypesEnum.Text> & SimpleTextObject;

type CurrencyObject = {
    fallback_value: string;
    code: CurrencyCodesEnum;
    amount_1000: number;
};

type CurrencyParametersObject = ParametersObject<ParametersTypesEnum.Currency> & {
    currency: CurrencyObject;
};

type DateTimeObject = {
    fallback_value: string;
};

type DateTimeParametersObject = ParametersObject<ParametersTypesEnum.Currency> & {
    date_time: DateTimeObject;
};

type DocumentParametersObject = ParametersObject<ParametersTypesEnum.Document> & DocumentMediaObject;

type ImageParametersObject = ParametersObject<ParametersTypesEnum.Image> & ImageMediaObject;

type VideoParametersObject = ParametersObject<ParametersTypesEnum.Video> & VideoMediaObject;

type QuickReplyButtonParametersObject = {
    type: ParametersTypesEnum.Payload;
    payload: string;
};

type URLButtonParametersObject = SimpleTextObject & {
    type: ParametersTypesEnum.Text;
};

type ButtonParameterObject = QuickReplyButtonParametersObject | URLButtonParametersObject;

type ComponentObject<T extends ComponentTypesEnum> = {
    type: T;
    parameters: (
        | CurrencyParametersObject
        | DateTimeParametersObject
        | DocumentParametersObject
        | ImageParametersObject
        | TextParametersObject
        | VideoParametersObject
    )[];
};

type ButtonComponentObject = ComponentObject<ComponentTypesEnum.Button> & {
    parameters: ButtonParameterObject;
    sub_type: ButtonTypesEnum;
    index: ButtonPositionEnum;
};

export type MessageTemplateObject<T extends ComponentTypesEnum> = {
    name: string;
    language: LanguageObject;
    components?: (ComponentObject<T> | ButtonComponentObject)[];
};

export type MessageTemplateRequestBody<T extends ComponentTypesEnum> = MessageRequestBody<MessageTypesEnum.Template> &
    MessageTemplateObject<T>;

export type LocationObject = {
    longitude: number;
    latitude: number;
    name?: string;
    address?: string;
};

export type LocationMessageRequestBody = MessageRequestBody<MessageTypesEnum.Location> & {
    [MessageTypesEnum.Location]: [LocationObject];
};

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

export declare class MessagesClass extends BaseClass {
    /**
     * Sends an audio message via WhatsApp
     * @param body The audio media object
     * @param to Recipient's phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the message response
     */
    audio(
        body: AudioMediaObject,
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends a contact card via WhatsApp
     * @param body The contact object
     * @param to Recipient's phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the message response
     */
    contacts(
        body: [ContactObject],
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends a document via WhatsApp
     * @param body The document media object
     * @param to Recipient's phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the message response
     */
    document(
        body: DocumentMediaObject,
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends an image via WhatsApp
     * @param body The image media object
     * @param to Recipient's phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the message response
     */
    image(
        body: ImageMediaObject,
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends an interactive message via WhatsApp
     * @param body The interactive object (buttons, lists, etc.)
     * @param to Recipient's phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the message response
     */
    interactive(
        body: InteractiveObject,
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends a location via WhatsApp
     * @param body The location object with coordinates
     * @param to Recipient's phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the message response
     */
    location(
        body: LocationObject,
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Updates message status (used for read receipts and typing indicators)
     * @param body The status object
     * @returns Promise with the response
     */
    status(body: StatusObject): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends a sticker via WhatsApp
     * @param body The sticker media object
     * @param to Recipient's phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the message response
     */
    sticker(
        body: StickerMediaObject,
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends a template message via WhatsApp
     * @param body The message template object
     * @param to Recipient's phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the message response
     */
    template(
        body: MessageTemplateObject<ComponentTypesEnum>,
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends a text message via WhatsApp
     * @param body The text object containing the message
     * @param to Recipient's phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the message response
     */
    text(body: TextObject, to: string, replyMessageId?: string): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends a video via WhatsApp
     * @param body The video media object
     * @param to Recipient's phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the message response
     */
    video(
        body: VideoMediaObject,
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;

    // New methods
    /**
     * Marks a message as read in WhatsApp
     * @param messageId ID of the message to mark as read
     * @returns Promise with the response
     */
    markAsRead(messageId: string): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Marks a message as read and shows a typing indicator in WhatsApp
     * @param messageId ID of the message to mark as read
     * @returns Promise with the response
     */
    showTypingIndicator(messageId: string): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends an interactive list message
     * @param body The list message content
     * @param to Recipient phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the response
     */
    interactiveList(
        body: InteractiveObject & { type: 'list' },
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends an interactive CTA URL message
     * @param body The CTA URL message content
     * @param to Recipient phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the response
     */
    interactiveCtaUrl(
        body: InteractiveObject & { type: 'cta_url' },
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends a location request message
     * @param body The location request message content
     * @param to Recipient phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the response
     */
    interactiveLocationRequest(
        body: InteractiveObject & { type: 'location_request_message' },
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends an address message to request shipping address from the user
     * Note: This feature is only available for businesses based in India and their India customers
     * @param body The address message content
     * @param to Recipient phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the response
     */
    interactiveAddressMessage(
        body: InteractiveObject & { type: 'address_message' },
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends an interactive reply buttons message
     * @param body The reply buttons message content
     * @param to Recipient phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the response
     */
    interactiveReplyButtons(
        body: InteractiveObject & { type: 'button' },
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends a reaction to a message (emoji response)
     * @param messageId ID of the message to react to
     * @param emoji The emoji to send as reaction (e.g. "😀", "❤️", "👍")
     * @param to Recipient phone number
     * @returns Promise with the response
     */
    reaction(messageId: string, emoji: string, to: string): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends an interactive Flow message
     * @param body The Flow message content
     * @param to Recipient phone number
     * @param replyMessageId Optional message ID to reply to
     * @returns Promise with the response
     */
    interactiveFlow(
        body: InteractiveObject & { type: 'flow' },
        to: string,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;
}
