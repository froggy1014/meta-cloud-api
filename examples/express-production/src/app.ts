import express, { Application } from 'express';
import { securityMiddleware } from '@middleware/security.js';
import { skipHealthCheckLogs } from '@middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from '@middleware/errorHandler.js';
import { rateLimiter } from '@middleware/rateLimiter.js';
import routes from '@routes/index.js';
import { logger } from '@config/logger.js';
import { config } from '@config/index.js';

/**
 * Create Express application
 * Factory function to create and configure the Express app
 */
export function createApp(): Application {
    const app = express();

    // ===================================
    // SECURITY MIDDLEWARE
    // ===================================
    app.use(securityMiddleware);

    // ===================================
    // BODY PARSING
    // ===================================
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // ===================================
    // LOGGING
    // ===================================
    app.use(skipHealthCheckLogs);

    // ===================================
    // RATE LIMITING
    // ===================================
    app.use(rateLimiter);

    // ===================================
    // ROUTES
    // ===================================
    app.use('/', routes);

    // ===================================
    // ERROR HANDLING
    // ===================================
    app.use(notFoundHandler);
    app.use(errorHandler);

    logger.info('Express app configured', {
        environment: config.NODE_ENV,
        cors: config.CORS_ORIGIN,
        helmet: config.HELMET_ENABLED,
    });

    return app;
}
