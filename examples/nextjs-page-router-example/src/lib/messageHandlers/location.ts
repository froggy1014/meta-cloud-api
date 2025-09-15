import { LocationMessageBuilder, type WebhookMessage, type WhatsApp } from 'meta-cloud-api';

/**
 * Handler for location messages
 * Responds with a sample location using builder pattern
 */
export const handleLocationMessage = async (whatsapp: WhatsApp, message: WebhookMessage) => {
    console.log(`📍 Location message received from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });

    // Build and send location response
    const locationMessage = new LocationMessageBuilder()
        .setCoordinates(37.4847483695049, 127.0343222167384) // Example: Seoul coordinates
        .setName('Example Location')
        .setAddress('123 Main Street, Seoul, South Korea')
        .build();

    await whatsapp.messages.location({
        to: message.from,
        body: locationMessage,
    });

    console.log(`✅ Location response sent to ${message.from}`);
};
