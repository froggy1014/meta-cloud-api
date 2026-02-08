import type { TextMessageHandler, TextProcessedMessage } from 'meta-cloud-api';

/**
 * Handler for text messages
 * Echoes back the received text with plain object API
 */
export const handleTextMessage: TextMessageHandler = async (whatsapp, processed: TextProcessedMessage) => {
    const { message } = processed;
    console.log(`📨 Text message: "${message.text.body}" from ${message.from}`);

    // Mark message as read
    await whatsapp.messages.markAsRead({ messageId: message.id });

    // Show typing indicator
    await whatsapp.messages.showTypingIndicator({ messageId: message.id });

    // Simulate thinking time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Send text response using plain object API
    await whatsapp.messages.text({
        to: message.from,
        body: `Echo: ${message.text.body}`,
        previewUrl: true, // Enable URL preview if message contains links
    });

    console.log(`✅ Text response sent to ${message.from}`);
};
