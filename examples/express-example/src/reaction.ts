import type { WebhookMessage, WhatsApp } from 'meta-cloud-api';

export const handleReactionMessage = async (whatsapp: WhatsApp, message: WebhookMessage) => {
    console.log(`💖 Reaction message received from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });

    // Send a reaction to the received message
    await whatsapp.messages.reaction({
        to: message.from,
        messageId: message.id,
        emoji: '👍', // You can use any emoji
    });

    console.log(`✅ Reaction sent to ${message.from}`);
};
