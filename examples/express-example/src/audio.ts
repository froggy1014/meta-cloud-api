import type { WebhookMessage, WhatsApp } from 'meta-cloud-api';

export const handleAudioMessage = async (whatsapp: WhatsApp, message: WebhookMessage) => {
    console.log(`🎵 Audio message received from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });

    await whatsapp.messages.audio({
        to: message.from,
        body: {
            link: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        },
    });

    console.log(`✅ Audio response sent to ${message.from}`);
};
