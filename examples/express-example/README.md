# 🤖 WhatsApp Echo Bot

A **super simple** WhatsApp bot that echoes back any message you send to it! Built with Express and the meta-cloud-api.

## ✨ What it does

Send any text message → Bot echoes it back with a 🔄 emoji

That's it! Simple and fun.

## 🚀 Quick Start

1. **Clone and install:**
   ```bash
   npm install
   ```

2. **Setup environment:**
   ```bash
   cp env.example .env
   # Edit .env with your WhatsApp credentials
   ```

3. **Run the bot:**
   ```bash
   npm run dev
   ```

4. **Test it:**
   - Open http://localhost:3000 
   - Send a message to your WhatsApp number
   - Watch it get echoed back! 🎉

## 📝 Environment Variables

```env
CLOUD_API_ACCESS_TOKEN=your_access_token
WA_PHONE_NUMBER_ID=your_phone_number_id
WEBHOOK_VERIFICATION_TOKEN=your_verification_token
```

## 🔧 The Complete Code

```typescript
import 'dotenv/config';
import express from 'express';
import { WhatsApp, MessageTypesEnum } from 'meta-cloud-api';
import { webhookHandler } from 'meta-cloud-api/webhook/express';

const app = express();

// 🔧 Configuration
const config = {
    accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
    phoneNumberId: parseInt(process.env.WA_PHONE_NUMBER_ID!),
    webhookVerificationToken: process.env.WEBHOOK_VERIFICATION_TOKEN!,
};

// 🤖 Create Echo Bot
const bot = webhookHandler(config);

// 💬 Echo any text message back
bot.processor.onMessage(MessageTypesEnum.Text, async (whatsapp, message) => {
    await whatsapp.messages.text({
        to: message.from,
        body: `🔄 ${message.text?.body}`,
    });
});

// 🌐 Setup webhook
app.get('/webhook', bot.webhook);
app.post('/webhook', express.json(), bot.webhook);
app.get('/', (req, res) => res.send('🤖 Echo Bot is running!'));

// 🚀 Start
app.listen(3000, () => console.log('🚀 Echo Bot started!'));
```

**Just 25 lines of code!** 🤯

## 🎯 Want to build more?

This echo bot shows how easy it is to:
- ✅ Handle WhatsApp messages
- ✅ Send responses
- ✅ Set up webhooks
- ✅ Use the meta-cloud-api SDK

Perfect starting point for building your own WhatsApp bots! 🚀