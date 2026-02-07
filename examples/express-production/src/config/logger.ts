import winston from 'winston';
import { config } from './index.js';

/**
 * Custom log format for development
 * Provides human-readable colorized output
 */
const simpleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
    }),
);

/**
 * JSON format for production
 * Structured logging for log aggregation systems
 */
const jsonFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
);

/**
 * Winston logger instance
 * Configured based on environment variables
 */
export const logger = winston.createLogger({
    level: config.LOG_LEVEL,
    format: config.LOG_FORMAT === 'json' ? jsonFormat : simpleFormat,
    defaultMeta: {
        service: 'whatsapp-support-bot',
        environment: config.NODE_ENV,
    },
    transports: [
        // Console output
        new winston.transports.Console({
            stderrLevels: ['error'],
        }),
    ],
    // Prevent crashes on uncaught exceptions
    exitOnError: false,
});

/**
 * Log error with stack trace
 */
export function logError(error: Error | unknown, context?: Record<string, unknown>) {
    if (error instanceof Error) {
        logger.error(error.message, {
            stack: error.stack,
            ...context,
        });
    } else {
        logger.error('Unknown error', {
            error: String(error),
            ...context,
        });
    }
}

/**
 * Log info message
 */
export function logInfo(message: string, meta?: Record<string, unknown>) {
    logger.info(message, meta);
}

/**
 * Log warning message
 */
export function logWarn(message: string, meta?: Record<string, unknown>) {
    logger.warn(message, meta);
}

/**
 * Log debug message
 */
export function logDebug(message: string, meta?: Record<string, unknown>) {
    logger.debug(message, meta);
}

/**
 * Log HTTP request
 */
export function logHttp(message: string, meta?: Record<string, unknown>) {
    logger.http(message, meta);
}

/**
 * Create a child logger with additional context
 */
export function createChildLogger(context: Record<string, unknown>) {
    return logger.child(context);
}
