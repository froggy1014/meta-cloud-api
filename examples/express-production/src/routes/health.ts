import { checkDatabaseHealth } from '@config/database.js';
import { logger } from '@config/logger.js';
import { checkRedisHealth } from '@config/redis.js';
import { QueueManager } from '@services/queue/queueManager.js';
import { checkWhatsAppHealth } from '@services/whatsapp/client.js';
import type { HealthCheckResult } from '@types/index.js';
import { sendError, sendSuccess } from '@utils/responses.js';
import { type Request, type Response, Router } from 'express';

const router = Router();

/**
 * GET /health
 * Health check endpoint
 * Returns overall system health status
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const startTime = Date.now();

        // Run health checks in parallel
        const [databaseHealthy, redisHealthy, whatsappHealthy, queueHealthy] = await Promise.all([
            checkDatabaseHealth(),
            checkRedisHealth(),
            checkWhatsAppHealth(),
            QueueManager.healthCheck(),
        ]);

        const duration = Date.now() - startTime;

        const result: HealthCheckResult = {
            status:
                databaseHealthy && redisHealthy && whatsappHealthy && queueHealthy
                    ? 'healthy'
                    : redisHealthy && queueHealthy
                      ? 'degraded'
                      : 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            checks: {
                database: databaseHealthy,
                redis: redisHealthy,
                whatsapp: whatsappHealthy,
                queue: queueHealthy,
            },
        };

        logger.debug('Health check completed', {
            status: result.status,
            duration: `${duration}ms`,
        });

        // Return 200 for healthy/degraded, 503 for unhealthy
        const statusCode = result.status === 'unhealthy' ? 503 : 200;

        return sendSuccess(res, result, statusCode);
    } catch (error) {
        logger.error('Health check failed', {
            error: error instanceof Error ? error.message : String(error),
        });

        return sendError(res, 'Health check failed', 503);
    }
});

/**
 * GET /health/ready
 * Readiness probe endpoint
 * Checks if the service is ready to accept traffic
 */
router.get('/ready', async (req: Request, res: Response) => {
    try {
        // Check critical dependencies
        const [redisHealthy, queueHealthy] = await Promise.all([checkRedisHealth(), QueueManager.healthCheck()]);

        if (redisHealthy && queueHealthy) {
            return sendSuccess(
                res,
                {
                    ready: true,
                    message: 'Service is ready',
                },
                200,
            );
        } else {
            return sendError(res, 'Service not ready', 503, {
                redis: redisHealthy,
                queue: queueHealthy,
            });
        }
    } catch (error) {
        logger.error('Readiness check failed', {
            error: error instanceof Error ? error.message : String(error),
        });

        return sendError(res, 'Readiness check failed', 503);
    }
});

/**
 * GET /health/live
 * Liveness probe endpoint
 * Checks if the service is alive (minimal check)
 */
router.get('/live', (req: Request, res: Response) => {
    return sendSuccess(res, {
        alive: true,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

export default router;
