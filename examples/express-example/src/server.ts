import 'dotenv/config';
import express from 'express';
import { MessageTypesEnum } from 'meta-cloud-api';
import { webhookHandler } from 'meta-cloud-api/webhook/express';

const app = express();

// 🔧 Configuration from environment variables
const config = {
    accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
    phoneNumberId: parseInt(process.env.WA_PHONE_NUMBER_ID!),
    webhookVerificationToken: process.env.WEBHOOK_VERIFICATION_TOKEN!,
};

// 🤖 Create Echo Bot
const bot = webhookHandler(config);

// 💬 Echo any text message back with typing indicator
bot.processor.onMessage(MessageTypesEnum.Text, async (whatsapp, message) => {
    console.log(`📨 "${message.text?.body}" from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });

    await whatsapp.messages.showTypingIndicator({ messageId: message.id });

    const thinkingTime = Math.random() * 1000 + 1000;
    await new Promise((resolve) => setTimeout(resolve, thinkingTime));

    // 🔄 Send the echo response
    await whatsapp.messages.text({
        to: message.from,
        body: `🔄 ${message.text?.body}`,
    });

    console.log(`✅ Echoed back to ${message.from}`);
});

// 🌐 Setup webhook endpoint
app.get('/webhook', bot.webhook);
app.post('/webhook', express.json(), bot.webhook);

// 🏠 Homepage
app.get('/', (req, res) => res.send('🤖 WhatsApp Echo Bot is running!'));

// 🚀 Start server
app.listen(3000, () => {
    console.log('🚀 Echo Bot started on http://localhost:3000');
    console.log('💬 Send a message to your WhatsApp number to see it echoed back!');
});
