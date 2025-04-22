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

type FlowParameters = {
    flow_message_version: string;
    flow_id?: string;
    flow_name?: string;
    flow_cta: string;
    mode?: 'draft' | 'published';
    flow_token: string;
    flow_action: 'navigate' | 'data_exchange';
    flow_action_payload?: {
        screen?: string;
        data?: Record<string, string>;
    };
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

// Request parameter interface definitions
export interface MessageRequestParams<T> {
    body: T;
    to: string;
    replyMessageId?: string;
}

export interface TextMessageParams extends MessageRequestParams<TextObject | string> {
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

export declare class MessagesClass extends BaseClass {
    /**
     * Sends an audio message via WhatsApp
     * @param params The audio message parameter object
     * @returns Promise with the message response
     */
    audio(params: MessageRequestParams<AudioMediaObject>): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends a contact card via WhatsApp
     * @param params The contact message parameter object
     * @returns Promise with the message response
     */
    contacts(params: MessageRequestParams<[ContactObject]>): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends a document via WhatsApp
     * @param params The document message parameter object
     * @returns Promise with the message response
     */
    document(params: MessageRequestParams<DocumentMediaObject>): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends an image via WhatsApp
     * @param params The image message parameter object
     * @returns Promise with the message response
     */
    image(params: MessageRequestParams<ImageMediaObject>): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends an interactive message via WhatsApp
     * @param params The interactive message parameter object
     * @returns Promise with the message response
     */
    interactive(params: MessageRequestParams<InteractiveObject>): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends a location via WhatsApp
     * @param params The location message parameter object
     * @returns Promise with the message response
     */
    location(params: MessageRequestParams<LocationObject>): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Updates message status (used for read receipts and typing indicators)
     * @param params The status update parameter object
     * @returns Promise with the response
     */
    status(params: StatusParams): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends a sticker via WhatsApp
     * @param params The sticker message parameter object
     * @returns Promise with the message response
     */
    sticker(params: MessageRequestParams<StickerMediaObject>): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends a template message via WhatsApp
     * @param params The template message parameter object
     * @returns Promise with the message response
     */
    template(
        params: MessageRequestParams<MessageTemplateObject<ComponentTypesEnum>>,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends a text message via WhatsApp
     * @param params The text message parameter object
     * @returns Promise with the message response
     */
    text(params: TextMessageParams): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends a video via WhatsApp
     * @param params The video message parameter object
     * @returns Promise with the message response
     */
    video(params: MessageRequestParams<VideoMediaObject>): Promise<RequesterResponseInterface<MessagesResponse>>;

    // New methods
    /**
     * Marks a message as read in WhatsApp
     * @param params The parameter object to mark message as read
     * @returns Promise with the response
     */
    markAsRead(params: { messageId: string }): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Marks a message as read and shows a typing indicator in WhatsApp
     * @param params The typing indicator parameter object
     * @returns Promise with the response
     */
    showTypingIndicator(params: { messageId: string }): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends an interactive list message
     * @param params The list message parameter object
     * @returns Promise with the response
     */
    interactiveList(
        params: MessageRequestParams<InteractiveObject & { type: InteractiveTypesEnum.List }>,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends an interactive CTA URL message
     * @param params The CTA URL message parameter object
     * @returns Promise with the response
     */
    interactiveCtaUrl(
        params: MessageRequestParams<InteractiveObject & { type: InteractiveTypesEnum.CtaUrl }>,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends a location request message
     * @param params The location request message parameter object
     * @returns Promise with the response
     */
    interactiveLocationRequest(
        params: MessageRequestParams<InteractiveObject & { type: InteractiveTypesEnum.LocationRequest }>,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends an address message to request shipping address from the user
     * Note: This feature is only available for businesses based in India and their India customers
     * @param params The address message parameter object
     * @returns Promise with the response
     */
    interactiveAddressMessage(
        params: MessageRequestParams<InteractiveObject & { type: InteractiveTypesEnum.AddressMessage }>,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends an interactive reply buttons message
     * @param params The reply buttons message parameter object
     * @returns Promise with the response
     */
    interactiveReplyButtons(
        params: MessageRequestParams<InteractiveObject & { type: InteractiveTypesEnum.Button }>,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends a reaction to a message (emoji response)
     * @param params The reaction message parameter object
     * @returns Promise with the response
     */
    reaction(params: ReactionParams): Promise<RequesterResponseInterface<MessagesResponse>>;

    /**
     * Sends an interactive Flow message
     * @param params The Flow message parameter object
     * @returns Promise with the response
     */
    interactiveFlow(
        params: MessageRequestParams<InteractiveObject & { type: InteractiveTypesEnum.Flow }>,
    ): Promise<RequesterResponseInterface<MessagesResponse>>;
}
