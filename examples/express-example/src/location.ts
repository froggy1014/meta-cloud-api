import type { WebhookMessage, WhatsApp } from 'meta-cloud-api';
import { LocationMessageBuilder } from 'meta-cloud-api/api/messages/builders';

export const handleLocationMessage = async (whatsapp: WhatsApp, message: WebhookMessage) => {
    console.log(`📍 Location message received from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });

    const locationMessage = new LocationMessageBuilder()
        .setCoordinates(37.4847483695049, 127.0343222167384)
        .setName('Example Location')
        .setAddress('123 Main Street, Seoul, South Korea')
        .build();

    await whatsapp.messages.location({
        to: message.from,
        body: locationMessage,
    });

    console.log(`✅ Location response sent to ${message.from}`);
};
