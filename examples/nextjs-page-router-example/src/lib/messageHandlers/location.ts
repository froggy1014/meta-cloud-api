import type { LocationMessageHandler, LocationProcessedMessage } from 'meta-cloud-api';

/**
 * Handler for location messages
 * Responds with a sample location using plain object API
 */
export const handleLocationMessage: LocationMessageHandler = async (whatsapp, processed: LocationProcessedMessage) => {
    const { message } = processed;
    console.log(
        `📍 Location message received from ${message.from}: ${message.location.latitude}, ${message.location.longitude}`,
    );

    await whatsapp.messages.markAsRead({ messageId: message.id });
    await whatsapp.messages.showTypingIndicator({ messageId: message.id });

    // Send location response using plain object API
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
