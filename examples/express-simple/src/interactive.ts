import type { WebhookMessage, WhatsApp } from 'meta-cloud-api';
import { InteractiveTypesEnum } from 'meta-cloud-api';

export const handleInteractiveMessage = async (whatsapp: WhatsApp, message: WebhookMessage) => {
    await whatsapp.messages.markAsRead({ messageId: message.id });
    await whatsapp.messages.showTypingIndicator({ messageId: message.id });

    await whatsapp.messages.interactive({
        to: message.from,
        body: {
            type: InteractiveTypesEnum.List,
            header: {
                type: 'text',
                text: 'Our Menu',
            },
            body: {
                text: 'Select items from our menu',
            },
            footer: {
                text: 'Powered by WhatsApp',
            },
            action: {
                button: 'View Menu',
                sections: [
                    {
                        title: 'Main Dishes',
                        rows: [
                            {
                                id: 'pizza',
                                title: 'Pizza',
                                description: 'Delicious cheese pizza',
                            },
                            {
                                id: 'burger',
                                title: 'Burger',
                                description: 'Juicy beef burger',
                            },
                        ],
                    },
                ],
            },
        },
    });

    console.log(`✅ Interactive list message sent to ${message.from}`);
};
