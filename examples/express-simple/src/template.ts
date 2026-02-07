import type { WebhookMessage, WhatsApp } from 'meta-cloud-api';
import { ComponentTypesEnum, LanguagesEnum } from 'meta-cloud-api';

export const handleTemplateMessage = async (whatsapp: WhatsApp, message: WebhookMessage) => {
    console.log(`📋 Template message request from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });

    // Example 1: Simple template without parameters
    await whatsapp.messages.template({
        to: message.from,
        body: {
            name: 'hello_world', // Your template name from Meta Business Manager
            language: {
                policy: 'deterministic',
                code: LanguagesEnum.English,
            },
        },
    });

    console.log(`✅ Template message sent to ${message.from}`);
};

export const handleTemplateWithParameters = async (whatsapp: WhatsApp, message: WebhookMessage) => {
    console.log(`📋 Template with parameters request from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });

    // Example 2: Template with dynamic parameters
    await whatsapp.messages.template({
        to: message.from,
        body: {
            name: 'sample_shipping_confirmation', // Your template name
            language: {
                policy: 'deterministic',
                code: LanguagesEnum.English,
            },
            components: [
                {
                    type: ComponentTypesEnum.Body,
                    parameters: [
                        {
                            type: 'text',
                            text: 'John Doe', // Customer name
                        },
                        {
                            type: 'text',
                            text: 'Order #12345', // Order number
                        },
                    ],
                },
            ],
        },
    });

    console.log(`✅ Template with parameters sent to ${message.from}`);
};
