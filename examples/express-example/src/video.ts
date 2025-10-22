import type { WebhookMessage, WhatsApp } from 'meta-cloud-api';

export const handleVideoMessage = async (whatsapp: WhatsApp, message: WebhookMessage) => {
    console.log(`🎥 Video message received from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });

    await whatsapp.messages.video({
        to: message.from,
        body: {
            link: 'https://www.w3schools.com/html/mov_bbb.mp4',
            caption: 'Here is a sample video! 🎬',
        },
    });

    console.log(`✅ Video response sent to ${message.from}`);
};
