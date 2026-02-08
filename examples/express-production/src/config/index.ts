import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

/**
 * Environment variable schema with Zod validation
 * Ensures all required environment variables are present and valid
 */
const envSchema = z.object({
    // Server
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('3000'),

    // WhatsApp Cloud API
    WHATSAPP_ACCESS_TOKEN: z.string().min(1, 'WhatsApp access token is required'),
    WHATSAPP_PHONE_NUMBER_ID: z.string().min(1, 'WhatsApp phone number ID is required'),
    WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional(),
    WHATSAPP_WEBHOOK_VERIFICATION_TOKEN: z.string().min(1, 'Webhook verification token is required'),

    // Database
    DATABASE_URL: z.string().url('Invalid database URL'),

    // Redis
    REDIS_URL: z.string().url('Invalid Redis URL').default('redis://localhost:6379'),
    REDIS_KEY_PREFIX: z.string().default('whatsapp:'),

    // Queue
    QUEUE_PREFIX: z.string().default('whatsapp'),
    QUEUE_ATTEMPTS: z.string().transform(Number).pipe(z.number().int().positive()).default('3'),
    QUEUE_BACKOFF_DELAY: z.string().transform(Number).pipe(z.number().int().positive()).default('5000'),

    // Session
    SESSION_TIMEOUT: z.string().transform(Number).pipe(z.number().int().positive()).default('1800'),
    SESSION_CLEANUP_INTERVAL: z.string().transform(Number).pipe(z.number().int().positive()).default('600000'),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().int().positive()).default('60000'),
    RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().int().positive()).default('100'),

    // Logging
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
    LOG_FORMAT: z.enum(['json', 'simple']).default('json'),

    // Security
    CORS_ORIGIN: z.string().default('*'),
    HELMET_ENABLED: z
        .string()
        .transform((val) => val === 'true')
        .default('true'),

    // Notifications
    SUPPORT_TEAM_PHONE: z.string().optional(),
    TICKET_CREATED_NOTIFICATION_DELAY: z.string().transform(Number).pipe(z.number().int().nonnegative()).default('0'),
    TICKET_REMINDER_NOTIFICATION_DELAY: z
        .string()
        .transform(Number)
        .pipe(z.number().int().nonnegative())
        .default('86400000'),

    // Business
    BUSINESS_NAME: z.string().default('Support Bot'),
    BUSINESS_HOURS_START: z
        .string()
        .regex(/^\d{2}:\d{2}$/)
        .default('09:00'),
    BUSINESS_HOURS_END: z
        .string()
        .regex(/^\d{2}:\d{2}$/)
        .default('18:00'),
    TIMEZONE: z.string().default('America/New_York'),

    // Feature Flags
    ENABLE_ANALYTICS: z
        .string()
        .transform((val) => val === 'true')
        .default('true'),
    ENABLE_AUTO_REPLIES: z
        .string()
        .transform((val) => val === 'true')
        .default('true'),
    ENABLE_TICKET_REMINDERS: z
        .string()
        .transform((val) => val === 'true')
        .default('true'),
    ENABLE_HEALTH_CHECKS: z
        .string()
        .transform((val) => val === 'true')
        .default('true'),
});

/**
 * Parse and validate environment variables
 * Throws an error if validation fails
 */
function parseEnv() {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const issues = error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
            throw new Error(`Environment validation failed:\n${issues}`);
        }
        throw error;
    }
}

/**
 * Validated environment configuration
 * Export as a singleton to ensure consistency across the application
 */
export const config = parseEnv();

/**
 * Type-safe environment configuration
 */
export type Config = z.infer<typeof envSchema>;

/**
 * Helper to check if running in production
 */
export const isProduction = config.NODE_ENV === 'production';

/**
 * Helper to check if running in development
 */
export const isDevelopment = config.NODE_ENV === 'development';

/**
 * Helper to check if running in test
 */
export const isTest = config.NODE_ENV === 'test';
