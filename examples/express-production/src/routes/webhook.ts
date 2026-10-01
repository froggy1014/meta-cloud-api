import { config } from '@config/index.js';
import { logger } from '@config/logger.js';
// Import message handlers
import {
    handleAudioMessage,
    handleDocumentMessage,
    handleImageMessage,
    handleInteractiveMessage,
    handleTextMessage,
    handleVideoMessage,
} from '@handlers/messages/index.js';
// Import webhook field handlers
import { handleFlowsWebhook, handleStatusWebhook } from '@handlers/webhooks/index.js';
import { webhookRateLimiter } from '@middleware/rateLimiter.js';
import { Router } from 'express';
import { expressWebhookHandler } from 'meta-cloud-api';

/**
 * WhatsApp webhook configuration
 */
const whatsappConfig = {
    accessToken: config.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: Number(config.WHATSAPP_PHONE_NUMBER_ID),
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

// SDK handlers receive (whatsappClient, processed). Our handlers only need
// the message itself, so unwrap it here.

// Text message handler
Whatsapp.processor.onText((_wa, { message }) => handleTextMessage(message));

// Interactive message handler (buttons, lists)
Whatsapp.processor.onInteractive((_wa, { message }) => handleInteractiveMessage(message));

// Media message handlers
Whatsapp.processor.onImage((_wa, { message }) => handleImageMessage(message));
Whatsapp.processor.onDocument((_wa, { message }) => handleDocumentMessage(message));
Whatsapp.processor.onVideo((_wa, { message }) => handleVideoMessage(message));
Whatsapp.processor.onAudio((_wa, { message }) => handleAudioMessage(message));

// ===================================
// REGISTER WEBHOOK FIELD HANDLERS
// ===================================

// Status updates (sent, delivered, read, failed)
Whatsapp.processor.onStatus((_wa, { status }) => handleStatusWebhook(status));

// Flows webhook handler
Whatsapp.processor.onFlows((_wa, { value }) => handleFlowsWebhook(value));

/**
 * Log every incoming webhook for debugging. Handler errors are caught and
 * logged by the SDK, and Meta still gets a 200 so it does not retry.
 */
Whatsapp.processor.onRaw((_wa, payload) => {
    logger.debug('Webhook received', {
        entry: payload.entry.length,
        changes: payload.entry[0]?.changes.length,
    });
});

// ===================================
// WEBHOOK ROUTES
// ===================================

const router: Router = Router();

// Apply rate limiting to webhook routes
router.use(webhookRateLimiter);

// GET /webhook - Webhook verification
router.get('/', Whatsapp.GET);

// POST /webhook - Webhook events
router.post('/', Whatsapp.POST);

export default router;
