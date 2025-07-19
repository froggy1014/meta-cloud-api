import type { WebhookMessage, WhatsApp } from 'meta-cloud-api';
import { TextMessageBuilder } from 'meta-cloud-api/api/messages/builders';

export const handleTextMessage = async (whatsapp: WhatsApp, message: WebhookMessage) => {
    console.log(`📨 Text message: "${message.text?.body}" from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });
    await whatsapp.messages.showTypingIndicator({ messageId: message.id });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const textMessage = new TextMessageBuilder().setBody(`Echo: ${message.text?.body}`).setPreviewUrl(true).build();

    await whatsapp.messages.text({
        to: message.from,
        ...textMessage,
    });

    console.log(`✅ Text response sent to ${message.from}`);
};
