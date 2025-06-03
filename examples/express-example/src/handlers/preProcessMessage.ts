import WhatsApp, { WebhookMessage } from 'meta-cloud-api';
import { webhookHandler as wa } from '../instance';

wa.onMessagePreProcess(async (client: WhatsApp, message: WebhookMessage) => {
    await client.messages.markAsRead({ messageId: message.id });
});
