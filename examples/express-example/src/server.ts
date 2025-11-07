import 'dotenv/config';
import express from 'express';
import { webhookHandler } from 'meta-cloud-api/webhook/express';

// Import message handlers
import { handleTextMessage } from './text.ts';
import { handleImageMessage } from './image.ts';
import { handleDocumentMessage } from './document.ts';
import { handleContactMessage } from './contact.ts';
import { handleLocationMessage } from './location.ts';
import { handleInteractiveMessage } from './interactive.ts';

// Import webhook field handlers
import { handleFlowsWebhook } from './webhookFieldHandlers/flows.ts';
import { handleAccountUpdateWebhook } from './webhookFieldHandlers/accountUpdate.ts';
import { handleHistoryWebhook } from './webhookFieldHandlers/history.ts';

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
// Using type-safe specialized handlers (recommended)

// Text message handler
Whatsapp.processor.onText(handleTextMessage);

// Image message handler
Whatsapp.processor.onImage(handleImageMessage);

// Document message handler
Whatsapp.processor.onDocument(handleDocumentMessage);

// Contact message handler
Whatsapp.processor.onContacts(handleContactMessage);

// Location message handler
Whatsapp.processor.onLocation(handleLocationMessage);

// Interactive message handler (for button/list/flow responses)
Whatsapp.processor.onInteractive(handleInteractiveMessage);

// ===================================
// 🎯 REGISTER WEBHOOK FIELD HANDLERS
// ===================================
// These handlers process webhook fields other than 'messages'
// @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account

// Flows webhook handler
Whatsapp.processor.onFlows(handleFlowsWebhook);

// Account update webhook handler
Whatsapp.processor.onAccountUpdate(handleAccountUpdateWebhook);

// History sync webhook handler
Whatsapp.processor.onHistory(handleHistoryWebhook);

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
