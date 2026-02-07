import { Request, Response, NextFunction } from 'express';
import { logger } from '@config/logger.js';

/**
 * HTTP request logging middleware
 * Logs all incoming requests with method, path, status, and duration
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    // Log request
    logger.http('Incoming request', {
        method: req.method,
        path: req.path,
        query: req.query,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });

    // Capture the original end function
    const originalEnd = res.end;

    // Override res.end to log response
    res.end = function (chunk?: any, encoding?: any, callback?: any): Response {
        // Calculate request duration
        const duration = Date.now() - startTime;

        // Log response
        logger.http('Request completed', {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
        });

        // Call original end function
        if (typeof chunk === 'function') {
            return originalEnd.call(this, chunk);
        } else if (typeof encoding === 'function') {
            return originalEnd.call(this, chunk, encoding);
        } else {
            return originalEnd.call(this, chunk, encoding, callback);
        }
    };

    next();
}

/**
 * Middleware to skip logging for health check endpoints
 */
export function skipHealthCheckLogs(req: Request, res: Response, next: NextFunction): void {
    if (req.path === '/health' || req.path === '/ready') {
        return next();
    }

    requestLogger(req, res, next);
}
