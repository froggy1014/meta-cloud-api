import { config } from '@config/index.js';
import { logger } from '@config/logger.js';
import { redis } from '@config/redis.js';
import { TicketService } from '@services/tickets/ticketService.js';
import { MessageSender } from '@services/whatsapp/sender.js';
import { type Job, Worker } from 'bullmq';
import { type NotificationJobData, QueueName } from '../queueManager.js';

/**
 * Notification worker
 * Processes notification jobs for sending WhatsApp messages
 */
export class NotificationWorker {
    private worker: Worker<NotificationJobData> | null = null;

    /**
     * Start the worker
     */
    start(): void {
        if (this.worker) {
            logger.warn('Notification worker already running');
            return;
        }

        this.worker = new Worker<NotificationJobData>(
            QueueName.NOTIFICATION,
            async (job: Job<NotificationJobData>) => {
                return await this.processJob(job);
            },
            {
                connection: redis,
                prefix: config.QUEUE_PREFIX,
                concurrency: 5, // Process 5 jobs concurrently
            },
        );

        // Worker event handlers
        this.worker.on('ready', () => {
            logger.info('Notification worker ready');
        });

        this.worker.on('error', (error) => {
            logger.error('Notification worker error', {
                error: error.message,
            });
        });

        this.worker.on('failed', (job, error) => {
            logger.error('Notification job failed', {
                jobId: job?.id,
                type: job?.data.type,
                error: error.message,
            });
        });

        logger.info('Notification worker started');
    }

    /**
     * Process a notification job
     */
    private async processJob(job: Job<NotificationJobData>): Promise<void> {
        const { type, ticketId, ticketNumber, userId, metadata } = job.data;

        logger.info('Processing notification job', {
            jobId: job.id,
            type,
            ticketNumber,
        });

        switch (type) {
            case 'ticket_created':
                await this.handleTicketCreated(ticketId, ticketNumber, userId);
                break;

            case 'ticket_updated':
                await this.handleTicketUpdated(ticketId, ticketNumber, userId, metadata);
                break;

            case 'ticket_reminder':
                await this.handleTicketReminder(ticketId, ticketNumber, userId);
                break;

            default:
                logger.warn('Unknown notification type', { type });
        }
    }

    /**
     * Handle ticket created notification
     * Sends notification to support team
     */
    private async handleTicketCreated(ticketId: string, ticketNumber: string, userId: string): Promise<void> {
        try {
            const ticket = await TicketService.getById(ticketId);

            if (!ticket) {
                logger.error('Ticket not found for notification', { ticketId });
                return;
            }

            // Send to support team if configured
            if (config.SUPPORT_TEAM_PHONE) {
                const message =
                    '🎫 *New Ticket Created*\n\n' +
                    `*Ticket:* ${ticketNumber}\n` +
                    `*User:* ${ticket.userName} (${userId})\n` +
                    `*Category:* ${ticket.category}\n` +
                    `*Priority:* ${ticket.priority}\n\n` +
                    `*Issue:*\n${ticket.issue}`;

                await MessageSender.sendText(config.SUPPORT_TEAM_PHONE, message);

                logger.info('Ticket created notification sent', {
                    ticketNumber,
                    supportTeam: config.SUPPORT_TEAM_PHONE,
                });
            }
        } catch (error) {
            logger.error('Failed to send ticket created notification', {
                ticketId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    /**
     * Handle ticket updated notification
     * Sends notification to user about ticket status update
     */
    private async handleTicketUpdated(
        ticketId: string,
        ticketNumber: string,
        userId: string,
        metadata?: Record<string, any>,
    ): Promise<void> {
        try {
            const ticket = await TicketService.getById(ticketId);

            if (!ticket) {
                logger.error('Ticket not found for notification', { ticketId });
                return;
            }

            const statusEmoji: Record<string, string> = {
                OPEN: '📝',
                IN_PROGRESS: '🔄',
                PENDING_USER: '⏳',
                PENDING_INTERNAL: '⏱️',
                RESOLVED: '✅',
                CLOSED: '🔒',
                CANCELLED: '❌',
            };

            const message =
                `${statusEmoji[ticket.status]} *Ticket Update*\n\n` +
                `*Ticket:* ${ticketNumber}\n` +
                `*Status:* ${ticket.status}\n\n` +
                `${metadata?.message || 'Your ticket has been updated.'}`;

            await MessageSender.sendText(userId, message);

            logger.info('Ticket updated notification sent', {
                ticketNumber,
                userId,
                status: ticket.status,
            });
        } catch (error) {
            logger.error('Failed to send ticket updated notification', {
                ticketId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    /**
     * Handle ticket reminder notification
     * Sends reminder to user about pending ticket
     */
    private async handleTicketReminder(ticketId: string, ticketNumber: string, userId: string): Promise<void> {
        try {
            const ticket = await TicketService.getById(ticketId);

            if (!ticket) {
                logger.error('Ticket not found for notification', { ticketId });
                return;
            }

            // Only send reminder for pending tickets
            if (ticket.status !== 'PENDING_USER') {
                logger.debug('Ticket not in pending state, skipping reminder', {
                    ticketNumber,
                    status: ticket.status,
                });
                return;
            }

            const message =
                '⏰ *Ticket Reminder*\n\n' +
                `*Ticket:* ${ticketNumber}\n` +
                `*Category:* ${ticket.category}\n\n` +
                `We're still waiting for your response. Please reply to help us resolve your issue.\n\n` +
                `If you no longer need assistance, you can close this ticket by replying "close".`;

            await MessageSender.sendText(userId, message);

            logger.info('Ticket reminder sent', {
                ticketNumber,
                userId,
            });
        } catch (error) {
            logger.error('Failed to send ticket reminder', {
                ticketId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    /**
     * Stop the worker
     */
    async stop(): Promise<void> {
        if (!this.worker) {
            logger.warn('Notification worker not running');
            return;
        }

        await this.worker.close();
        this.worker = null;

        logger.info('Notification worker stopped');
    }

    /**
     * Check if worker is running
     */
    isRunning(): boolean {
        return this.worker !== null && !this.worker.closing;
    }
}
