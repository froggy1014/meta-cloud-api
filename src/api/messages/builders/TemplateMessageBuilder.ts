import {
    ButtonPositionEnum,
    ComponentTypesEnum,
    CurrencyCodesEnum,
    LanguagesEnum,
    ParametersTypesEnum,
    SubTypeEnum,
} from '../../../types/enums';
import type { MessageTemplateObject } from '../types/template';

// Helper type for currency parameter
export type CurrencyParameterHelper = {
    type: ParametersTypesEnum.Currency;
    currency: {
        fallback_value: string;
        code: CurrencyCodesEnum;
        amount_1000: number;
    };
};

// Helper type for date time parameter
export type DateTimeParameterHelper = {
    type: ParametersTypesEnum.DateTime;
    date_time: {
        fallback_value: string;
        timestamp: number;
    };
};

// Union type for all parameter helpers
export type ParameterObject = CurrencyParameterHelper | DateTimeParameterHelper;

// Type guards for validation
function isValidLanguageCode(code: string): code is LanguagesEnum {
    return Object.values(LanguagesEnum).includes(code as LanguagesEnum);
}

function isValidButtonPosition(index: number): index is ButtonPositionEnum {
    return Object.values(ButtonPositionEnum).includes(index as ButtonPositionEnum);
}

/**
 * Builder class for creating template messages with a fluent API
 */
export class TemplateMessageBuilder {
    private template: Partial<MessageTemplateObject<ComponentTypesEnum>> = {
        components: [],
    };

    /**
     * Set the template name
     */
    setName(name: string): this {
        if (!name || name.trim().length === 0) {
            throw new Error('Template name cannot be empty');
        }
        this.template.name = name;
        return this;
    }

    /**
     * Set the template language
     */
    setLanguage(code: string): this {
        if (!isValidLanguageCode(code)) {
            throw new Error(`Invalid language code: ${code}. Must be a valid LanguagesEnum value.`);
        }
        this.template.language = { policy: 'deterministic', code };
        return this;
    }

    /**
     * Add a header component with text parameters
     */
    addTextHeader(parameters: string[]): this {
        if (!Array.isArray(parameters)) {
            throw new Error('Parameters must be an array');
        }

        const headerComponent = {
            type: ComponentTypesEnum.Header,
            parameters: parameters.map((param) => {
                if (typeof param !== 'string') {
                    throw new Error('All parameters must be strings');
                }
                return { type: ParametersTypesEnum.Text, text: param };
            }),
        };

        if (!this.template.components) {
            this.template.components = [];
        }
        this.template.components.push(headerComponent as any);
        return this;
    }

    /**
     * Add a header component with image
     */
    addImageHeader(imageUrl: string): this {
        if (!imageUrl || typeof imageUrl !== 'string') {
            throw new Error('Image URL must be a non-empty string');
        }

        const headerComponent = {
            type: ComponentTypesEnum.Header,
            parameters: [
                {
                    type: ParametersTypesEnum.Image,
                    image: { link: imageUrl },
                },
            ],
        };

        if (!this.template.components) {
            this.template.components = [];
        }
        this.template.components.push(headerComponent as any);
        return this;
    }

    /**
     * Add a body component with text parameters
     */
    addBody(parameters: string[]): this {
        if (!Array.isArray(parameters)) {
            throw new Error('Parameters must be an array');
        }

        const bodyComponent = {
            type: ComponentTypesEnum.Body,
            parameters: parameters.map((param) => {
                if (typeof param !== 'string') {
                    throw new Error('All parameters must be strings');
                }
                return { type: ParametersTypesEnum.Text, text: param };
            }),
        };

        if (!this.template.components) {
            this.template.components = [];
        }
        this.template.components.push(bodyComponent as any);
        return this;
    }

    /**
     * Add a footer component (usually no parameters needed)
     */
    addFooter(): this {
        const footerComponent = {
            type: ComponentTypesEnum.Footer,
        };

        if (!this.template.components) {
            this.template.components = [];
        }
        this.template.components.push(footerComponent as any);
        return this;
    }

    /**
     * Add button components (for quick replies, URLs, etc.)
     */
    addButtons(
        buttons: Array<{
            index: number;
            type: 'quick_reply' | 'url';
            parameters?: string[];
        }>,
    ): this {
        if (!Array.isArray(buttons)) {
            throw new Error('Buttons must be an array');
        }

        buttons.forEach((button) => {
            if (typeof button.index !== 'number' || !isValidButtonPosition(button.index)) {
                throw new Error(`Button index must be a valid ButtonPositionEnum value: ${button.index}`);
            }

            // Map string types to SubTypeEnum values
            const subType = button.type === 'quick_reply' ? SubTypeEnum.QuickReply : SubTypeEnum.Url;

            const buttonComponent = {
                type: ComponentTypesEnum.Button,
                sub_type: subType,
                index: button.index,
            } as any;

            if (button.parameters && button.parameters.length > 0) {
                if (!Array.isArray(button.parameters)) {
                    throw new Error('Button parameters must be an array');
                }

                // Handle different parameter types based on button type
                if (button.type === 'quick_reply') {
                    // Quick reply buttons use payload parameters
                    buttonComponent.parameters = button.parameters.map((param) => {
                        if (typeof param !== 'string') {
                            throw new Error('All button parameters must be strings');
                        }
                        return { type: ParametersTypesEnum.Payload, payload: param };
                    });
                } else if (button.type === 'url') {
                    // URL buttons use text parameters
                    buttonComponent.parameters = button.parameters.map((param) => {
                        if (typeof param !== 'string') {
                            throw new Error('All button parameters must be strings');
                        }
                        return { type: ParametersTypesEnum.Text, text: param };
                    });
                }
            }

            if (!this.template.components) {
                this.template.components = [];
            }
            this.template.components.push(buttonComponent);
        });

        return this;
    }

    /**
     * Add a currency parameter for header/body
     */
    addCurrencyParameter(fallbackValue: string, currencyCode: string, amount: number): CurrencyParameterHelper {
        if (!fallbackValue || typeof fallbackValue !== 'string') {
            throw new Error('Fallback value must be a non-empty string');
        }
        if (!currencyCode || typeof currencyCode !== 'string') {
            throw new Error('Currency code must be a non-empty string');
        }
        if (typeof amount !== 'number' || amount < 0) {
            throw new Error('Amount must be a non-negative number');
        }

        return {
            type: ParametersTypesEnum.Currency,
            currency: {
                fallback_value: fallbackValue,
                code: currencyCode as CurrencyCodesEnum,
                amount_1000: amount * 1000, // WhatsApp expects amount in smallest unit
            },
        };
    }

    /**
     * Add a date time parameter
     */
    addDateTimeParameter(fallbackValue: string, timestamp: number): DateTimeParameterHelper {
        if (!fallbackValue || typeof fallbackValue !== 'string') {
            throw new Error('Fallback value must be a non-empty string');
        }
        if (typeof timestamp !== 'number' || timestamp <= 0) {
            throw new Error('Timestamp must be a positive number');
        }

        return {
            type: ParametersTypesEnum.DateTime,
            date_time: {
                fallback_value: fallbackValue,
                timestamp: timestamp,
            },
        };
    }

    /**
     * Build the final template object
     */
    build(): MessageTemplateObject<ComponentTypesEnum> {
        if (!this.template.name) {
            throw new Error('Template name is required');
        }
        if (!this.template.language) {
            throw new Error('Template language is required');
        }

        return this.template as MessageTemplateObject<ComponentTypesEnum>;
    }

    /**
     * Reset the builder for reuse
     */
    reset(): this {
        this.template = { components: [] };
        return this;
    }
}

/**
 * Factory class for common template patterns
 */
export class TemplateMessageFactory {
    /**
     * Create a simple text-only template
     */
    static createSimpleTextTemplate(
        name: string,
        language: string,
        bodyParameters: string[],
    ): MessageTemplateObject<ComponentTypesEnum> {
        if (!name || !language || !Array.isArray(bodyParameters)) {
            throw new Error('Invalid parameters for simple text template');
        }

        return new TemplateMessageBuilder().setName(name).setLanguage(language).addBody(bodyParameters).build();
    }

    /**
     * Create a template with header, body and buttons
     */
    static createCompleteTemplate(
        name: string,
        language: string,
        options: {
            headerParameters?: string[];
            headerImage?: string;
            bodyParameters: string[];
            buttons?: Array<{
                index: number;
                type: 'quick_reply' | 'url';
                parameters?: string[];
            }>;
        },
    ): MessageTemplateObject<ComponentTypesEnum> {
        if (!name || !language || !options.bodyParameters) {
            throw new Error('Invalid parameters for complete template');
        }

        const builder = new TemplateMessageBuilder()
            .setName(name)
            .setLanguage(language)
            .addBody(options.bodyParameters);

        if (options.headerParameters) {
            builder.addTextHeader(options.headerParameters);
        } else if (options.headerImage) {
            builder.addImageHeader(options.headerImage);
        }

        if (options.buttons) {
            builder.addButtons(options.buttons);
        }

        return builder.build();
    }

    /**
     * Create an order confirmation template
     */
    static createOrderConfirmationTemplate(
        language: string,
        customerName: string,
        orderNumber: string,
        amount: number,
        currencyCode: string,
    ): MessageTemplateObject<ComponentTypesEnum> {
        if (!language || !customerName || !orderNumber || typeof amount !== 'number' || !currencyCode) {
            throw new Error('Invalid parameters for order confirmation template');
        }

        return new TemplateMessageBuilder()
            .setName('order_confirmation')
            .setLanguage(language)
            .addBody([customerName, orderNumber, amount.toString(), currencyCode])
            .addButtons([
                { index: 0, type: 'quick_reply' },
                { index: 1, type: 'url', parameters: [orderNumber] },
            ])
            .build();
    }
}
