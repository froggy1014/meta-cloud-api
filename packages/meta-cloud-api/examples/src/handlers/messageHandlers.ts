import WhatsApp, { ComponentTypesEnum, InteractiveTypesEnum, LanguagesEnum, ParametersTypesEnum } from '../../../src';

/**
 * Handle text messages
 */
export async function handleTextMessage(whatsapp: WhatsApp, message: any) {
    console.log(`Processing text message: ${message.text.body}`);

    // Check if the message is exactly "template"
    if (message.text.body.toLowerCase() === 'template') {
        try {
            // Send an interactive message with quick reply buttons
            const response = await whatsapp.messages.interactive({
                body: {
                    type: InteractiveTypesEnum.Button,
                    body: {
                        text: 'This is a sample template with quick reply buttons. Please select an option:',
                    },
                    action: {
                        buttons: [
                            {
                                type: 'reply',
                                reply: {
                                    id: 'option_1',
                                    title: 'Option 1',
                                },
                            },
                            {
                                type: 'reply',
                                reply: {
                                    id: 'option_2',
                                    title: 'Option 2',
                                },
                            },
                            {
                                type: 'reply',
                                reply: {
                                    id: 'option_3',
                                    title: 'Option 3',
                                },
                            },
                        ],
                    },
                },
                to: message.from,
            });
            console.log('Interactive message with buttons sent:', response.messages[0].id);
        } catch (error) {
            console.error('Error sending interactive message:', error);

            // If interactive message sending fails, send fallback text
            const fallbackResponse = await whatsapp.messages.text({
                body: 'I tried to send you an interactive template but encountered an error.',
                to: message.from,
            });
            console.log('Fallback text sent:', fallbackResponse.messages[0].id);
        }
    } else {
        // For any other text message, echo back the same message
        const response = await whatsapp.messages.text({
            body: message.text.body, // Echo back the exact same message
            to: message.from,
        });
        console.log('Text reply sent:', response.messages[0].id);
    }
}

/**
 * Handle image messages
 */
export async function handleImageMessage(whatsapp: WhatsApp, message: any) {
    console.log(`Processing image message, image ID: ${message.image.id}`);

    try {
        // Echo back the same image using its ID
        const response = await whatsapp.messages.image({
            body: {
                id: message.image.id, // Use the same image ID that was received
                caption: message.image.caption || 'Image echo', // Use original caption if available
            },
            to: message.from,
        });
        console.log('Image echo sent with ID:', response.messages[0].id);
    } catch (error) {
        console.error('Error sending image echo:', error);

        // If using media ID fails, try to respond with text
        const textResponse = await whatsapp.messages.text({
            body: `I received your image but couldn't send it back. Media IDs expire after 30 days.`,
            to: message.from,
        });
        console.log('Fallback text reply sent:', textResponse.messages[0].id);
    }
}

/**
 * Handle audio messages
 */
export async function handleAudioMessage(whatsapp: WhatsApp, message: any) {
    console.log(`Processing audio message, audio ID: ${message.audio.id}`);

    try {
        // Echo back the same audio file using its ID
        const response = await whatsapp.messages.audio({
            body: {
                id: message.audio.id, // Use the same audio ID that was received
            },
            to: message.from,
        });
        console.log('Audio echo sent with ID:', response.messages[0].id);
    } catch (error) {
        console.error('Error sending audio echo:', error);

        // If using media ID fails, respond with text
        const textResponse = await whatsapp.messages.text({
            body: `I received your audio message but couldn't send it back. Media IDs expire after 30 days.`,
            to: message.from,
        });
        console.log('Fallback text reply sent:', textResponse.messages[0].id);
    }
}

/**
 * Handle video messages
 */
export async function handleVideoMessage(whatsapp: WhatsApp, message: any) {
    console.log(`Processing video message, video ID: ${message.video.id}`);

    try {
        // Echo back the same video using its ID
        const response = await whatsapp.messages.video({
            body: {
                id: message.video.id, // Use the same video ID that was received
                caption: message.video.caption || 'Video echo', // Use original caption if available
            },
            to: message.from,
        });
        console.log('Video echo sent with ID:', response.messages[0].id);
    } catch (error) {
        console.error('Error sending video echo:', error);

        // If using media ID fails, respond with text
        const textResponse = await whatsapp.messages.text({
            body: `I received your video but couldn't send it back. Media IDs expire after 30 days.`,
            to: message.from,
        });
        console.log('Fallback text reply sent:', textResponse.messages[0].id);
    }
}

/**
 * Handle document messages
 */
export async function handleDocumentMessage(whatsapp: WhatsApp, message: any) {
    console.log(`Processing document message, document ID: ${message.document.id}`);

    try {
        // Echo back the same document using its ID
        const response = await whatsapp.messages.document({
            body: {
                id: message.document.id, // Use the same document ID that was received
                caption: message.document.caption || message.document.filename || 'Document echo', // Use original caption or filename
                filename: message.document.filename || 'document.pdf', // Use original filename if available
            },
            to: message.from,
        });
        console.log('Document echo sent with ID:', response.messages[0].id);
    } catch (error) {
        console.error('Error sending document echo:', error);

        // If using media ID fails, respond with text
        const textResponse = await whatsapp.messages.text({
            body: `I received your document (${message.document.filename || 'file'}) but couldn't send it back. Media IDs expire after 30 days.`,
            to: message.from,
        });
        console.log('Fallback text reply sent:', textResponse.messages[0].id);
    }
}

/**
 * Handle location messages
 */
export async function handleLocationMessage(whatsapp: WhatsApp, message: any) {
    console.log(`Processing location message, lat: ${message.location.latitude}, long: ${message.location.longitude}`);

    try {
        // Echo back the same location
        const response = await whatsapp.messages.location({
            body: {
                latitude: message.location.latitude,
                longitude: message.location.longitude,
                name: message.location.name || 'Shared location',
                address: message.location.address || 'Location address not provided',
            },
            to: message.from,
        });
        console.log('Location echo sent:', response.messages[0].id);
    } catch (error) {
        console.error('Error sending location echo:', error);

        // If location sending fails, respond with text
        const textResponse = await whatsapp.messages.text({
            body: `I received your location (${message.location.latitude}, ${message.location.longitude}) but couldn't send it back.`,
            to: message.from,
        });
        console.log('Fallback text reply sent:', textResponse.messages[0].id);
    }
}

/**
 * Handle contacts messages
 */
export async function handleContactsMessage(whatsapp: WhatsApp, message: any) {
    console.log(`Processing contacts message with ${message.contacts.length} contacts`);

    try {
        // Echo back the same contacts
        const response = await whatsapp.messages.contacts({
            body: message.contacts, // Use the exact same contacts array
            to: message.from,
        });
        console.log('Contacts echo sent:', response.messages[0].id);
    } catch (error) {
        console.error('Error sending contacts echo:', error);

        // If contacts sending fails, respond with text
        const textResponse = await whatsapp.messages.text({
            body: `I received ${message.contacts.length} contact(s) but couldn't send them back.`,
            to: message.from,
        });
        console.log('Fallback text reply sent:', textResponse.messages[0].id);
    }
}

/**
 * Handle button messages
 */
export async function handleButtonMessage(whatsapp: WhatsApp, message: any) {
    console.log(`Processing button message`);

    try {
        // Send button click acknowledgment
        await whatsapp.messages.text({
            body: `Thank you for clicking the button!`,
            to: message.from,
        });

        // Reply with a template message (template must be pre-registered with your WhatsApp Business Account)
        // Change this to an actual approved template name in production
        const templateName = 'sample_template';

        const response = await whatsapp.messages.template({
            body: {
                name: templateName,
                language: {
                    code: LanguagesEnum.English,
                    policy: 'deterministic',
                },
                components: [
                    {
                        type: ComponentTypesEnum.Body,
                        parameters: [
                            {
                                type: ParametersTypesEnum.Text,
                                text: 'customer',
                            },
                        ],
                    },
                ],
            },
            to: message.from,
        });

        console.log('Template reply sent:', response.messages[0].id);
    } catch (error) {
        console.error('Error sending template reply:', error);

        // Send fallback text message if template sending fails
        const textResponse = await whatsapp.messages.text({
            body: `I tried to send you additional information but encountered an error. Please contact customer support.`,
            to: message.from,
        });
        console.log('Fallback text reply sent:', textResponse.messages[0].id);
    }
}

/**
 * Handle interactive messages
 */
export async function handleInteractiveMessage(whatsapp: WhatsApp, message: any) {
    console.log(`Processing interactive message type: ${message.interactive.type}`);

    try {
        // Get the user's response from the interactive message
        let userResponse = '';
        let responseType = message.interactive.type;

        if (responseType === 'button_reply') {
            userResponse = message.interactive.button_reply.title;
        } else if (responseType === 'list_reply') {
            userResponse = message.interactive.list_reply.title;
        } else {
            userResponse = `unknown interactive type: ${responseType}`;
        }

        // Send a text message acknowledging the interactive response
        const response = await whatsapp.messages.text({
            body: `You selected: "${userResponse}"`,
            to: message.from,
        });
        console.log('Interactive response acknowledged:', response.messages[0].id);
    } catch (error) {
        console.error('Error handling interactive message:', error);

        // If processing fails, respond with text
        const textResponse = await whatsapp.messages.text({
            body: `I received your interactive message but couldn't process it properly.`,
            to: message.from,
        });
        console.log('Fallback text reply sent:', textResponse.messages[0].id);
    }
}

/**
 * Handle sticker messages
 */
export async function handleStickerMessage(whatsapp: WhatsApp, message: any) {
    console.log(`Processing sticker message, sticker ID: ${message.sticker.id}`);

    try {
        // Echo back the same sticker
        const response = await whatsapp.messages.sticker({
            body: {
                id: message.sticker.id, // Use the same sticker ID that was received
            },
            to: message.from,
        });
        console.log('Sticker echo sent:', response.messages[0].id);
    } catch (error) {
        console.error('Error sending sticker echo:', error);

        // If sticker sending fails, respond with text
        const textResponse = await whatsapp.messages.text({
            body: `I received your sticker but couldn't send it back. Media IDs expire after 30 days.`,
            to: message.from,
        });
        console.log('Fallback text reply sent:', textResponse.messages[0].id);
    }
}

/**
 * Handle unknown message types
 */
export async function handleUnknownMessage(whatsapp: WhatsApp, message: any) {
    console.log(`Processing unknown message type: ${message.type}`);
    const response = await whatsapp.messages.text({
        body: `I received your message but I'm not sure how to process this type.`,
        to: message.from,
    });
    console.log('Unknown type reply sent:', response.messages[0].id);
}
