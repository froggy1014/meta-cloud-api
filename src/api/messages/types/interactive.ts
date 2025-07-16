import { InteractiveTypesEnum, MessageTypesEnum } from '../../../types/enums';
import { MessageRequestBody } from './common';

// Import media types to avoid circular dependencies
type DocumentMediaObject = {
    id?: string;
    link?: string;
    caption?: string;
    filename?: string;
};

type ImageMediaObject = {
    id?: string;
    link?: string;
    caption?: string;
};

type VideoMediaObject = {
    id?: string;
    link?: string;
    caption?: string;
};

// Interactive Message Types
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
    buttons?: ReplyButtonObject[];
    catalog_id?: string;
    product_retailer_id?: string;
    sections?: SectionObject[];
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
