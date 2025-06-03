import WhatsApp, { MessageTypesEnum, WebhookMessage } from 'meta-cloud-api';
import { BUTTON_IDS, MESSAGE_TEMPLATES, getUserInfoMessage } from '../constants/messages';
import { webhookHandler as wa } from '../instance';

// Handle interactive messages (button responses)
wa.onMessage(MessageTypesEnum.Interactive, async (client: WhatsApp, message: WebhookMessage) => {
    console.log('Received interactive message:', message.interactive);

    if (message.interactive?.type === 'button_reply') {
        const buttonId = message.interactive.button_reply?.id;

        switch (buttonId) {
            case BUTTON_IDS.HELP:
                await handleHelpButton(client, message);
                break;
            case BUTTON_IDS.INFO:
                await handleInfoButton(client, message);
                break;
            default:
                console.warn(`Unknown button ID: ${buttonId}`);
        }
    }

    if (message.interactive?.type === 'nfm_reply') {
        const response = JSON.parse(message.interactive.nfm_reply?.response_json as string);

        await client.messages.text({
            to: message.from,
            body:
                `Thank you for your feedback! Here's a summary of your responses:\n\n` +
                `Would you recommend us?: ${response.screen_0_Choose_one_0 === '0_Yes' ? 'Yes' : 'No'}\n` +
                `Your comment: ${response.screen_0_Leave_a_comment_1}\n\n` +
                `Your ratings:\n` +
                `Purchase experience: ${response.screen_1_Purchase_experience_0.replace('_', ' ')}\n` +
                `Delivery and setup: ${response.screen_1_Delivery_and_setup_1.replace('_', ' ')}\n` +
                `Customer service: ${response.screen_1_Customer_service_2.replace('_', ' ')}`,
        });
    }
});

async function handleHelpButton(client: WhatsApp, message: WebhookMessage) {
    await client.messages.text({
        body: MESSAGE_TEMPLATES.HELP,
        to: message.from,
    });
}

async function handleInfoButton(client: WhatsApp, message: WebhookMessage) {
    await client.messages.text({
        body: getUserInfoMessage(message.from, message.profileName, message.displayPhoneNumber),
        to: message.from,
    });
}
