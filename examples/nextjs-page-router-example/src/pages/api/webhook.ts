import {
    handleInteractiveMessage,
} from '@/lib/messageHandlers';
import { MessageTypesEnum } from 'meta-cloud-api';
import { NextJsWebhook } from 'meta-cloud-api/webhook';
import { NextApiRequest, NextApiResponse } from 'next';

// Disable Next.js body parser to handle raw body for webhook verification
export const config = {
    api: {
        bodyParser: false,
    },
};

// 🔧 Configuration from environment variables
const whatsappConfig = {
    accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
    phoneNumberId: parseInt(process.env.WA_PHONE_NUMBER_ID!),
    webhookVerificationToken: process.env.WEBHOOK_VERIFICATION_TOKEN!,
};

// 🤖 Create WhatsApp Bot
const bot = NextJsWebhook(whatsappConfig);

// ===================================
// 🎯 REGISTER MESSAGE HANDLERS
// ===================================
// Uncomment the handlers you want to use:

// Text message handler (enabled by default)
// bot.processor.onMessage(MessageTypesEnum.Text, handleTextMessage);

// Image message handler
// bot.processor.onMessage(MessageTypesEnum.Text, handleImageMessage);

// Document message handler
// bot.processor.onMessage(MessageTypesEnum.Text, handleDocumentMessage);

// Contact message handler
// bot.processor.onMessage(MessageTypesEnum.Text, handleContactMessage);

// Location message handler
// bot.processor.onMessage(MessageTypesEnum.Text, handleLocationMessage);

// Interactive message handler
bot.processor.onMessage(MessageTypesEnum.Text, handleInteractiveMessage);

// ===================================
// 🌐 MAIN API ROUTE HANDLER
// ===================================
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log(`[Webhook] ${req.method} ${req.url}`);

    // Parse body for POST requests
    if (req.method === 'POST') {
        const chunks: Buffer[] = [];

        for await (const chunk of req) {
            chunks.push(chunk);
        }

        const body = Buffer.concat(chunks).toString();

        try {
            req.body = JSON.parse(body);
        } catch (error) {
            console.error('[Webhook] Failed to parse JSON:', error);
            return res.status(400).json({ error: 'Invalid JSON' });
        }
    }

    return await bot.webhook(req, res);
}
