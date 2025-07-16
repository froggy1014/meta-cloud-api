import { InteractiveTypesEnum } from '../../../types/enums';
import type { InteractiveObject } from '../types/interactive';

/**
 * Type guards for different action object types
 */
type RowObject = {
    id: string;
    title: string;
    description?: string;
};

type SectionObject = {
    title?: string;
    rows: RowObject[];
};

type BaseActionObject = {
    buttons?: Array<{ type: 'reply'; reply: { id: string; title: string } }>;
    sections?: SectionObject[];
    button?: string;
    catalog_id?: string;
    product_retailer_id?: string;
};

type CtaUrlActionObject = {
    name: 'cta_url';
    parameters: {
        display_text: string;
        url: string;
    };
};

type ActionObjectUnion = BaseActionObject | CtaUrlActionObject;

function isBaseActionObject(action: ActionObjectUnion): action is BaseActionObject {
    return !('name' in action);
}

function isCtaUrlActionObject(action: ActionObjectUnion): action is CtaUrlActionObject {
    return 'name' in action && action.name === 'cta_url';
}

/**
 * Builder class for creating interactive messages with a fluent API
 */
export class InteractiveMessageBuilder {
    private message: Partial<InteractiveObject> = {};

    /**
     * Set the interactive message type
     */
    setType(type: InteractiveTypesEnum): this {
        this.message.type = type;
        return this;
    }

    /**
     * Set the body text of the message
     */
    setBody(text: string): this {
        this.message.body = { text };
        return this;
    }

    /**
     * Set the footer text of the message
     */
    setFooter(text: string): this {
        this.message.footer = { text };
        return this;
    }

    /**
     * Set a text header
     */
    setTextHeader(text: string): this {
        this.message.header = { type: 'text', text };
        return this;
    }

    /**
     * Set an image header
     */
    setImageHeader(imageUrl: string): this {
        this.message.header = {
            type: 'image',
            image: { link: imageUrl },
        };
        return this;
    }

    /**
     * Add reply buttons (for button type messages)
     */
    addReplyButtons(buttons: Array<{ id: string; title: string }>): this {
        if (!this.message.action) {
            this.message.action = {} as ActionObjectUnion;
        }

        const action = this.message.action as ActionObjectUnion;
        if (isBaseActionObject(action)) {
            action.buttons = buttons.map((btn) => ({
                type: 'reply',
                reply: {
                    id: btn.id,
                    title: btn.title,
                },
            }));
        }

        return this;
    }

    /**
     * Add list sections (for list type messages)
     * Note: This creates a single section with multiple rows
     */
    addListSections(
        sections: Array<{
            title?: string;
            rows: Array<{ id: string; title: string; description?: string }>;
        }>,
    ): this {
        if (!this.message.action) {
            this.message.action = {} as ActionObjectUnion;
        }

        const action = this.message.action as ActionObjectUnion;
        if (isBaseActionObject(action)) {
            // Convert sections to the proper format expected by WhatsApp API
            action.sections = sections.map((section) => ({
                title: section.title,
                rows: section.rows,
            }));
        }

        return this;
    }

    /**
     * Set the button text for list messages
     */
    setListButtonText(buttonText: string): this {
        if (!this.message.action) {
            this.message.action = {} as ActionObjectUnion;
        }

        const action = this.message.action as ActionObjectUnion;
        if (isBaseActionObject(action)) {
            action.button = buttonText;
        }

        return this;
    }

    /**
     * Set CTA URL action
     */
    setCTAUrl(displayText: string, url: string): this {
        this.message.action = {
            name: 'cta_url',
            parameters: {
                display_text: displayText,
                url: url,
            },
        } as CtaUrlActionObject;

        return this;
    }

    /**
     * Build the final interactive object
     */
    build(): InteractiveObject {
        if (!this.message.type) {
            throw new Error('Interactive message type is required');
        }
        if (!this.message.body) {
            throw new Error('Interactive message body is required');
        }
        if (!this.message.action) {
            throw new Error('Interactive message action is required');
        }

        return this.message as InteractiveObject;
    }

    /**
     * Reset the builder for reuse
     */
    reset(): this {
        this.message = {};
        return this;
    }
}

/**
 * Convenience factory functions for common interactive message types
 */
export class InteractiveMessageFactory {
    /**
     * Create a button message with reply buttons
     */
    static createButtonMessage(
        bodyText: string,
        buttons: Array<{ id: string; title: string }>,
        options?: { headerText?: string; footerText?: string },
    ): InteractiveObject {
        const builder = new InteractiveMessageBuilder()
            .setType(InteractiveTypesEnum.Button)
            .setBody(bodyText)
            .addReplyButtons(buttons);

        if (options?.headerText) {
            builder.setTextHeader(options.headerText);
        }
        if (options?.footerText) {
            builder.setFooter(options.footerText);
        }

        return builder.build();
    }

    /**
     * Create a list message with sections
     */
    static createListMessage(
        bodyText: string,
        buttonText: string,
        sections: Array<{
            title?: string;
            rows: Array<{ id: string; title: string; description?: string }>;
        }>,
        options?: { headerText?: string; footerText?: string },
    ): InteractiveObject {
        const builder = new InteractiveMessageBuilder()
            .setType(InteractiveTypesEnum.List)
            .setBody(bodyText)
            .addListSections(sections);

        if (options?.headerText) {
            builder.setTextHeader(options.headerText);
        }
        if (options?.footerText) {
            builder.setFooter(options.footerText);
        }

        const message = builder.build();

        // Add button text for list messages
        const action = message.action as ActionObjectUnion;
        if (isBaseActionObject(action)) {
            action.button = buttonText;
        }

        return message;
    }

    /**
     * Create a CTA URL message
     */
    static createCTAUrlMessage(
        bodyText: string,
        displayText: string,
        url: string,
        options?: { headerText?: string; footerText?: string },
    ): InteractiveObject {
        const builder = new InteractiveMessageBuilder()
            .setType(InteractiveTypesEnum.CtaUrl)
            .setBody(bodyText)
            .setCTAUrl(displayText, url);

        if (options?.headerText) {
            builder.setTextHeader(options.headerText);
        }
        if (options?.footerText) {
            builder.setFooter(options.footerText);
        }

        return builder.build();
    }
}
