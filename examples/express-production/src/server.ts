import { Server } from 'http';
import { createApp } from './app.js';
import { config, isProduction } from '@config/index.js';
import { logger } from '@config/logger.js';
import { connectDatabase, disconnectDatabase } from '@config/database.js';
import { disconnectRedis } from '@config/redis.js';
import { QueueManager } from '@services/queue/queueManager.js';
import { SessionStore } from '@services/conversation/sessionStore.js';

/**
 * HTTP Server instance
 */
let server: Server | null = null;

/**
 * Start the server
 */
async function startServer(): Promise<void> {
    try {
        // Connect to database
        await connectDatabase();

        // Create Express app
        const app = createApp();

        // Start HTTP server
        server = app.listen(config.PORT, () => {
            logger.info('Server started', {
                port: config.PORT,
                environment: config.NODE_ENV,
                nodeVersion: process.version,
            });

            logger.info('Endpoints:', {
                webhook: `http://localhost:${config.PORT}/webhook`,
                health: `http://localhost:${config.PORT}/health`,
                api: `http://localhost:${config.PORT}/api`,
            });
        });

        // Setup session cleanup interval
        if (config.SESSION_CLEANUP_INTERVAL > 0) {
            setInterval(async () => {
                try {
                    await SessionStore.cleanup();
                } catch (error) {
                    logger.error('Session cleanup error', {
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
            }, config.SESSION_CLEANUP_INTERVAL);
        }
    } catch (error) {
        logger.error('Failed to start server', {
            error: error instanceof Error ? error.message : String(error),
        });
        process.exit(1);
    }
}

/**
 * Graceful shutdown
 */
async function gracefulShutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal}, starting graceful shutdown...`);

    try {
        // Stop accepting new connections
        if (server) {
            await new Promise<void>((resolve, reject) => {
                server!.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        logger.info('HTTP server closed');
                        resolve();
                    }
                });
            });
        }

        // Close database connection
        await disconnectDatabase();

        // Close Redis connection
        await disconnectRedis();

        // Close queues
        await QueueManager.closeAll();

        logger.info('Graceful shutdown completed');
        process.exit(0);
    } catch (error) {
        logger.error('Error during graceful shutdown', {
            error: error instanceof Error ? error.message : String(error),
        });
        process.exit(1);
    }
}

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught exception', {
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
    logger.error('Unhandled promise rejection', {
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
 * Start the server
 */
startServer();
