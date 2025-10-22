import type { WebhookMessage, WhatsApp } from 'meta-cloud-api';

export const handleStickerMessage = async (whatsapp: WhatsApp, message: WebhookMessage) => {
    console.log(`🎨 Sticker message received from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });

    // Note: Stickers must be WebP format and properly formatted
    await whatsapp.messages.sticker({
        to: message.from,
        body: {
            link: 'https://example.com/sample-sticker.webp',
        },
    });

    console.log(`✅ Sticker response sent to ${message.from}`);
};
