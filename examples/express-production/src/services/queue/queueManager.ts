import { Queue, QueueOptions, Job } from 'bullmq';
import { redis } from '@config/redis.js';
import { config } from '@config/index.js';
import { logger } from '@config/logger.js';

/**
 * Queue names enum
 */
export enum QueueName {
    NOTIFICATION = 'notification',
    TICKET = 'ticket',
}

/**
 * Job data types
 */
export interface NotificationJobData {
    type: 'ticket_created' | 'ticket_updated' | 'ticket_reminder';
    ticketId: string;
    ticketNumber: string;
    userId: string;
    metadata?: Record<string, any>;
}

export interface TicketJobData {
    type: 'process_ticket' | 'assign_ticket' | 'close_ticket';
    ticketId: string;
    metadata?: Record<string, any>;
}

/**
 * Queue manager class
 * Manages BullMQ queues for background job processing
 */
export class QueueManager {
    private static queues: Map<QueueName, Queue> = new Map();

    /**
     * Get queue options
     */
    private static getQueueOptions(): QueueOptions {
        return {
            connection: redis,
            prefix: config.QUEUE_PREFIX,
            defaultJobOptions: {
                attempts: config.QUEUE_ATTEMPTS,
                backoff: {
                    type: 'exponential',
                    delay: config.QUEUE_BACKOFF_DELAY,
                },
                removeOnComplete: {
                    count: 100, // Keep last 100 completed jobs
                    age: 86400, // Keep for 24 hours
                },
                removeOnFail: {
                    count: 500, // Keep last 500 failed jobs
                    age: 604800, // Keep for 7 days
                },
            },
        };
    }

    /**
     * Get or create a queue
     */
    static getQueue<T = any>(name: QueueName): Queue<T> {
        if (!this.queues.has(name)) {
            const queue = new Queue<T>(name, this.getQueueOptions());

            // Setup queue event listeners
            queue.on('error', (error) => {
                logger.error('Queue error', {
                    queue: name,
                    error: error.message,
                });
            });

            queue.on('waiting', (jobId) => {
                logger.debug('Job waiting', {
                    queue: name,
                    jobId,
                });
            });

            queue.on('active', (job) => {
                logger.debug('Job active', {
                    queue: name,
                    jobId: job.id,
                    jobName: job.name,
                });
            });

            queue.on('completed', (job) => {
                logger.info('Job completed', {
                    queue: name,
                    jobId: job.id,
                    jobName: job.name,
                    duration: job.processedOn ? Date.now() - job.processedOn : 0,
                });
            });

            queue.on('failed', (job, error) => {
                logger.error('Job failed', {
                    queue: name,
                    jobId: job?.id,
                    jobName: job?.name,
                    error: error.message,
                    attempts: job?.attemptsMade,
                });
            });

            queue.on('stalled', (jobId) => {
                logger.warn('Job stalled', {
                    queue: name,
                    jobId,
                });
            });

            this.queues.set(name, queue);

            logger.info('Queue initialized', { queue: name });
        }

        return this.queues.get(name)! as Queue<T>;
    }

    /**
     * Add a notification job
     */
    static async addNotificationJob(
        data: NotificationJobData,
        options?: { delay?: number },
    ): Promise<Job<NotificationJobData>> {
        const queue = this.getQueue<NotificationJobData>(QueueName.NOTIFICATION);

        const job = await queue.add(data.type, data, {
            ...(options?.delay && { delay: options.delay }),
        });

        logger.info('Notification job added', {
            jobId: job.id,
            type: data.type,
            ticketNumber: data.ticketNumber,
        });

        return job;
    }

    /**
     * Add a ticket processing job
     */
    static async addTicketJob(
        data: TicketJobData,
        options?: { delay?: number; priority?: number },
    ): Promise<Job<TicketJobData>> {
        const queue = this.getQueue<TicketJobData>(QueueName.TICKET);

        const job = await queue.add(data.type, data, {
            ...(options?.delay && { delay: options.delay }),
            ...(options?.priority && { priority: options.priority }),
        });

        logger.info('Ticket job added', {
            jobId: job.id,
            type: data.type,
            ticketId: data.ticketId,
        });

        return job;
    }

    /**
     * Get job by ID
     */
    static async getJob(queueName: QueueName, jobId: string): Promise<Job | undefined> {
        const queue = this.getQueue(queueName);
        return await queue.getJob(jobId);
    }

    /**
     * Remove job by ID
     */
    static async removeJob(queueName: QueueName, jobId: string): Promise<void> {
        const job = await this.getJob(queueName, jobId);
        if (job) {
            await job.remove();
            logger.info('Job removed', { queue: queueName, jobId });
        }
    }

    /**
     * Get queue statistics
     */
    static async getQueueStats(queueName: QueueName): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
    }> {
        const queue = this.getQueue(queueName);

        const [waiting, active, completed, failed, delayed] = await Promise.all([
            queue.getWaitingCount(),
            queue.getActiveCount(),
            queue.getCompletedCount(),
            queue.getFailedCount(),
            queue.getDelayedCount(),
        ]);

        return {
            waiting,
            active,
            completed,
            failed,
            delayed,
        };
    }

    /**
     * Pause queue
     */
    static async pauseQueue(queueName: QueueName): Promise<void> {
        const queue = this.getQueue(queueName);
        await queue.pause();
        logger.info('Queue paused', { queue: queueName });
    }

    /**
     * Resume queue
     */
    static async resumeQueue(queueName: QueueName): Promise<void> {
        const queue = this.getQueue(queueName);
        await queue.resume();
        logger.info('Queue resumed', { queue: queueName });
    }

    /**
     * Clean completed jobs
     */
    static async cleanQueue(queueName: QueueName, grace: number = 3600000): Promise<string[]> {
        const queue = this.getQueue(queueName);
        const jobs = await queue.clean(grace, 1000, 'completed');
        logger.info('Queue cleaned', {
            queue: queueName,
            removed: jobs.length,
        });
        return jobs;
    }

    /**
     * Close all queues
     */
    static async closeAll(): Promise<void> {
        const closePromises = Array.from(this.queues.entries()).map(async ([name, queue]) => {
            await queue.close();
            logger.info('Queue closed', { queue: name });
        });

        await Promise.all(closePromises);
        this.queues.clear();
    }

    /**
     * Health check for queues
     */
    static async healthCheck(): Promise<boolean> {
        try {
            for (const [name, queue] of this.queues.entries()) {
                await queue.getJobCounts();
            }
            return true;
        } catch (error) {
            logger.error('Queue health check failed', {
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }
}
