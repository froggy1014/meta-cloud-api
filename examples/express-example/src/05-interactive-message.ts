import 'dotenv/config';
import express from 'express';
import { InteractiveTypesEnum, MessageTypesEnum } from 'meta-cloud-api';
import { InteractiveMessageBuilder } from 'meta-cloud-api/api/messages/builders';
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

    // // ==== ACTIVE: Button list example ====
    // const buttonMessage = new InteractiveMessageBuilder()
    //     .setType(InteractiveTypesEnum.Button)
    //     .setBody('Choose an option:')
    //     .addReplyButtons([
    //         { id: 'btn_1', title: 'Option 1' },
    //         { id: 'btn_2', title: 'Option 2' },
    //         { id: 'btn_3', title: 'Option 3' },
    //     ])

    //     .build();

    // await whatsapp.messages.interactive({
    //     to: message.from,
    //     body: buttonMessage,
    // });

    // ==== Example 1: List menu ====
    // Uncomment to use:

    // const listMessage = new InteractiveMessageBuilder()
    //     .setType(InteractiveTypesEnum.List)
    //     .setTextHeader('Our Menu')
    //     .setBody('Select items from our menu')
    //     .setFooter('Powered by WhatsApp')
    //     .setListButtonText('View Menu')
    //     .addListSections([
    //         {
    //             title: 'Main Dishes',
    //             rows: [
    //                 {
    //                     id: 'pizza',
    //                     title: 'Pizza',
    //                     description: 'Delicious cheese pizza',
    //                 },
    //                 {
    //                     id: 'burger',
    //                     title: 'Burger',
    //                     description: 'Juicy beef burger',
    //                 },
    //             ],
    //         },
    //     ])
    //     .build();

    // await whatsapp.messages.interactive({
    //     to: message.from,
    //     body: listMessage,
    // });

    // ==== Example 2: CTA URL button ====
    // Uncomment to use:
    const ctaMessage = new InteractiveMessageBuilder()
        .setType(InteractiveTypesEnum.CtaUrl)
        .setTextHeader('Visit Our Website')
        .setBody('Click the button below to visit our website and learn more about our services.')
        .setFooter('Available 24/7')
        .setCTAUrl('Visit Website', 'https://example.com')
        .build();

    await whatsapp.messages.interactive({
        to: message.from,
        body: ctaMessage,
    });
});

// Handle interactive messages (button/list responses)
bot.processor.onMessage(MessageTypesEnum.Interactive, async (whatsapp, message) => {
    const buttonReply = message.interactive?.button_reply;
    const listReply = message.interactive?.list_reply;

    if (buttonReply) {
        console.log(`Button clicked: ${buttonReply.id}`);
        await whatsapp.messages.text({
            to: message.from,
            body: `You selected button: ${buttonReply.title} (ID: ${buttonReply.id})`,
        });
    }

    if (listReply) {
        console.log(`List item selected: ${listReply.id}`);
        await whatsapp.messages.text({
            to: message.from,
            body: `You selected: ${listReply.title} (ID: ${listReply.id})`,
        });
    }
});

// Setup webhook endpoints
app.get('/webhook', bot.webhook);
app.post('/webhook', express.json(), bot.webhook);

// Homepage
app.get('/', (req, res) => res.send('WhatsApp Interactive Message Example is running!'));

// Start server
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`Interactive message example server running on port ${PORT}`);
    console.log('Features:');
    console.log('- Active: Button selection');
    console.log('- Active: Handle button/list responses');
    console.log('- Available: List menu, CTA URL button');
});
