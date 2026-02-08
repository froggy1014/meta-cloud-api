import type { ContactsProcessedMessage, ContactsMessageHandler } from 'meta-cloud-api';

/**
 * Handler for contact messages
 * Responds with a sample contact using plain object API
 */
export const handleContactMessage: ContactsMessageHandler = async (whatsapp, processed: ContactsProcessedMessage) => {
    const { message } = processed;
    console.log(`👤 Contact message received from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });
    await whatsapp.messages.showTypingIndicator({ messageId: message.id });

    // Send contact response using plain object API
    await whatsapp.messages.contacts({
        to: message.from,
        body: [
            {
                name: {
                    formatted_name: 'John Doe',
                    first_name: 'John',
                    last_name: 'Doe',
                },
                phones: [
                    {
                        phone: '+1 (555) 123-4567',
                        type: 'CELL',
                    },
                ],
                emails: [
                    {
                        email: 'john.doe@example.com',
                        type: 'WORK',
                    },
                ],
            },
        ],
    });

    console.log(`✅ Contact response sent to ${message.from}`);
};
