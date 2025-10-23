import { webhookHandler } from 'meta-cloud-api/webhook/nextjs-app';

// Import all message handlers
import {
    handleTextMessage,
    handleImageMessage,
    handleDocumentMessage,
    handleContactMessage,
    handleLocationMessage,
    handleInteractiveMessage,
} from '@/lib/messageHandlers';

// 🔧 Configuration from environment variables
const whatsappConfig = {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
    phoneNumberId: parseInt(process.env.WHATSAPP_PHONE_NUMBER_ID!),
    businessAcctId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    webhookVerificationToken: process.env.WHATSAPP_WEBHOOK_VERIFICATION_TOKEN!,
};

// 🤖 Create WhatsApp Bot
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
// 🌐 CLEAN EXPORT PATTERN
// ===================================
// Clean export pattern following whatsapp-api-js methodology
export const { GET, POST } = Whatsapp.webhook;
