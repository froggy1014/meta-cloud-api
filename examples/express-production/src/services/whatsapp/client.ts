import { WhatsApp } from 'meta-cloud-api';
import { config } from '@config/index.js';
import { logger } from '@config/logger.js';

/**
 * WhatsApp client singleton
 * Manages the meta-cloud-api WhatsApp client instance
 */
class WhatsAppClient {
    private static instance: WhatsApp | null = null;

    /**
     * Get WhatsApp client instance
     * Creates a new instance if it doesn't exist
     */
    public static getInstance(): WhatsApp {
        if (!WhatsAppClient.instance) {
            WhatsAppClient.instance = new WhatsApp({
                accessToken: config.WHATSAPP_ACCESS_TOKEN,
                phoneNumberId: config.WHATSAPP_PHONE_NUMBER_ID,
                businessAcctId: config.WHATSAPP_BUSINESS_ACCOUNT_ID,
            });

            logger.info('WhatsApp client initialized', {
                phoneNumberId: config.WHATSAPP_PHONE_NUMBER_ID,
            });
        }

        return WhatsAppClient.instance;
    }

    /**
     * Health check for WhatsApp API
     * Tests the connection by fetching phone number info
     */
    public static async healthCheck(): Promise<boolean> {
        try {
            const client = WhatsAppClient.getInstance();
            await client.phone.get();
            return true;
        } catch (error) {
            logger.error('WhatsApp health check failed', {
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }
}

/**
 * Export singleton WhatsApp client instance
 */
export const whatsappClient = WhatsAppClient.getInstance();

/**
 * Export WhatsApp utilities
 */
export const checkWhatsAppHealth = WhatsAppClient.healthCheck.bind(WhatsAppClient);
