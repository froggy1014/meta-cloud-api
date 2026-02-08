// Import all message handlers

import { nextjsPagesWebhookHandler } from 'meta-cloud-api';
import { handleContactMessage } from '@/lib/messageHandlers/contact';
import { handleDocumentMessage } from '@/lib/messageHandlers/document';
import { handleImageMessage } from '@/lib/messageHandlers/image';
import { handleInteractiveMessage } from '@/lib/messageHandlers/interactive';
import { handleLocationMessage } from '@/lib/messageHandlers/location';
import { handleTextMessage } from '@/lib/messageHandlers/text';

// Disable Next.js body parser to handle raw body for webhook verification
export const config = {
    api: {
        bodyParser: false,
    },
};

// 🔧 Configuration from environment variables
const whatsappConfig = {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
    phoneNumberId: parseInt(process.env.WHATSAPP_PHONE_NUMBER_ID!),
    businessAcctId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    webhookVerificationToken: process.env.WHATSAPP_WEBHOOK_VERIFICATION_TOKEN!,
};

// 🤖 Create WhatsApp Bot with new clean architecture
const Whatsapp = nextjsPagesWebhookHandler(whatsappConfig);

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
// 🌐 MAIN API ROUTE HANDLER
// ===================================
// The webhook handler automatically handles body parsing and method routing
export default Whatsapp.webhook;
