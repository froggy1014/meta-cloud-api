import type { ImageProcessedMessage, ImageMessageHandler } from 'meta-cloud-api';

/**
 * Handler for image messages
 * Responds with a sample image using plain object API
 */
export const handleImageMessage: ImageMessageHandler = async (whatsapp, processed: ImageProcessedMessage) => {
    const { message } = processed;
    console.log(`📷 Image message received from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });
    await whatsapp.messages.showTypingIndicator({ messageId: message.id });

    // Send image response using plain object API
    await whatsapp.messages.image({
        to: message.from,
        body: {
            link: 'https://a.storyblok.com/f/182663/2000x1125/b7517efede/meta-platforms_from-dorm-room-to-global-giant.png',
            caption: 'Sample Image! 📸',
        },
    });

    console.log(`✅ Image response sent to ${message.from}`);
};
