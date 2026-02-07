import type { WebhookMessage, WhatsApp } from 'meta-cloud-api';

export const handleLocationMessage = async (whatsapp: WhatsApp, message: WebhookMessage) => {
    console.log(`📍 Location message received from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });

    await whatsapp.messages.location({
        to: message.from,
        body: {
            latitude: 37.4847483695049,
            longitude: 127.0343222167384,
            name: 'Example Location',
            address: '123 Main Street, Seoul, South Korea',
        },
    });

    console.log(`✅ Location response sent to ${message.from}`);
};
