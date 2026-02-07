import { StatusCallback } from 'meta-cloud-api/webhook';
import { logger } from '@config/logger.js';

/**
 * Message status webhook handler
 * Tracks message delivery status (sent, delivered, read, failed)
 */
export async function handleStatusWebhook(status: StatusCallback): Promise<void> {
    try {
        logger.info('Message status update', {
            messageId: status.id,
            status: status.status,
            recipient: status.recipient_id,
            timestamp: status.timestamp,
        });

        // Handle different status types
        switch (status.status) {
            case 'sent':
                logger.debug('Message sent', { messageId: status.id });
                break;

            case 'delivered':
                logger.debug('Message delivered', { messageId: status.id });
                break;

            case 'read':
                logger.debug('Message read', { messageId: status.id });
                break;

            case 'failed':
                logger.error('Message failed', {
                    messageId: status.id,
                    error: status.errors?.[0],
                });
                break;

            default:
                logger.warn('Unknown status type', {
                    messageId: status.id,
                    status: status.status,
                });
        }
    } catch (error) {
        logger.error('Error handling status webhook', {
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
