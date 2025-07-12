import { MessageTypesEnum } from 'meta-cloud-api';
import type { NextApiRequest as WebhookRequest, NextApiResponse as WebhookResponse } from 'meta-cloud-api/webhook';
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

// 🤖 Create Echo Bot
const bot = NextJsWebhook(whatsappConfig);

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

// Main API route handler
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

    return await bot.webhook(req as unknown as WebhookRequest, res as unknown as WebhookResponse);
}
