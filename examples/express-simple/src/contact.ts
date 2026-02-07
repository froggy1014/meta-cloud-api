import type { WebhookMessage, WhatsApp } from 'meta-cloud-api';

export const handleContactMessage = async (whatsapp: WhatsApp, message: WebhookMessage) => {
    console.log(`👤 Contact message received from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });

    await whatsapp.messages.contacts({
        to: message.from,
        body: [
            {
                name: {
                    formatted_name: 'Support Team',
                    first_name: 'WhatsApp Bot',
                },
                phones: [
                    {
                        phone: '+1234567890',
                        type: 'WORK',
                    },
                ],
                emails: [
                    {
                        email: 'support@example.com',
                        type: 'WORK',
                    },
                ],
                org: {
                    company: 'Bot Company',
                    department: 'Tech Department',
                },
                urls: [
                    {
                        url: 'https://example.com',
                        type: 'WORK',
                    },
                ],
            },
        ],
    });

    console.log(`✅ Contact response sent to ${message.from}`);
};
