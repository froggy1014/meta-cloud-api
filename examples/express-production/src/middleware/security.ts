import helmet from 'helmet';
import cors from 'cors';
import { config } from '@config/index.js';

/**
 * Helmet security middleware configuration
 * Adds various HTTP headers for security
 */
export const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    },
    frameguard: {
        action: 'deny',
    },
    noSniff: true,
    xssFilter: true,
});

/**
 * CORS middleware configuration
 * Allows cross-origin requests from specified origins
 */
export const corsConfig = cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }

        // Parse allowed origins from config
        const allowedOrigins = config.CORS_ORIGIN.split(',').map((o) => o.trim());

        // Allow all origins in development
        if (allowedOrigins.includes('*')) {
            return callback(null, true);
        }

        // Check if origin is allowed
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Page-Size'],
    maxAge: 86400, // 24 hours
});

/**
 * Security middleware stack
 * Applies all security middlewares
 */
export const securityMiddleware = [
    // Apply Helmet if enabled
    ...(config.HELMET_ENABLED ? [helmetConfig] : []),
    // Apply CORS
    corsConfig,
];
