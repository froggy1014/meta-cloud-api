import { connectDatabase, disconnectDatabase } from '@config/database.js';
import { config, isProduction } from '@config/index.js';
import { logger } from '@config/logger.js';
import { disconnectRedis } from '@config/redis.js';
import { NotificationWorker } from '@services/queue/workers/notificationWorker.js';
import { TicketWorker } from '@services/queue/workers/ticketWorker.js';

/**
 * Worker process
 * Runs BullMQ workers for processing background jobs
 */

// Worker instances
let notificationWorker: NotificationWorker | null = null;
let ticketWorker: TicketWorker | null = null;

/**
 * Start workers
 */
async function startWorkers(): Promise<void> {
    try {
        logger.info('Starting workers...', {
            environment: config.NODE_ENV,
        });

        // Connect to database
        await connectDatabase();

        // Start notification worker
        notificationWorker = new NotificationWorker();
        notificationWorker.start();

        // Start ticket worker
        ticketWorker = new TicketWorker();
        ticketWorker.start();

        logger.info('All workers started successfully', {
            workers: ['notification', 'ticket'],
        });
    } catch (error) {
        logger.error('Failed to start workers', {
            error: error instanceof Error ? error.message : String(error),
        });
        process.exit(1);
    }
}

/**
 * Stop workers
 */
async function stopWorkers(): Promise<void> {
    try {
        logger.info('Stopping workers...');

        // Stop workers
        if (notificationWorker) {
            await notificationWorker.stop();
            notificationWorker = null;
        }

        if (ticketWorker) {
            await ticketWorker.stop();
            ticketWorker = null;
        }

        // Close database connection
        await disconnectDatabase();

        // Close Redis connection
        await disconnectRedis();

        logger.info('All workers stopped successfully');
    } catch (error) {
        logger.error('Error stopping workers', {
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

/**
 * Graceful shutdown
 */
async function gracefulShutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal}, starting graceful shutdown...`);

    await stopWorkers();

    logger.info('Graceful shutdown completed');
    process.exit(0);
}

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught exception in worker', {
        error: error.message,
        stack: error.stack,
    });

    // Exit in production, continue in development
    if (isProduction) {
        gracefulShutdown('UNCAUGHT_EXCEPTION');
    }
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled promise rejection in worker', {
        reason: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
    });

    // Exit in production, continue in development
    if (isProduction) {
        gracefulShutdown('UNHANDLED_REJECTION');
    }
});

/**
 * Handle shutdown signals
 */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Start workers
 */
startWorkers();
