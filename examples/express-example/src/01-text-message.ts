import 'dotenv/config';
import express from 'express';
import { MessageTypesEnum } from 'meta-cloud-api';
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

    // ==== ACTIVE: Basic text message ====
    await whatsapp.messages.text({
        to: message.from,
        body: `Hello! You said: "${message.text?.body}"`,
    });

    // ==== Example 1: Text message with URL preview ====
    // Uncomment to use:
    /*
    await whatsapp.messages.text({
        to: message.from,
        body: "Check out our website: https://example.com",
        preview_url: true
    });
    */

    // ==== Example 2: Multiple messages ====
    // Uncomment to use:
    /*
    await whatsapp.messages.text({
        to: message.from,
        body: "This is the first message"
    });
    
    await whatsapp.messages.text({
        to: message.from,
        body: "This is the second message"
    });
    */

    // ==== Example 3: Message with context (reply) ====
    // Uncomment to use:
    /*
    await whatsapp.messages.text({
        to: message.from,
        body: "Important notification!",
        context: {
            message_id: message.id  // Reply to specific message
        }
    });
    */
});

// Setup webhook endpoints
app.get('/webhook', bot.webhook);
app.post('/webhook', express.json(), bot.webhook);

// Homepage
app.get('/', (req, res) => res.send('WhatsApp Text Message Example is running!'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Text message example server running on port ${PORT}`);
    console.log('Features:');
    console.log('- Active: Basic text echo');
    console.log('- Available: URL preview, multiple messages, notification context');
    console.log('Edit the code and uncomment sections to try different features!');
});
