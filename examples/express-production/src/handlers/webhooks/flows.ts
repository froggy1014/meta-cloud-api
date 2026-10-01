import { logger } from '@config/logger.js';

/**
 * Fields of the `flows` webhook value this handler reads.
 * (meta-cloud-api does not export the full FlowsValue type from its root yet.)
 */
interface FlowsValue {
    event: string;
    flow_id: string;
    message?: string;
}

/**
 * Flows webhook handler
 * Handles WhatsApp Flows events
 */
export async function handleFlowsWebhook(flows: FlowsValue): Promise<void> {
    try {
        logger.info('Flows webhook received', {
            event: flows.event,
            flowId: flows.flow_id,
            message: flows.message,
        });

        // Process flow data based on your flow configuration
        // This is a placeholder implementation

        logger.debug('Flows data processed');
    } catch (error) {
        logger.error('Error handling flows webhook', {
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
