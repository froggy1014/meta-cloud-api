import {
    nextjsAppWebhookHandler,
    type ProcessedMessage,
    type ProcessedStatus,
    type TextProcessedMessage,
} from 'meta-cloud-api';
import { onCustomerNonText, onCustomerText } from './bot';
import { addMessage, updateStatus } from './store';
import { config } from './whatsapp';

/**
 * One SDK webhook handler shared by the real webhook route and the mock
 * simulator. The SDK caches it per phone number ID, so hot reload is safe.
 */
export const webhook = nextjsAppWebhookHandler(config);

webhook.processor.onText(async (_wa: unknown, processed: TextProcessedMessage) => {
    const { message, profileName, messageId } = processed;
    addMessage(
        { id: messageId, contact: message.from, direction: 'in', text: message.text.body, at: Date.now() },
        profileName,
    );
    try {
        await onCustomerText(message.from, profileName || message.from, message.text.body);
    } catch (err) {
        // Never fail the webhook: Meta retries non-2xx responses for days.
        console.error('[bot]', err instanceof Error ? err.message : err);
    }
});

// Photos, voice notes, stickers, ... get a polite "text only" reply.
// Reactions, edits and system messages are ignored on purpose.
const NON_TEXT_TYPES = [
    'image',
    'video',
    'audio',
    'document',
    'sticker',
    'location',
    'contacts',
    'interactive',
    'button',
];
for (const type of NON_TEXT_TYPES) {
    webhook.processor.onMessage(type, async (_wa: unknown, processed: ProcessedMessage) => {
        const { message, profileName, messageId } = processed;
        addMessage(
            { id: messageId, contact: message.from, direction: 'in', text: `[${type}]`, at: Date.now() },
            profileName,
        );
        try {
            await onCustomerNonText(message.from, type);
        } catch (err) {
            console.error('[bot]', err instanceof Error ? err.message : err);
        }
    });
}

webhook.processor.onStatus((_wa: unknown, processed: ProcessedStatus) => {
    const { status } = processed;
    const s = status.status as 'sent' | 'delivered' | 'read' | 'failed';
    updateStatus(status.id, s, s === 'failed' ? JSON.stringify(status.errors ?? '') : undefined);
});
