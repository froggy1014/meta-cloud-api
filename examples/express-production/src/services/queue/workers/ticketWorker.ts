import { config } from '@config/index.js';
import { logger } from '@config/logger.js';
import { redis } from '@config/redis.js';
import { TicketStatus } from '@prisma/client';
import { TicketService } from '@services/tickets/ticketService.js';
import { type Job, Worker } from 'bullmq';
import { QueueManager, QueueName, type TicketJobData } from '../queueManager.js';

/**
 * Ticket worker
 * Processes ticket-related jobs
 */
export class TicketWorker {
    private worker: Worker<TicketJobData> | null = null;

    /**
     * Start the worker
     */
    start(): void {
        if (this.worker) {
            logger.warn('Ticket worker already running');
            return;
        }

        this.worker = new Worker<TicketJobData>(
            QueueName.TICKET,
            async (job: Job<TicketJobData>) => {
                return await this.processJob(job);
            },
            {
                connection: redis,
                prefix: config.QUEUE_PREFIX,
                concurrency: 10, // Process 10 jobs concurrently
            },
        );

        // Worker event handlers
        this.worker.on('ready', () => {
            logger.info('Ticket worker ready');
        });

        this.worker.on('error', (error) => {
            logger.error('Ticket worker error', {
                error: error.message,
            });
        });

        this.worker.on('failed', (job, error) => {
            logger.error('Ticket job failed', {
                jobId: job?.id,
                type: job?.data.type,
                error: error.message,
            });
        });

        logger.info('Ticket worker started');
    }

    /**
     * Process a ticket job
     */
    private async processJob(job: Job<TicketJobData>): Promise<void> {
        const { type, ticketId, metadata } = job.data;

        logger.info('Processing ticket job', {
            jobId: job.id,
            type,
            ticketId,
        });

        switch (type) {
            case 'process_ticket':
                await this.handleProcessTicket(ticketId, metadata);
                break;

            case 'assign_ticket':
                await this.handleAssignTicket(ticketId, metadata);
                break;

            case 'close_ticket':
                await this.handleCloseTicket(ticketId, metadata);
                break;

            default:
                logger.warn('Unknown ticket job type', { type });
        }
    }

    /**
     * Handle ticket processing
     * Performs initial ticket analysis and categorization
     */
    private async handleProcessTicket(ticketId: string, metadata?: Record<string, any>): Promise<void> {
        try {
            const ticket = await TicketService.getById(ticketId);

            if (!ticket) {
                logger.error('Ticket not found for processing', { ticketId });
                return;
            }

            logger.info('Processing ticket', {
                ticketNumber: ticket.ticketNumber,
                category: ticket.category,
            });

            // Auto-assign based on category (example logic)
            const assignmentMap: Record<string, string> = {
                TECHNICAL_SUPPORT: 'tech@example.com',
                BILLING_PAYMENT: 'billing@example.com',
                ACCOUNT_ACCESS: 'support@example.com',
            };

            const assignTo = assignmentMap[ticket.category];

            if (assignTo) {
                await TicketService.assign(ticketId, assignTo);
                logger.info('Ticket auto-assigned', {
                    ticketNumber: ticket.ticketNumber,
                    assignedTo: assignTo,
                });
            }

            // Add automatic tags based on issue content
            const issueLower = ticket.issue.toLowerCase();
            const tags: string[] = [];

            if (issueLower.includes('urgent') || issueLower.includes('asap')) {
                tags.push('urgent');
                await TicketService.updatePriority(ticketId, 'URGENT');
            }

            if (issueLower.includes('bug') || issueLower.includes('error')) {
                tags.push('bug');
            }

            if (issueLower.includes('payment') || issueLower.includes('billing')) {
                tags.push('payment');
            }

            if (tags.length > 0) {
                await TicketService.addTags(ticketId, tags);
            }

            // Schedule reminder notification if needed
            if (config.ENABLE_TICKET_REMINDERS) {
                await QueueManager.addNotificationJob(
                    {
                        type: 'ticket_reminder',
                        ticketId,
                        ticketNumber: ticket.ticketNumber,
                        userId: ticket.userId,
                    },
                    {
                        delay: config.TICKET_REMINDER_NOTIFICATION_DELAY,
                    },
                );
            }

            logger.info('Ticket processing completed', {
                ticketNumber: ticket.ticketNumber,
                tags,
            });
        } catch (error) {
            logger.error('Failed to process ticket', {
                ticketId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    /**
     * Handle ticket assignment
     * Assigns ticket to a support agent
     */
    private async handleAssignTicket(ticketId: string, metadata?: Record<string, any>): Promise<void> {
        try {
            const ticket = await TicketService.getById(ticketId);

            if (!ticket) {
                logger.error('Ticket not found for assignment', { ticketId });
                return;
            }

            const assignTo = metadata?.assignTo;

            if (!assignTo) {
                logger.error('No assignTo specified in metadata', { ticketId });
                return;
            }

            await TicketService.assign(ticketId, assignTo);

            // Send notification to user
            await QueueManager.addNotificationJob({
                type: 'ticket_updated',
                ticketId,
                ticketNumber: ticket.ticketNumber,
                userId: ticket.userId,
                metadata: {
                    message: `Your ticket has been assigned to our support team. We'll get back to you soon!`,
                },
            });

            logger.info('Ticket assigned', {
                ticketNumber: ticket.ticketNumber,
                assignedTo: assignTo,
            });
        } catch (error) {
            logger.error('Failed to assign ticket', {
                ticketId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    /**
     * Handle ticket closure
     * Closes a ticket and performs cleanup
     */
    private async handleCloseTicket(ticketId: string, metadata?: Record<string, any>): Promise<void> {
        try {
            const ticket = await TicketService.getById(ticketId);

            if (!ticket) {
                logger.error('Ticket not found for closure', { ticketId });
                return;
            }

            const resolution = metadata?.resolution || 'Ticket closed';

            await TicketService.updateStatus(ticketId, TicketStatus.CLOSED, resolution);

            // Send notification to user
            await QueueManager.addNotificationJob({
                type: 'ticket_updated',
                ticketId,
                ticketNumber: ticket.ticketNumber,
                userId: ticket.userId,
                metadata: {
                    message: `Your ticket has been closed.\n\n*Resolution:*\n${resolution}\n\nThank you for contacting us!`,
                },
            });

            logger.info('Ticket closed', {
                ticketNumber: ticket.ticketNumber,
            });
        } catch (error) {
            logger.error('Failed to close ticket', {
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
            logger.warn('Ticket worker not running');
            return;
        }

        await this.worker.close();
        this.worker = null;

        logger.info('Ticket worker stopped');
    }

    /**
     * Check if worker is running
     */
    isRunning(): boolean {
        return this.worker !== null && !this.worker.closing;
    }
}
