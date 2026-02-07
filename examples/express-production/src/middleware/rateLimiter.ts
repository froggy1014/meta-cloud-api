import rateLimit from 'express-rate-limit';
import { config } from '@config/index.js';
import { logger } from '@config/logger.js';

/**
 * Rate limiter middleware configuration
 * Prevents abuse by limiting requests per IP address
 */
export const rateLimiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
    message: {
        success: false,
        error: {
            message: 'Too many requests, please try again later',
        },
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            method: req.method,
        });

        res.status(429).json({
            success: false,
            error: {
                message: 'Too many requests, please try again later',
            },
        });
    },
    skip: (req) => {
        // Skip rate limiting for health check endpoints
        return req.path === '/health' || req.path === '/ready';
    },
});

/**
 * Strict rate limiter for webhook endpoints
 * Higher limits since webhooks are time-sensitive
 */
export const webhookRateLimiter = rateLimit({
    windowMs: 60000, // 1 minute
    max: 200, // 200 requests per minute
    message: {
        success: false,
        error: {
            message: 'Webhook rate limit exceeded',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn('Webhook rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            method: req.method,
        });

        res.status(429).json({
            success: false,
            error: {
                message: 'Webhook rate limit exceeded',
            },
        });
    },
});

/**
 * API rate limiter for REST endpoints
 * More restrictive for API calls
 */
export const apiRateLimiter = rateLimit({
    windowMs: 60000, // 1 minute
    max: 30, // 30 requests per minute
    message: {
        success: false,
        error: {
            message: 'API rate limit exceeded',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn('API rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            method: req.method,
        });

        res.status(429).json({
            success: false,
            error: {
                message: 'API rate limit exceeded',
            },
        });
    },
});
