import type { WebhookMessage, WhatsApp } from 'meta-cloud-api';

export const handleImageMessage = async (whatsapp: WhatsApp, message: WebhookMessage) => {
    console.log(`📷 Image message received from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });
    await whatsapp.messages.showTypingIndicator({ messageId: message.id });

    await whatsapp.messages.image({
        to: message.from,
        body: {
            link: 'https://a.storyblok.com/f/182663/2000x1125/b7517efede/meta-platforms_from-dorm-room-to-global-giant.png',
            caption: 'Sample Image! 📸',
        },
    });

    console.log(`✅ Image response sent to ${message.from}`);
};
