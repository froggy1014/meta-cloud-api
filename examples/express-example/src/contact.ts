import type { WebhookMessage, WhatsApp } from 'meta-cloud-api';
import { ContactMessageBuilder } from 'meta-cloud-api/api/messages/builders';

export const handleContactMessage = async (whatsapp: WhatsApp, message: WebhookMessage) => {
    console.log(`👤 Contact message received from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });

    const contactMessage = new ContactMessageBuilder()
        .setSimpleName('Support Team', 'WhatsApp Bot')
        .addPhone('+1234567890', 'WORK')
        .addEmail('support@example.com', 'WORK')
        .setOrganization('Bot Company', 'Tech Department')
        .addUrl('https://example.com', 'WORK')
        .build();

    await whatsapp.messages.contacts({
        to: message.from,
        body: [contactMessage],
    });

    console.log(`✅ Contact response sent to ${message.from}`);
};
