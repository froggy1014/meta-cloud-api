import WhatsApp, {
    ComponentTypesEnum,
    InteractiveTypesEnum,
    LanguagesEnum,
    MessageTypesEnum,
    ParametersTypesEnum,
    WebhookMessage,
} from 'meta-cloud-api';
import { COMMANDS, MESSAGE_TEMPLATES, getDefaultResponse, getUserInfoMessage } from '../constants/messages';
import { webhookHandler as wa } from '../instance';

// TODO: replace with your flow id
const FLOW_ID = '596513850146562';

// Handle text messages
wa.onMessage(MessageTypesEnum.Text, async (client: WhatsApp, message: WebhookMessage) => {
    console.log('Received text message:', message.text?.body);

    if (!message.text?.body) return;

    const text = message.text.body.toLowerCase();

    // Use named functions for better readability
    if ((COMMANDS.HELLO as readonly string[]).includes(text)) {
        await handleGreeting(client, message);
    } else if (text === COMMANDS.HELP) {
        await handleHelp(client, message);
    } else if (text === COMMANDS.INFO) {
        await handleInfo(client, message);
    } else if (text === COMMANDS.TEMPLATE) {
        await handleTemplate(client, message);
    } else if (text === COMMANDS.INTERACTIVE) {
        await handleInteractive(client, message);
    } else if (text === COMMANDS.FLOW) {
        await handleFeedback(client, message);
    } else {
        await handleDefault(client, message);
    }
});

async function handleGreeting(client: WhatsApp, message: WebhookMessage) {
    await client.messages.text({
        body: MESSAGE_TEMPLATES.GREETING,
        to: message.from,
    });
}

async function handleHelp(client: WhatsApp, message: WebhookMessage) {
    await client.messages.text({
        body: MESSAGE_TEMPLATES.HELP,
        to: message.from,
    });
}

async function handleInfo(client: WhatsApp, message: WebhookMessage) {
    await client.messages.text({
        body: getUserInfoMessage(message.from, message.profileName, message.displayPhoneNumber),
        to: message.from,
    });
}

async function handleTemplate(client: WhatsApp, message: WebhookMessage) {
    try {
        await client.messages.template({
            to: message.from,
            body: {
                name: 'meta_cloud_api_example', // Replace with your approved template name
                language: {
                    code: LanguagesEnum.English_US,
                    policy: 'deterministic',
                },
                components: [
                    {
                        type: ComponentTypesEnum.Body,
                        parameters: [
                            {
                                type: ParametersTypesEnum.Text,
                                text: message.profileName || 'customer',
                            },
                        ],
                    },
                ],
            },
        });
    } catch (error) {
        console.error('Template error:', error);
        await client.messages.text({
            body: MESSAGE_TEMPLATES.TEMPLATE_ERROR,
            to: message.from,
        });
    }
}

async function handleInteractive(client: WhatsApp, message: WebhookMessage) {
    await client.messages.interactive({
        to: message.from,
        body: {
            type: InteractiveTypesEnum.Button,
            body: {
                text: MESSAGE_TEMPLATES.INTERACTIVE_PROMPT,
            },
            action: {
                buttons: [
                    {
                        type: 'reply',
                        reply: {
                            id: 'help_button',
                            title: 'Get Help',
                        },
                    },
                    {
                        type: 'reply',
                        reply: {
                            id: 'info_button',
                            title: 'Account Info',
                        },
                    },
                ],
            },
        },
    });
}

async function handleDefault(client: WhatsApp, message: WebhookMessage) {
    await client.messages.text({
        body: getDefaultResponse(message.text?.body || ''),
        to: message.from,
    });
}

async function handleFeedback(client: WhatsApp, message: WebhookMessage) {
    await client.messages.interactiveFlow({
        to: message.from,
        body: {
            type: InteractiveTypesEnum.Flow,
            body: {
                text: '📝 Customer Feedback Survey\n\nWe value your opinion! Please take a moment to share your experience with us. Your feedback helps us improve our service.',
            },
            action: {
                name: 'flow',
                parameters: {
                    flow_message_version: '3',
                    flow_action: 'data_exchange',
                    flow_token: `${message.from}:${message.from}`,
                    flow_id: FLOW_ID,
                    flow_cta: 'Start Survey',
                    mode: 'published',
                },
            },
        },
    });
}
