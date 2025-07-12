import type { MessageTypesEnum } from '../../types/enums';

export interface WebhookContact {
    /**
     * WhatsApp ID of the contact. Business can respond to this contact using this ID.
     */
    wa_id: string;
    /**
     *  Additional unique, alphanumeric identifier for a WhatsApp user
     */
    user_id?: string;
    /**
     * Profile of Whatsapp user
     */
    profile: {
        /**
         * The display name of the contact
         */
        name: string;
    };
}

/**
 * Base message interface with common properties
 */
export interface BaseMessage {
    id: string;
    from: string;
    timestamp: string;
    type: MessageTypesEnum;
    /**
     * Context object, included when a user replies or interacts
     */
    context?: {
        /**
         * ID of the message
         */
        id?: string;
        /**
         * ID of the sender
         */
        from?: string;
        /**
         * ID of the message being replied to or interacted with
         */
        message_id: string;
        /**
         * ID of the forwarded message, if applicable
         */
        forwarded?: boolean;
        /**
         * Frequently forwarded status
         */
        frequently_forwarded?: boolean;
        /**
         * Original message information if the message was referred
         */
        referred_product?: {
            /**
             * Catalog ID
             */
            catalog_id: string;
            /**
             * Product ID
             */
            product_retailer_id: string;
        };
    };
    /**
     * Errors array, if the message had errors
     */
    errors?: Array<{
        /**
         * Error code
         */
        code: number;
        /**
         * Error title
         */
        title: string;
        /**
         * Error message
         */
        message: string;
        /**
         * Error details object
         */
        error_data?: {
            /**
             * Describes the error details
             */
            details: string;
        };
    }>;
}

/**
 * Text message interface
 */
export interface TextMessage extends BaseMessage {
    type: MessageTypesEnum.Text;
    text: {
        /**
         * The text content of the message
         */
        body: string;
        preview_url?: boolean;
    };
}

/**
 * Image message interface
 */
export interface ImageMessage extends BaseMessage {
    type: MessageTypesEnum.Image;
    image: {
        /**
         * The image caption (if provided)
         */
        caption?: string;
        /**
         * The SHA256 hash of the image
         */
        sha256?: string;
        /**
         * The ID for the image
         */
        id: string;
        /**
         * The MIME type of the image
         */
        mime_type: string;
    };
}

/**
 * Video message interface
 */
export interface VideoMessage extends BaseMessage {
    type: MessageTypesEnum.Video;
    video: {
        /**
         * The video caption (if provided)
         */
        caption?: string;
        /**
         * The SHA256 hash of the video
         */
        sha256?: string;
        /**
         * The ID for the video
         */
        id: string;
        /**
         * The MIME type of the video
         */
        mime_type: string;
    };
}

/**
 * Audio message interface
 */
export interface AudioMessage extends BaseMessage {
    type: MessageTypesEnum.Audio;
    audio: {
        /**
         * The ID for the audio file
         */
        id: string;
        /**
         * The MIME type of the audio file
         */
        mime_type: string;
        /**
         * Whether the audio is a voice message
         */
        voice?: boolean;
    };
}

/**
 * Document message interface
 */
export interface DocumentMessage extends BaseMessage {
    type: MessageTypesEnum.Document;
    document: {
        /**
         * The document caption (if provided)
         */
        caption?: string;
        /**
         * The document filename
         */
        filename: string;
        /**
         * The SHA256 hash of the document
         */
        sha256?: string;
        /**
         * The ID for the document
         */
        id: string;
        /**
         * The MIME type of the document
         */
        mime_type: string;
    };
}

/**
 * Sticker message interface
 */
export interface StickerMessage extends BaseMessage {
    type: MessageTypesEnum.Sticker;
    sticker: {
        /**
         * The ID for the sticker
         */
        id: string;
        /**
         * Whether this is an animated sticker
         */
        animated: boolean;
        /**
         * The MIME type of the sticker
         */
        mime_type: string;
    };
}

/**
 * Reaction message interface
 */
export interface ReactionMessage extends BaseMessage {
    type: MessageTypesEnum.Reaction;
    reaction: {
        /**
         * The ID of the message being reacted to
         */
        message_id: string;
        /**
         * Emoji used for the reaction
         */
        emoji: string;
    };
}

/**
 * Contacts message interface
 */
export interface ContactsMessage extends BaseMessage {
    type: MessageTypesEnum.Contacts;
    contacts: Array<{
        /**
         * The contact's name
         */
        name: {
            /**
             * The formatted name
             */
            formatted_name: string;
            /**
             * The first name
             */
            first_name?: string;
            /**
             * The last name
             */
            last_name?: string;
            /**
             * The middle name
             */
            middle_name?: string;
            /**
             * The suffix
             */
            suffix?: string;
            /**
             * The prefix
             */
            prefix?: string;
        };
        /**
         * The contact's phone numbers
         */
        phones?: Array<{
            phone: string;
            type?: string;
            wa_id?: string;
        }>;
        /**
         * The contact's emails
         */
        emails?: Array<{
            email: string;
            type?: string;
        }>;
        /**
         * The contact's addresses
         */
        addresses?: Array<{
            street?: string;
            city?: string;
            state?: string;
            zip?: string;
            country?: string;
            country_code?: string;
            type?: string;
        }>;
        /**
         * The contact's organizations
         */
        org?: {
            company?: string;
            department?: string;
            title?: string;
        };
        /**
         * The contact's URLs
         */
        urls?: Array<{
            url: string;
            type?: string;
        }>;
        /**
         * The contact's birthday (YYYY-MM-DD format)
         */
        birthday?: string;
    }>;
}

/**
 * Location message interface
 */
export interface LocationMessage extends BaseMessage {
    type: MessageTypesEnum.Location;
    location: {
        /**
         * Latitude of the location
         */
        latitude: number;
        /**
         * Longitude of the location
         */
        longitude: number;
        /**
         * Name of the location
         */
        name?: string;
        /**
         * Address of the location
         */
        address?: string;
    };
}

/**
 * Interactive message interface
 */
export interface InteractiveMessage extends BaseMessage {
    type: MessageTypesEnum.Interactive;
    interactive: {
        /**
         * Type of the interactive message
         * Can be: button_reply, list_reply, flow, nfm_reply, etc.
         */
        type: string;
        /**
         * ID for the button that was clicked
         */
        button_reply?: {
            id: string;
            title: string;
        };
        /**
         * ID for the list item that was selected
         */
        list_reply?: {
            id: string;
            title: string;
            description?: string;
        };
        /**
         * NFM (No-Code Flow Message) reply data
         */
        nfm_reply?: {
            /**
             * Response data in JSON format
             */
            response_json: string;
            /**
             * Body text of the reply
             */
            body: string;
            /**
             * Name of the flow
             */
            name: string;
        };
    };
}

/**
 * System message interface
 */
export interface SystemMessage extends BaseMessage {
    type: MessageTypesEnum.System;
    system: {
        /**
         * The type of system update
         */
        type: string;
        /**
         * User's identity if the update is a customer identity change
         */
        identity?: string;
        /**
         * Old and new phone numbers if the update is a phone number change
         */
        customer?: {
            /**
             * The previous phone number
             */
            previous_wa_id: string;
            /**
             * The new phone number
             */
            wa_id: string;
        };
    };
}

/**
 * Order message interface
 */
export interface OrderMessage extends BaseMessage {
    type: MessageTypesEnum.Order;
    order: {
        /**
         * Catalog ID
         */
        catalog_id: string;
        /**
         * Product items in the order
         */
        product_items: Array<{
            /**
             * Product ID
             */
            product_retailer_id: string;
            /**
             * Quantity of the product
             */
            quantity: number;
            /**
             * Item price
             */
            item_price: number;
            /**
             * Currency code
             */
            currency: string;
        }>;
        /**
         * Text message included with the order
         */
        text?: string;
    };
}

/**
 * Button message interface
 */
export interface ButtonMessage extends BaseMessage {
    type: MessageTypesEnum.Button;
    button: {
        /**
         * The payload for the button
         */
        payload: string;
        /**
         * Button text
         */
        text: string;
    };
}

/**
 * Union type for all message types
 */
export type WhatsAppMessage =
    | TextMessage
    | ImageMessage
    | VideoMessage
    | AudioMessage
    | DocumentMessage
    | StickerMessage
    | ReactionMessage
    | ContactsMessage
    | LocationMessage
    | InteractiveMessage
    | SystemMessage
    | OrderMessage
    | ButtonMessage;

export interface WebhookMessageValue {
    /**
     * The messaging product
     */
    messaging_product: string;
    /**
     * The metadata
     */
    metadata: {
        /**
         * The display phone number of the whatsapp business account
         */
        display_phone_number: string;
        /**
         * The phone number ID of the whatsapp business account
         */
        phone_number_id: string;
    };
    contacts?: Array<{
        profile: {
            /**
             * The display name of the whatsapp user
             */
            name: string;
        };
        /**
         * The whatsapp ID of the user
         */
        wa_id: string;
    }>;
    messages: Array<WhatsAppMessage>;

    statuses?: Array<{
        /**
         * The ID of the message
         */
        id: string;
        /**
         * The status of the message
         */
        status: MessageStatus;
        /**
         * The timestamp of the message
         */
        timestamp: string;
        /**
         * The recipient ID ( phone number of the user )
         */
        recipient_id: string;
    }>;

    errors?: Array<{
        /**
         * The error code
         */
        code: number;
        /**
         * The error title
         */
        title: string;
        /**
         * The error data
         */
        error_data?: {
            /**
             * The error details
             */
            details: string;
        };
    }>;
}

/**
 * Represents a message received through the webhook
 * Based on Meta's documentation: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components#messages-object
 */
export interface WebhookMessage {
    /**
     * The WhatsApp Business Account ID
     */
    wabaId: string;

    /**
     * The message ID
     */
    id: string;

    /**
     * The sender's phone number
     */
    from: string;

    /**
     * The timestamp of the message
     */
    timestamp: string;

    /**
     * The type of message (text, image, etc.)
     */
    type: MessageTypesEnum;

    /**
     * The phone number ID that received the message
     */
    phoneNumberId: string;

    /**
     * The display phone number that received the message
     */
    displayPhoneNumber: string;

    /**
     * The profile name of the sender
     */
    profileName: string;

    text?: TextMessage['text'];
    image?: ImageMessage['image'];
    video?: VideoMessage['video'];
    audio?: AudioMessage['audio'];
    document?: DocumentMessage['document'];
    sticker?: StickerMessage['sticker'];
    location?: LocationMessage['location'];
    contacts?: ContactsMessage['contacts'];
    interactive?: InteractiveMessage['interactive'];
    button?: ButtonMessage['button'];
    order?: OrderMessage['order'];
    system?: SystemMessage['system'];
    reaction?: ReactionMessage['reaction'];

    statuses?: {
        /**
         * Arbitrary string included in sent message
         */
        biz_opaque_callback_data?: string;

        /**
         * Information about the conversation
         */
        conversation?: {
            /**
             * Represents the ID of the conversation the given status notification belongs to
             */
            id: string;
            /**
             * Describes conversation category
             */
            origin: {
                /**
                 * Indicates conversation category. This can also be referred to as a conversation entry point
                 * - authentication: Conversation opened by business sending template categorized as AUTHENTICATION
                 * - marketing: Conversation opened by business sending template categorized as MARKETING
                 * - utility: Conversation opened by business sending template categorized as UTILITY
                 * - service: Conversation opened by business replying to customer within service window
                 * - referral_conversion: Free entry point conversation
                 */
                type: 'authentication' | 'marketing' | 'utility' | 'service' | 'referral_conversion';
            };
            /**
             * Date when the conversation expires. Only present for messages with status 'sent'
             */
            expiration_timestamp?: string;
        };

        /**
         * Array of error objects describing the error
         */
        errors?: Array<{
            /**
             * Error code
             */
            code: number;
            /**
             * Error code title
             */
            title: string;
            /**
             * Error code message
             */
            message: string;
            /**
             * Error details object
             */
            error_data?: {
                /**
                 * Describes the error details
                 */
                details: string;
            };
        }>;

        /**
         * The ID for the message that the business sent to a customer
         */
        id: string;

        /**
         * Pricing information for the message/conversation
         */
        pricing?: {
            /**
             * Indicates if the given message or conversation is billable
             * @deprecated This field is deprecated. Visit the WhatsApp Changelog for more information.
             */
            billable?: boolean;
            /**
             * Indicates the conversation category:
             * - authentication: Authentication conversation
             * - authentication_international: Authentication-international conversation
             * - marketing: Marketing conversation
             * - utility: Utility conversation
             * - service: Service conversation
             * - referral_conversion: Free entry point conversation
             */
            category:
                | 'authentication'
                | 'authentication_international'
                | 'marketing'
                | 'utility'
                | 'service'
                | 'referral_conversion';
            /**
             * Type of pricing model used by the business. Current supported value is CBP
             */
            pricing_model: 'CBP';
        };

        /**
         * The customer's WhatsApp ID. Business can respond to customer using this ID.
         * This ID may not match the customer's phone number.
         */
        recipient_id: string;

        /**
         * Status of the message:
         * - delivered: Message has been delivered
         * - read: Message has been read by the customer
         * - sent: Message has been sent to the customer
         */
        status: 'delivered' | 'read' | 'sent';

        /**
         * Unix timestamp for the status message
         */
        timestamp: string;
    };
    /**
     * The original message data as received from the webhook
     */
    originalData: any;
}

/**
 * Webhook event received from WhatsApp
 */
export interface WebhookEvent {
    /**
     * The field type of the event
     */
    field: string;

    /**
     * The event data
     */
    value: any;

    /**
     * The timestamp when the event was received
     */
    timestamp: number;
}

/**
 * Message handler function type
 */
export type MessageHandler = (message: WebhookMessage) => void | Promise<void>;

/**
 * Message status enum
 */
export enum MessageStatus {
    DELIVERED = 'delivered',
    READ = 'read',
    SENT = 'sent',
}
