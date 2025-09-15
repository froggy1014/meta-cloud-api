// Import all message handlers
import { handleContactMessage } from '@/lib/messageHandlers/contact';
import { handleDocumentMessage } from '@/lib/messageHandlers/document';
import { handleImageMessage } from '@/lib/messageHandlers/image';
import { handleInteractiveMessage } from '@/lib/messageHandlers/interactive';
import { handleLocationMessage } from '@/lib/messageHandlers/location';
import { handleTextMessage } from '@/lib/messageHandlers/text';
import { nextjsWebhookHandler } from 'meta-cloud-api';
import { MessageTypesEnum } from 'meta-cloud-api/enums';

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
const Whatsapp = nextjsWebhookHandler(whatsappConfig);

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

// Interactive message handler
Whatsapp.processor.onMessage(MessageTypesEnum.Interactive, handleInteractiveMessage);

// ===================================
// 🌐 MAIN API ROUTE HANDLER
// ===================================
// The webhook handler automatically handles body parsing and method routing
export default Whatsapp.webhook;
