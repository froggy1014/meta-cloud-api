import type { TextObject } from '../types/text';

/**
 * Builder class for creating text messages with a fluent API
 */
export class TextMessageBuilder {
    private textMessage: Partial<TextObject> = {};

    /**
     * Set the message body text
     */
    setBody(text: string): this {
        if (!text || typeof text !== 'string') {
            throw new Error('Message body must be a non-empty string');
        }
        this.textMessage.body = text;
        return this;
    }

    /**
     * Enable or disable URL preview
     */
    setPreviewUrl(enable: boolean = true): this {
        this.textMessage.preview_url = enable;
        return this;
    }

    /**
     * Build the final text object
     */
    build(): TextObject {
        if (!this.textMessage.body) {
            throw new Error('Message body is required');
        }

        return this.textMessage as TextObject;
    }

    /**
     * Reset the builder for reuse
     */
    reset(): this {
        this.textMessage = {};
        return this;
    }
}

/**
 * Factory class for common text message patterns
 */
export class TextMessageFactory {
    /**
     * Create a simple text message
     */
    static createSimpleText(body: string): TextObject {
        return new TextMessageBuilder().setBody(body).build();
    }

    /**
     * Create a text message with URL preview
     */
    static createTextWithPreview(body: string): TextObject {
        return new TextMessageBuilder().setBody(body).setPreviewUrl(true).build();
    }

    /**
     * Create a notification message
     */
    static createNotification(title: string, message: string): TextObject {
        return new TextMessageBuilder().setBody(`*${title}*\n\n${message}`).build();
    }
}
