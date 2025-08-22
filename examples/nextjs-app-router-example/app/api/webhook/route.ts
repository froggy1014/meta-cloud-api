import { MessageTypesEnum } from 'meta-cloud-api/types/enums';
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
// Uncomment the handlers you want to use:

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

// Interactive message handler (for button/list responses)
Whatsapp.processor.onMessage(MessageTypesEnum.Interactive, handleInteractiveMessage);

// ===================================
// 🌐 CLEAN EXPORT PATTERN
// ===================================
// Clean export pattern following whatsapp-api-js methodology
export const { GET, POST } = Whatsapp.webhook;
