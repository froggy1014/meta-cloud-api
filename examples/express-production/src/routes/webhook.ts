import { Router } from 'express';
import { expressWebhookHandler } from 'meta-cloud-api';
import { config } from '@config/index.js';
import { webhookRateLimiter } from '@middleware/rateLimiter.js';
import { logger } from '@config/logger.js';

// Import message handlers
import {
    handleTextMessage,
    handleInteractiveMessage,
    handleImageMessage,
    handleDocumentMessage,
    handleVideoMessage,
    handleAudioMessage,
} from '@handlers/messages/index.js';

// Import webhook field handlers
import { handleStatusWebhook, handleFlowsWebhook } from '@handlers/webhooks/index.js';

/**
 * WhatsApp webhook configuration
 */
const whatsappConfig = {
    accessToken: config.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: config.WHATSAPP_PHONE_NUMBER_ID,
    businessAcctId: config.WHATSAPP_BUSINESS_ACCOUNT_ID,
    webhookVerificationToken: config.WHATSAPP_WEBHOOK_VERIFICATION_TOKEN,
};

/**
 * Initialize webhook handler
 */
const Whatsapp = expressWebhookHandler(whatsappConfig);

// ===================================
// REGISTER MESSAGE HANDLERS
// ===================================

// Text message handler
Whatsapp.processor.onText(handleTextMessage);

// Interactive message handler (buttons, lists)
Whatsapp.processor.onInteractive(handleInteractiveMessage);

// Media message handlers
Whatsapp.processor.onImage(handleImageMessage);
Whatsapp.processor.onDocument(handleDocumentMessage);
Whatsapp.processor.onVideo(handleVideoMessage);
Whatsapp.processor.onAudio(handleAudioMessage);

// ===================================
// REGISTER WEBHOOK FIELD HANDLERS
// ===================================

// Status updates (sent, delivered, read, failed)
Whatsapp.processor.onStatus(handleStatusWebhook);

// Flows webhook handler
Whatsapp.processor.onFlows(handleFlowsWebhook);

/**
 * Log all incoming webhooks for debugging
 */
Whatsapp.processor.on('webhook', (webhook) => {
    logger.debug('Webhook received', {
        entry: webhook.entry.length,
        changes: webhook.entry[0]?.changes.length,
    });
});

/**
 * Log processing errors
 */
Whatsapp.processor.on('error', (error) => {
    logger.error('Webhook processing error', {
        error: error.message,
        stack: error.stack,
    });
});

// ===================================
// WEBHOOK ROUTES
// ===================================

const router = Router();

// Apply rate limiting to webhook routes
router.use(webhookRateLimiter);

// GET /webhook - Webhook verification
router.get('/', Whatsapp.GET);

// POST /webhook - Webhook events
router.post('/', Whatsapp.POST);

export default router;
