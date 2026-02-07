import { Router } from 'express';
import webhookRoutes from './webhook.js';
import healthRoutes from './health.js';
import ticketRoutes from './api/tickets.js';
import { config } from '@config/index.js';

const router = Router();

/**
 * Root route
 */
router.get('/', (req, res) => {
    res.json({
        name: config.BUSINESS_NAME,
        version: '1.0.0',
        status: 'running',
        environment: config.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

/**
 * Mount routes
 */

// Webhook routes
router.use('/webhook', webhookRoutes);

// Health check routes
router.use('/health', healthRoutes);

// API routes (if enabled)
if (config.ENABLE_HEALTH_CHECKS) {
    router.use('/api/tickets', ticketRoutes);
}

export default router;
