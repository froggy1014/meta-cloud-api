import { TextMessageBuilder, WebhookMessage, WhatsApp } from 'meta-cloud-api';

/**
 * Handler for text messages
 * Echoes back the received text with builder pattern
 */
export const handleTextMessage = async (whatsapp: WhatsApp, message: WebhookMessage) => {
    console.log(`📨 Text message: "${message.text?.body}" from ${message.from}`);

    // Mark message as read
    await whatsapp.messages.markAsRead({ messageId: message.id });

    // Show typing indicator
    await whatsapp.messages.showTypingIndicator({ messageId: message.id });

    // Simulate thinking time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Build and send text response using builder pattern
    const textMessage = new TextMessageBuilder()
        .setBody(`Echo: ${message.text?.body}`)
        .setPreviewUrl(true) // Enable URL preview if message contains links
        .build();

    await whatsapp.messages.text({
        to: message.from,
        ...textMessage,
    });

    console.log(`✅ Text response sent to ${message.from}`);
};
