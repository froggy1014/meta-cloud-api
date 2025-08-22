import 'dotenv/config';
import express from 'express';
import { MessageTypesEnum } from 'meta-cloud-api';
import { webhookHandler } from 'meta-cloud-api/webhook/express';

// Import message handlers
import { handleTextMessage } from './text.ts';
import { handleImageMessage } from './image.ts';
import { handleDocumentMessage } from './document.ts';
import { handleContactMessage } from './contact.ts';
import { handleLocationMessage } from './location.ts';
import { handleInteractiveMessage } from './interactive.ts';

const app = express();

// 🔧 Configuration from environment variables
const whatsappConfig = {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
    phoneNumberId: parseInt(process.env.WHATSAPP_PHONE_NUMBER_ID!),
    businessAcctId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    webhookVerificationToken: process.env.WHATSAPP_WEBHOOK_VERIFICATION_TOKEN!,
};

// 🤖 Create WhatsApp Bot with new clean architecture
const Whatsapp = webhookHandler(whatsappConfig);

// ===================================
// 🎯 REGISTER MESSAGE HANDLERS
// ===================================
// Text message handler (enabled by default)
Whatsapp.processor.onMessage(MessageTypesEnum.Text, handleTextMessage);

// Image message handler
Whatsapp.processor.onMessage(MessageTypesEnum.Image, handleImageMessage);

// Document message handler
Whatsapp.processor.onMessage(MessageTypesEnum.Document, handleDocumentMessage);

// Contact message handler
Whatsapp.processor.onMessage(MessageTypesEnum.Contacts, handleContactMessage);

// Location message handler
Whatsapp.processor.onMessage(MessageTypesEnum.Location, handleLocationMessage);

// Interactive message handler
Whatsapp.processor.onMessage(MessageTypesEnum.Interactive, handleInteractiveMessage);

// ===================================
// 🌐 EXPRESS ROUTES WITH CLEAN ARCHITECTURE
// ===================================

// Pattern 1: Clean destructuring (recommended)
const { GET, POST } = Whatsapp;

app.get('/webhook', GET);
app.post('/webhook', express.json(), POST);

// Pattern 2: Alternative - Direct method access
// app.get('/webhook', Whatsapp.GET);
// app.post('/webhook', express.json(), Whatsapp.POST);

// Pattern 3: Auto-routing (simplest)
// app.use('/webhook', express.json());
// app.all('/webhook', Whatsapp.webhook);

// Health check endpoint
app.get('/', (req, res) => res.send('WhatsApp Bot is running! 🚀'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
    console.log('📱 Send a message to see the interactive features!');
    console.log('🔗 Webhook endpoint: http://localhost:' + PORT + '/webhook');
});
