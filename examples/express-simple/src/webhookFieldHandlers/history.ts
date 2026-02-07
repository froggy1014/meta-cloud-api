import { ProcessedHistory } from 'meta-cloud-api';
import { WhatsApp } from 'meta-cloud-api';

/**
 * Example handler for history webhook field
 * @see https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account#history
 */
export async function handleHistoryWebhook(whatsapp: WhatsApp, processed: ProcessedHistory): Promise<void> {
    console.log('📜 History sync webhook received:');
    console.log('  WABA ID:', processed.wabaId);
    console.log('  Phase:', processed.value.metadata?.phase);
    console.log('  Progress:', processed.value.metadata?.progress);

    if (processed.value.messages && processed.value.messages.length > 0) {
        console.log(`  Received ${processed.value.messages.length} historical messages`);
    }

    if (processed.value.message_echoes && processed.value.message_echoes.length > 0) {
        console.log(`  Received ${processed.value.message_echoes.length} message echoes`);
    }
}
