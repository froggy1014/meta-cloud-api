import type { ProcessedFlows, WhatsApp } from 'meta-cloud-api';

/**
 * Example handler for flows webhook field
 * @see https://developers.facebook.com/docs/whatsapp/flows/guides/implementingyourflowendpoint#webhooks
 */
export async function handleFlowsWebhook(whatsapp: WhatsApp, processed: ProcessedFlows): Promise<void> {
    console.log('📊 Flows webhook received:');
    console.log('  WABA ID:', processed.wabaId);
    console.log('  Event:', processed.value.event);
    console.log('  Flow ID:', processed.value.flow_id);

    if (processed.value.event === 'FLOW_STATUS_CHANGE') {
        console.log('  Status:', processed.value.status);
        console.log('  Old Status:', processed.value.old_status);
    } else if (processed.value.event === 'FLOW_THROTTLED') {
        console.log('  Throttled!');
    }
}
