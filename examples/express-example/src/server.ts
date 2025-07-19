import 'dotenv/config';
import express from 'express';
import { MessageTypesEnum } from 'meta-cloud-api';

import { webhookHandler } from 'meta-cloud-api/webhook/express';
import { handleTextMessage } from './text.ts';

const app = express();

const config = {
    accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
    phoneNumberId: parseInt(process.env.WA_PHONE_NUMBER_ID!),
    webhookVerificationToken: process.env.WEBHOOK_VERIFICATION_TOKEN!,
};

const bot = webhookHandler(config);

// Text message handler (enabled by default)
bot.processor.onMessage(MessageTypesEnum.Text, handleTextMessage);

// Image message handler
// bot.processor.onMessage(MessageTypesEnum.Text, handleImageMessage);

// Document message handler
// bot.processor.onMessage(MessageTypesEnum.Text, handleDocumentMessage);

// Contact message handler
// bot.processor.onMessage(MessageTypesEnum.Text, handleContactMessage);

// Location message handler
// bot.processor.onMessage(MessageTypesEnum.Text, handleLocationMessage);

// Interactive message handler
// bot.processor.onMessage(MessageTypesEnum.Text, handleInteractiveMessage);

app.get('/webhook', bot.webhook);
app.post('/webhook', express.json(), bot.webhook);

app.get('/', (req, res) => res.send('WhatsApp Bot is running!'));

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
    console.log('Send a message to see the interactive menu!');
});
