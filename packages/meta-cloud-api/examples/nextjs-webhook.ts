import { NextApiRequest, NextApiResponse } from 'next';
import { WabaConfigType } from '../src/types/config';
import WebhookHandler, { nextJsAdapter } from '../src/webhook';

/**
 * Example showing how to use the WebhookHandler with Next.js API routes
 *
 * This would typically be placed in your Next.js project under:
 * pages/api/whatsapp-webhook.ts
 */

// Initialize your WhatsApp configuration
const wabaConfig: WabaConfigType = {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    businessId: process.env.WHATSAPP_BUSINESS_ID || '',
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v16.0',
};

// Create webhook handler
const webhookHandler = new WebhookHandler(
    wabaConfig,
    process.env.WEBHOOK_CALLBACK_URL || '',
    process.env.WEBHOOK_VERIFY_TOKEN || '',
);

// Register message handlers
webhookHandler.onMessage('text', async (message) => {
    console.log(`Received text message: ${message.text?.body}`);
    // Handle the message...
});

// Register event handlers
webhookHandler.onEvent('statuses', async (event) => {
    console.log(`Received status update:`, event.value);
    // Handle the event...
});

/**
 * Next.js API route handler
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Convert Next.js request/response to our generic interface
    const request = nextJsAdapter.createRequest(req);
    const response = nextJsAdapter.createResponse(res);

    // Process the webhook request
    await webhookHandler.handleRequest(request, response);
}

// Configure API route to handle all HTTP methods
export const config = {
    api: {
        bodyParser: true,
    },
};
