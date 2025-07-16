import type { WebhookMessage, WhatsApp } from 'meta-cloud-api';
import { ImageMessageBuilder } from 'meta-cloud-api/api/messages/builders';

/**
 * Handler for image messages
 * Responds with a sample image using builder pattern
 */
export const handleImageMessage = async (whatsapp: WhatsApp, message: WebhookMessage) => {
    console.log(`📷 Image message received from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });
    await whatsapp.messages.showTypingIndicator({ messageId: message.id });

    // Build and send image response
    const imageMessage = new ImageMessageBuilder()
        .setLink(
            'https://a.storyblok.com/f/182663/2000x1125/b7517efede/meta-platforms_from-dorm-room-to-global-giant.png',
        )
        .setCaption('Sample Image! 📸')
        .build();

    await whatsapp.messages.image({
        to: message.from,
        body: imageMessage,
    });

    console.log(`✅ Image response sent to ${message.from}`);
};
