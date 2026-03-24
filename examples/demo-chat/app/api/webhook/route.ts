export const runtime = 'nodejs';

import { extractMessageText, nextjsAppWebhookHandler } from 'meta-cloud-api';
import { addMessage, addWebhookEvent, createOrUpdateSession, updateMessageStatus } from '@/lib/event-store';

const handler = nextjsAppWebhookHandler({
    accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
    phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
    businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
    webhookVerificationToken: process.env.WEBHOOK_VERIFICATION_TOKEN!,
});

// Helper: create session + store message from webhook
async function handleIncomingMessage(processed: any) {
    const msg = processed.message;
    const from = msg.from;
    const text = extractMessageText(msg);
    const session = await createOrUpdateSession(from, processed.profileName);

    await addMessage({
        waMessageId: processed.messageId,
        direction: 'received',
        fromNumber: from,
        type: msg.type,
        content: { text },
        sessionId: session?.id,
    });

    await addWebhookEvent({ eventType: 'message', waMessageId: processed.messageId, rawPayload: processed });
    console.log(`[webhook] ${msg.type} from ${from}: ${text}`);
}

// Register handlers for all message types
handler.processor.onText(async (_whatsapp, processed) => {
    await handleIncomingMessage(processed);
});

for (const type of [
    'image',
    'video',
    'audio',
    'document',
    'sticker',
    'location',
    'contacts',
    'interactive',
    'button',
    'reaction',
    'order',
    'system',
]) {
    handler.processor.onMessage(type, async (_whatsapp, processed) => {
        await handleIncomingMessage(processed);
    });
}

// Status updates
handler.processor.onStatus(async (_whatsapp, processed) => {
    const status = processed.status;
    await updateMessageStatus(status.id, status.status);
    await addWebhookEvent({
        eventType: 'status',
        waMessageId: status.id,
        status: status.status,
        rawPayload: processed,
    });
    console.log(`[webhook] Status: ${status.id} → ${status.status}`);
});

export const { GET, POST } = handler;
