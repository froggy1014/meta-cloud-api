import { InteractiveMessageBuilder, type WebhookMessage, type WhatsApp } from 'meta-cloud-api';
import { InteractiveTypesEnum } from 'meta-cloud-api/enums';

/**
 * Handler for interactive reply messages
 * Responds when user clicks on buttons or selects from lists
 */
export const handleInteractiveMessage = async (whatsapp: WhatsApp, message: WebhookMessage) => {
    await whatsapp.messages.markAsRead({ messageId: message.id });
    await whatsapp.messages.showTypingIndicator({ messageId: message.id });
    const interactiveMessage = new InteractiveMessageBuilder()
        .setType(InteractiveTypesEnum.List)
        .setTextHeader('Our Menu')
        .setBody('Select items from our menu')
        .setFooter('Powered by WhatsApp')
        .setListButtonText('View Menu')
        .addListSections([
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
        ])
        .build();

    await whatsapp.messages.interactive({
        to: message.from,
        body: interactiveMessage,
    });

    console.log(`✅ Interactive list message sent to ${message.from}`);
};
