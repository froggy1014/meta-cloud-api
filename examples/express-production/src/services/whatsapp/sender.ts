import { logger } from '@config/logger.js';
import { whatsappClient } from './client.js';

/**
 * Retry configuration for message sending
 */
interface RetryConfig {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    backoffMultiplier: 2,
};

/**
 * Sleep helper for retry delays
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Message sender service with retry logic
 * Handles sending WhatsApp messages with automatic retries on failure
 */
export class MessageSender {
    /**
     * Send a text message with retry logic
     */
    static async sendText(
        to: string,
        text: string,
        retryConfig: Partial<RetryConfig> = {},
    ): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
            try {
                const response = await whatsappClient.messages.text({
                    to,
                    body: text,
                });

                logger.info('Text message sent successfully', {
                    to,
                    messageId: response.messages?.[0]?.id,
                    attempt: attempt + 1,
                });

                return {
                    success: true,
                    messageId: response.messages?.[0]?.id,
                };
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                logger.warn('Failed to send text message', {
                    to,
                    attempt: attempt + 1,
                    maxRetries: config.maxRetries,
                    error: lastError.message,
                });

                // Don't retry if it's the last attempt
                if (attempt < config.maxRetries) {
                    const delay = config.retryDelay * config.backoffMultiplier ** attempt;
                    await sleep(delay);
                }
            }
        }

        logger.error('Failed to send text message after all retries', {
            to,
            error: lastError?.message,
        });

        return {
            success: false,
            error: lastError?.message || 'Unknown error',
        };
    }

    /**
     * Send an interactive button message
     */
    static async sendButtons(
        to: string,
        bodyText: string,
        buttons: Array<{ id: string; title: string }>,
        headerText?: string,
        footerText?: string,
        retryConfig: Partial<RetryConfig> = {},
    ): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
            try {
                const response = await whatsappClient.messages.replyButtons({
                    to,
                    body: {
                        text: bodyText,
                    },
                    action: {
                        buttons: buttons.map((btn) => ({
                            type: 'reply',
                            reply: {
                                id: btn.id,
                                title: btn.title,
                            },
                        })),
                    },
                    ...(headerText && {
                        header: {
                            type: 'text',
                            text: headerText,
                        },
                    }),
                    ...(footerText && {
                        footer: {
                            text: footerText,
                        },
                    }),
                });

                logger.info('Button message sent successfully', {
                    to,
                    messageId: response.messages?.[0]?.id,
                    buttonCount: buttons.length,
                    attempt: attempt + 1,
                });

                return {
                    success: true,
                    messageId: response.messages?.[0]?.id,
                };
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                logger.warn('Failed to send button message', {
                    to,
                    attempt: attempt + 1,
                    maxRetries: config.maxRetries,
                    error: lastError.message,
                });

                if (attempt < config.maxRetries) {
                    const delay = config.retryDelay * config.backoffMultiplier ** attempt;
                    await sleep(delay);
                }
            }
        }

        logger.error('Failed to send button message after all retries', {
            to,
            error: lastError?.message,
        });

        return {
            success: false,
            error: lastError?.message || 'Unknown error',
        };
    }

    /**
     * Send an interactive list message
     */
    static async sendList(
        to: string,
        bodyText: string,
        buttonText: string,
        sections: Array<{
            title?: string;
            rows: Array<{ id: string; title: string; description?: string }>;
        }>,
        headerText?: string,
        footerText?: string,
        retryConfig: Partial<RetryConfig> = {},
    ): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
            try {
                const response = await whatsappClient.messages.list({
                    to,
                    body: {
                        text: bodyText,
                    },
                    action: {
                        button: buttonText,
                        sections: sections.map((section) => ({
                            ...(section.title && { title: section.title }),
                            rows: section.rows,
                        })),
                    },
                    ...(headerText && {
                        header: {
                            type: 'text',
                            text: headerText,
                        },
                    }),
                    ...(footerText && {
                        footer: {
                            text: footerText,
                        },
                    }),
                });

                logger.info('List message sent successfully', {
                    to,
                    messageId: response.messages?.[0]?.id,
                    sectionCount: sections.length,
                    attempt: attempt + 1,
                });

                return {
                    success: true,
                    messageId: response.messages?.[0]?.id,
                };
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                logger.warn('Failed to send list message', {
                    to,
                    attempt: attempt + 1,
                    maxRetries: config.maxRetries,
                    error: lastError.message,
                });

                if (attempt < config.maxRetries) {
                    const delay = config.retryDelay * config.backoffMultiplier ** attempt;
                    await sleep(delay);
                }
            }
        }

        logger.error('Failed to send list message after all retries', {
            to,
            error: lastError?.message,
        });

        return {
            success: false,
            error: lastError?.message || 'Unknown error',
        };
    }

    /**
     * Send a template message
     */
    static async sendTemplate(
        to: string,
        templateName: string,
        languageCode: string = 'en_US',
        components?: any[],
        retryConfig: Partial<RetryConfig> = {},
    ): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
            try {
                const response = await whatsappClient.messages.template({
                    to,
                    name: templateName,
                    language: {
                        code: languageCode,
                    },
                    ...(components && { components }),
                });

                logger.info('Template message sent successfully', {
                    to,
                    messageId: response.messages?.[0]?.id,
                    template: templateName,
                    attempt: attempt + 1,
                });

                return {
                    success: true,
                    messageId: response.messages?.[0]?.id,
                };
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                logger.warn('Failed to send template message', {
                    to,
                    template: templateName,
                    attempt: attempt + 1,
                    maxRetries: config.maxRetries,
                    error: lastError.message,
                });

                if (attempt < config.maxRetries) {
                    const delay = config.retryDelay * config.backoffMultiplier ** attempt;
                    await sleep(delay);
                }
            }
        }

        logger.error('Failed to send template message after all retries', {
            to,
            template: templateName,
            error: lastError?.message,
        });

        return {
            success: false,
            error: lastError?.message || 'Unknown error',
        };
    }
}
