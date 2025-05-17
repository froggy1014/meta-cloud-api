import WhatsApp, {
    ComponentTypesEnum,
    InteractiveTypesEnum,
    LanguagesEnum,
    MessageTypesEnum,
    ParametersTypesEnum,
    WebhookHandler,
    WebhookMessage,
} from 'meta-cloud-api';

const config = {
    accessToken: process.env.CLOUD_API_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WA_PHONE_NUMBER_ID ? Number(process.env.WA_PHONE_NUMBER_ID) : undefined,
    businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID || '',
    webhookVerificationToken: process.env.WEBHOOK_VERIFICATION_TOKEN || '',
};

export const webhookHandler = new WebhookHandler(config);

// Set up pre-processing handler
webhookHandler.onMessagePreProcess(async (client: WhatsApp, message: WebhookMessage) => {
    await client.messages.markAsRead({ messageId: message.id });
});

// Handle text messages
webhookHandler.onMessage(MessageTypesEnum.Text, async (client: WhatsApp, message: WebhookMessage) => {
    console.log('Received text message:', message.text?.body);

    if (message.text?.body) {
        const text = message.text.body.toLowerCase();

        // Simple command handling
        if (text === 'hello' || text === 'hi') {
            await client.messages.text({
                body: `Hello! How can I help you today?`,
                to: message.from,
            });
        } else if (text === 'help') {
            await client.messages.text({
                body: `Available commands:
- hello/hi: Get a greeting
- help: Show this help message
- info: Get account information
- template: See a template example
- interactive: See interactive message example`,
                to: message.from,
            });
        } else if (text === 'info') {
            await client.messages.text({
                body: `Your WhatsApp number: ${message.from}
Profile name: ${message.profileName}
Our phone: ${message.displayPhoneNumber}`,
                to: message.from,
            });
        } else if (text === 'template') {
            try {
                await client.messages.template({
                    to: message.from,
                    body: {
                        name: 'smaple_template', // Replace with your approved template name
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
                    body: "Sorry, couldn't send template. Ensure you have an approved template configured.",
                    to: message.from,
                });
            }
        } else if (text === 'interactive') {
            // Interactive message example
            await client.messages.interactive({
                to: message.from,
                body: {
                    type: InteractiveTypesEnum.Button,
                    body: {
                        text: 'What would you like to do?',
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
        } else {
            // Default response for other text messages
            await client.messages.text({
                body: `You said: "${message.text.body}"\nType "help" to see available commands.`,
                to: message.from,
            });
        }
    }
});

// Handle interactive messages (button responses)
webhookHandler.onMessage(MessageTypesEnum.Interactive, async (client: WhatsApp, message: WebhookMessage) => {
    console.log('Received interactive message:', message.interactive);

    if (message.interactive?.type === 'button_reply') {
        const buttonId = message.interactive.button_reply?.id;

        if (buttonId === 'help_button') {
            await client.messages.text({
                body: `Available commands:
- hello/hi: Get a greeting
- help: Show this help message
- info: Get account information
- template: See a template example
- interactive: See interactive message example`,
                to: message.from,
            });
        } else if (buttonId === 'info_button') {
            await client.messages.text({
                body: `Your WhatsApp number: ${message.from}
Profile name: ${message.profileName}
Our phone: ${message.displayPhoneNumber}`,
                to: message.from,
            });
        }
    }
});

// Handle image messages
webhookHandler.onMessage(MessageTypesEnum.Image, async (client: WhatsApp, message: WebhookMessage) => {
    console.log('Received image message');

    await client.messages.text({
        body: "Thanks for the image! I've received it.",
        to: message.from,
    });
});

// Handle document messages
webhookHandler.onMessage(MessageTypesEnum.Document, async (client: WhatsApp, message: WebhookMessage) => {
    console.log('Received document message');

    await client.messages.text({
        body: "Thanks for the document! I've received it.",
        to: message.from,
    });
});
