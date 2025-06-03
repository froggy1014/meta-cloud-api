import WhatsApp, { MessageTypesEnum, WebhookMessage } from 'meta-cloud-api';
import { MESSAGE_TEMPLATES } from '../constants/messages';
import { webhookHandler as wa } from '../instance';

// Handle image messages
wa.onMessage(MessageTypesEnum.Image, async (client: WhatsApp, message: WebhookMessage) => {
    console.log('Received image message');

    await client.messages.text({
        body: MESSAGE_TEMPLATES.IMAGE_RECEIVED,
        to: message.from,
    });
});

// Handle document messages
wa.onMessage(MessageTypesEnum.Document, async (client: WhatsApp, message: WebhookMessage) => {
    console.log('Received document message');

    await client.messages.text({
        body: MESSAGE_TEMPLATES.DOCUMENT_RECEIVED,
        to: message.from,
    });
});

// Handle audio messages
wa.onMessage(MessageTypesEnum.Audio, async (client: WhatsApp, message: WebhookMessage) => {
    console.log('Received audio message');

    await client.messages.text({
        body: MESSAGE_TEMPLATES.AUDIO_RECEIVED,
        to: message.from,
    });
});

// Handle video messages
wa.onMessage(MessageTypesEnum.Video, async (client: WhatsApp, message: WebhookMessage) => {
    console.log('Received video message');

    await client.messages.text({
        body: MESSAGE_TEMPLATES.VIDEO_RECEIVED,
        to: message.from,
    });
});
