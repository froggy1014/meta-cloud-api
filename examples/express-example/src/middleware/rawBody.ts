import { NextFunction, Request, Response } from 'express';

declare global {
    namespace Express {
        interface Request {
            rawBody?: string;
        }
    }
}

// Constants for configuration values
const MIDDLEWARE_CONFIG = {
    TIMEOUT_MS: 10000, // 10 second timeout
    CONTENT_TYPE: 'application/json',
    ENCODING: 'utf8',
} as const;

/**
 * Advanced raw body middleware for WhatsApp Flows webhook processing
 *
 * Handles concurrent access to both raw body (for signature verification) and parsed JSON
 * without causing Express stream conflicts. Essential for WhatsApp Flows webhook endpoints that
 * must simultaneously:
 *
 * Security Requirements:
 * - Verify X-Hub-Signature-256 header using raw body content
 * - Authenticate Flow completion messages containing sensitive user data
 * - Validate endpoint availability checks (90% uptime threshold monitoring)
 *
 * Performance Monitoring:
 * - Process client error rate webhooks (5%, 10%, 50% thresholds)
 * - Handle endpoint latency alerts (1s, 5s, 7s p90 thresholds)
 * - Manage endpoint error rate notifications (30-minute detection windows)
 *
 * Flow Management:
 * - Parse Flow status change notifications (DRAFT→PUBLISHED transitions)
 * - Process Flow version freeze/expiry warnings
 * - Handle Flow response messages with encrypted flow_token data
 *
 * Implements timeout protection, proper cleanup, and graceful error handling
 * required for production WhatsApp Business Platform integration.
 *
 * @see https://developers.facebook.com/docs/whatsapp/flows/reference/flowswebhooks
 * @see https://developers.facebook.com/docs/whatsapp/sample-app-endpoints
 */
export const rawBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Skip if body has already been parsed
    if (req.body !== undefined || req.rawBody !== undefined) {
        return next();
    }

    // Only process POST requests with JSON content
    const isValidRequest =
        req.method === 'POST' && req.headers['content-type']?.includes(MIDDLEWARE_CONFIG.CONTENT_TYPE);

    if (!isValidRequest) {
        return next();
    }

    const chunks: Buffer[] = [];
    let hasFinished = false;

    const cleanup = () => {
        req.removeAllListeners('data');
        req.removeAllListeners('end');
        req.removeAllListeners('error');
        req.removeAllListeners('close');
    };

    const finish = (error?: Error) => {
        if (hasFinished) return;
        hasFinished = true;

        clearTimeout(timeoutId);
        cleanup();

        if (error) {
            return next(error);
        }

        try {
            const rawBody = Buffer.concat(chunks).toString(MIDDLEWARE_CONFIG.ENCODING);
            req.rawBody = rawBody;

            // Only parse JSON if rawBody is not empty
            if (rawBody.trim()) {
                req.body = JSON.parse(rawBody);
            } else {
                req.body = {};
            }

            next();
        } catch (parseError) {
            console.error('Error parsing JSON from raw body:', parseError);
            next(new Error('Invalid JSON in request body'));
        }
    };

    req.on('data', (chunk: Buffer) => {
        if (!hasFinished) {
            chunks.push(chunk);
        }
    });

    req.on('end', () => {
        finish();
    });

    req.on('error', (error) => {
        console.error('Error reading request body:', error);
        finish(error);
    });

    req.on('close', () => {
        if (!hasFinished) {
            finish(new Error('Request closed before completion'));
        }
    });

    // Add timeout protection with named constant
    const timeoutId = setTimeout(() => {
        if (!hasFinished) {
            finish(new Error('Request body read timeout'));
        }
    }, MIDDLEWARE_CONFIG.TIMEOUT_MS);
};

export default rawBodyMiddleware;
