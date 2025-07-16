import 'dotenv/config';
import express from 'express';
import { LanguagesEnum, MessageTypesEnum } from 'meta-cloud-api';
import { webhookHandler } from 'meta-cloud-api/webhook/express';

const app = express();

// Configuration from environment variables
const config = {
    accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
    phoneNumberId: parseInt(process.env.WA_PHONE_NUMBER_ID!),
    webhookVerificationToken: process.env.WEBHOOK_VERIFICATION_TOKEN!,
};

// Create webhook handler
const bot = webhookHandler(config);

// Handle text messages
bot.processor.onMessage(MessageTypesEnum.Text, async (whatsapp, message) => {
    console.log(`Received message: "${message.text?.body}" from ${message.from}`);

    // Mark message as read
    await whatsapp.messages.markAsRead({ messageId: message.id });

    // ==== ACTIVE: Simple template (requires pre-approved template) ====
    // Note: You must have a template approved in your WhatsApp Business account
    try {
        await whatsapp.messages.template({
            to: message.from,
            body: {
                name: 'hello_world', // Replace with your template name
                language: {
                    policy: 'deterministic',
                    code: LanguagesEnum.English_US, // Replace with your template language
                },
            },
        });
    } catch (error) {
        console.error('Template error:', error);
        // Fallback to text message
        await whatsapp.messages.text({
            to: message.from,
            body: 'Template not found. Please ensure you have approved templates in your WhatsApp Business account.',
        });
    }

    // ==== Example 1: Template with parameters ====
    // Uncomment to use (requires template with parameters):
    /*
    await whatsapp.messages.template({
        to: message.from,
        body: {
            name: "order_confirmation",  // Your template name
            language: {
                policy: 'deterministic',
                code: LanguagesEnum.English_US
            },
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: "John Doe" },
                        { type: "text", text: "ORDER-12345" },
                        { type: "text", text: "$99.99" }
                    ]
                }
            ]
        }
    });
    */

    // ==== Example 2: Template with header image ====
    // Uncomment to use:
    /*
    await whatsapp.messages.template({
        to: message.from,
        body: {
            name: "product_announcement",
            language: {
                policy: 'deterministic',
                code: LanguagesEnum.English_US
            },
            components: [
                {
                    type: "header",
                    parameters: [
                        {
                            type: "image",
                            image: {
                                link: "https://example.com/product.jpg"
                            }
                        }
                    ]
                },
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: "New Product" },
                        { type: "text", text: "$49.99" }
                    ]
                }
            ]
        }
    });
    */

    // ==== Example 3: Template with quick reply buttons ====
    // Uncomment to use:
    /*
    await whatsapp.messages.template({
        to: message.from,
        body: {
            name: "appointment_reminder",
            language: {
                policy: 'deterministic',
                code: LanguagesEnum.English_US
            },
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: "Dr. Smith" },
                        { type: "text", text: "Tomorrow at 3:00 PM" }
                    ]
                },
                {
                    type: "button",
                    sub_type: "quick_reply",
                    index: "0",
                    parameters: [
                        {
                            type: "payload",
                            payload: "CONFIRM_APPOINTMENT"
                        }
                    ]
                },
                {
                    type: "button", 
                    sub_type: "quick_reply",
                    index: "1",
                    parameters: [
                        {
                            type: "payload",
                            payload: "CANCEL_APPOINTMENT"
                        }
                    ]
                }
            ]
        }
    });
    */
});

// Setup webhook endpoints
app.get('/webhook', bot.webhook);
app.post('/webhook', express.json(), bot.webhook);

// Homepage
app.get('/', (req, res) => res.send('WhatsApp Template Message Example is running!'));

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Template message example server running on port ${PORT}`);
    console.log('Features:');
    console.log('- Active: Basic template message');
    console.log('- Available: Templates with parameters, images, buttons');
    console.log('Note: Templates must be pre-approved in your WhatsApp Business account');
});
