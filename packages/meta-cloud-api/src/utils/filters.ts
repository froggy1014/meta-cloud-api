import { MessageType, WebhookMessage } from '../types/webhook';

/**
 * Filters for message handling, inspired by PyWa
 */
export const filters = {
    /**
     * Filters messages by type
     * @param type Message type to filter for
     * @returns A filter function
     */
    type: (type: MessageType | string): ((message: WebhookMessage) => boolean) => {
        return (message: WebhookMessage) => message.type === type;
    },

    /**
     * Filters text messages
     * @param message Message to check
     * @returns True if the message is a text message
     */
    text: (message: WebhookMessage): boolean => {
        return message.type === MessageType.TEXT;
    },

    /**
     * Filters image messages
     * @param message Message to check
     * @returns True if the message is an image message
     */
    image: (message: WebhookMessage): boolean => {
        return message.type === MessageType.IMAGE;
    },

    /**
     * Filters audio messages
     * @param message Message to check
     * @returns True if the message is an audio message
     */
    audio: (message: WebhookMessage): boolean => {
        return message.type === MessageType.AUDIO;
    },

    /**
     * Filters video messages
     * @param message Message to check
     * @returns True if the message is a video message
     */
    video: (message: WebhookMessage): boolean => {
        return message.type === MessageType.VIDEO;
    },

    /**
     * Filters document messages
     * @param message Message to check
     * @returns True if the message is a document message
     */
    document: (message: WebhookMessage): boolean => {
        return message.type === MessageType.DOCUMENT;
    },

    /**
     * Filters sticker messages
     * @param message Message to check
     * @returns True if the message is a sticker message
     */
    sticker: (message: WebhookMessage): boolean => {
        return message.type === MessageType.STICKER;
    },

    /**
     * Filters location messages
     * @param message Message to check
     * @returns True if the message is a location message
     */
    location: (message: WebhookMessage): boolean => {
        return message.type === MessageType.LOCATION;
    },

    /**
     * Filters contact messages
     * @param message Message to check
     * @returns True if the message is a contacts message
     */
    contacts: (message: WebhookMessage): boolean => {
        return message.type === MessageType.CONTACTS;
    },

    /**
     * Filters button messages
     * @param message Message to check
     * @returns True if the message is a button message
     */
    button: (message: WebhookMessage): boolean => {
        return message.type === MessageType.BUTTON;
    },

    /**
     * Filters interactive messages
     * @param message Message to check
     * @returns True if the message is an interactive message
     */
    interactive: (message: WebhookMessage): boolean => {
        return message.type === MessageType.INTERACTIVE;
    },

    /**
     * Filters system messages
     * @param message Message to check
     * @returns True if the message is a system message
     */
    system: (message: WebhookMessage): boolean => {
        return message.type === MessageType.SYSTEM;
    },

    /**
     * Filters order messages
     * @param message Message to check
     * @returns True if the message is an order message
     */
    order: (message: WebhookMessage): boolean => {
        return message.type === MessageType.ORDER;
    },

    /**
     * Matches text content against a pattern
     * @param patterns String or regular expression or array of patterns to match against
     * @returns A filter function
     */
    matches: (patterns: string | RegExp | (string | RegExp)[]): ((message: WebhookMessage) => boolean) => {
        const patternsArray = Array.isArray(patterns) ? patterns : [patterns];

        return (message: WebhookMessage): boolean => {
            if (message.type !== MessageType.TEXT || !message.text) {
                return false;
            }

            const text = message.text.body;

            for (const pattern of patternsArray) {
                if (typeof pattern === 'string') {
                    if (text.includes(pattern)) {
                        return true;
                    }
                } else if (pattern instanceof RegExp) {
                    if (pattern.test(text)) {
                        return true;
                    }
                }
            }

            return false;
        };
    },

    /**
     * Checks if a message is a reply to another message
     * @returns A filter function that returns true if the message is a reply
     */
    isReply: (message: WebhookMessage): boolean => {
        return !!message.context && !!message.context.message_id;
    },

    /**
     * Checks if a message is a reply to a specific message
     * @param messageId The ID of the original message to check for
     * @returns A filter function that returns true if the message is a reply to the specified message
     */
    isReplyTo: (messageId: string): ((message: WebhookMessage) => boolean) => {
        return (message: WebhookMessage): boolean => {
            return !!message.context && message.context.message_id === messageId;
        };
    },

    /**
     * Checks if a message is forwarded
     * @returns A filter function that returns true if the message is forwarded
     */
    isForwarded: (message: WebhookMessage): boolean => {
        return !!message.context && !!message.context.forwarded;
    },

    /**
     * Checks if a message is frequently forwarded
     * @returns A filter function that returns true if the message is frequently forwarded
     */
    isFrequentlyForwarded: (message: WebhookMessage): boolean => {
        return !!message.context && !!message.context.frequently_forwarded;
    },

    /**
     * Combines multiple filters with AND logic
     * @param filterFunctions Array of filter functions to combine
     * @returns A filter function that returns true only if all filters return true
     */
    and: (...filterFunctions: ((message: WebhookMessage) => boolean)[]): ((message: WebhookMessage) => boolean) => {
        return (message: WebhookMessage): boolean => {
            for (const filter of filterFunctions) {
                if (!filter(message)) {
                    return false;
                }
            }
            return true;
        };
    },

    /**
     * Combines multiple filters with OR logic
     * @param filterFunctions Array of filter functions to combine
     * @returns A filter function that returns true if any filter returns true
     */
    or: (...filterFunctions: ((message: WebhookMessage) => boolean)[]): ((message: WebhookMessage) => boolean) => {
        return (message: WebhookMessage): boolean => {
            for (const filter of filterFunctions) {
                if (filter(message)) {
                    return true;
                }
            }
            return false;
        };
    },

    /**
     * Negates a filter
     * @param filterFunction Filter function to negate
     * @returns A filter function that returns the opposite of the input filter
     */
    not: (filterFunction: (message: WebhookMessage) => boolean): ((message: WebhookMessage) => boolean) => {
        return (message: WebhookMessage): boolean => {
            return !filterFunction(message);
        };
    },

    /**
     * Filters messages from a specific sender
     * @param from Sender phone number to filter for
     * @returns A filter function
     */
    from: (from: string): ((message: WebhookMessage) => boolean) => {
        return (message: WebhookMessage): boolean => {
            return message.from === from;
        };
    },

    /**
     * Filter function that accepts all messages
     * @returns Always returns true
     */
    all: (): ((message: WebhookMessage) => boolean) => {
        return (): boolean => true;
    },
};
