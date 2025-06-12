import type { MessageTypesEnum } from '@shared/types/enums';

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
 * Represents a message received through the webhook
 * Based on Meta's documentation: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components#messages-object
 */
export interface WebhookMessage {
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

    /**
     * Text object for text messages
     */
    text?: {
        /**
         * The text content of the message
         */
        body: string;
    };

    /**
     * Image object for image messages
     */
    image?: {
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

    /**
     * Video object for video messages
     */
    video?: {
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

    /**
     * Audio object for audio messages
     */
    audio?: {
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

    /**
     * Document object for document messages
     */
    document?: {
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

    /**
     * Sticker object for sticker messages
     */
    sticker?: {
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

    /**
     * Reaction object for reaction messages
     */
    reaction?: {
        /**
         * The ID of the message being reacted to
         */
        message_id: string;
        /**
         * Emoji used for the reaction
         */
        emoji: string;
    };

    /**
     * Contacts object for contact messages
     */
    contacts?: Array<{
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

    /**
     * Location object for location messages
     */
    location?: {
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

    /**
     * Interactive object for interactive messages
     */
    interactive?: {
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

    /**
     * System object for system messages (like user phone number changes)
     */
    system?: {
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

    /**
     * Order object for order messages
     */
    order?: {
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

    /**
     * Button object for button messages
     */
    button?: {
        /**
         * The payload for the button
         */
        payload: string;
        /**
         * Button text
         */
        text: string;
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
 * Event handler function type
 */
export type EventHandler = (event: WebhookEvent) => void | Promise<void>;

/**
 * Message status enum
 */
export enum MessageStatus {
    DELIVERED = 'delivered',
    READ = 'read',
    SENT = 'sent',
}

/**
 * Event field enum for webhook events
 */
export enum EventField {
    MESSAGES = 'messages',
    STATUSES = 'statuses',
    MESSAGE_TEMPLATE_STATUS_UPDATE = 'message_template_status_update',
    PHONE_NUMBER_QUALITY_UPDATE = 'phone_number_quality_update',
    PHONE_NUMBER_NAME_UPDATE = 'phone_number_name_update',
    UNKNOWN = 'unknown',
}
