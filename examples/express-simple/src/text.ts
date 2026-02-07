import type { WebhookMessage, WhatsApp } from 'meta-cloud-api';

export const handleTextMessage = async (whatsapp: WhatsApp, message: WebhookMessage) => {
    console.log(`📨 Text message: "${message.text?.body}" from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });
    await whatsapp.messages.showTypingIndicator({ messageId: message.id });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await whatsapp.messages.text({
        to: message.from,
        body: `Echo: ${message.text?.body}`,
        previewUrl: true,
    });

    console.log(`✅ Text response sent to ${message.from}`);
};
