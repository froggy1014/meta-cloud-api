import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';
import { config } from './index.js';

/**
 * Prisma Client instance with logging and error handling
 * Implements singleton pattern to ensure single connection pool
 */
class DatabaseClient {
    private static instance: PrismaClient | null = null;
    private static isConnected = false;

    /**
     * Get Prisma Client instance
     * Creates a new instance if it doesn't exist
     */
    public static getInstance(): PrismaClient {
        if (!DatabaseClient.instance) {
            DatabaseClient.instance = new PrismaClient({
                log:
                    config.NODE_ENV === 'development'
                        ? [
                              { emit: 'event', level: 'query' },
                              { emit: 'event', level: 'error' },
                              { emit: 'event', level: 'warn' },
                          ]
                        : [{ emit: 'event', level: 'error' }],
            });

            // Log queries in development
            if (config.NODE_ENV === 'development') {
                DatabaseClient.instance.$on(
                    'query' as never,
                    ((e: { query: string; duration: number }) => {
                        logger.debug('Database query', {
                            query: e.query,
                            duration: `${e.duration}ms`,
                        });
                    }) as never,
                );
            }

            // Log errors
            DatabaseClient.instance.$on(
                'error' as never,
                ((e: { message: string }) => {
                    logger.error('Database error', { message: e.message });
                }) as never,
            );

            // Log warnings
            DatabaseClient.instance.$on(
                'warn' as never,
                ((e: { message: string }) => {
                    logger.warn('Database warning', { message: e.message });
                }) as never,
            );
        }

        return DatabaseClient.instance;
    }

    /**
     * Connect to database
     * Tests the connection and logs success/failure
     */
    public static async connect(): Promise<void> {
        if (DatabaseClient.isConnected) {
            logger.debug('Database already connected');
            return;
        }

        try {
            const client = DatabaseClient.getInstance();
            await client.$connect();
            DatabaseClient.isConnected = true;
            logger.info('Database connected successfully');
        } catch (error) {
            logger.error('Failed to connect to database', {
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    /**
     * Disconnect from database
     * Ensures clean shutdown
     */
    public static async disconnect(): Promise<void> {
        if (!DatabaseClient.isConnected || !DatabaseClient.instance) {
            logger.debug('Database already disconnected');
            return;
        }

        try {
            await DatabaseClient.instance.$disconnect();
            DatabaseClient.isConnected = false;
            DatabaseClient.instance = null;
            logger.info('Database disconnected successfully');
        } catch (error) {
            logger.error('Error disconnecting from database', {
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    /**
     * Health check for database connection
     */
    public static async healthCheck(): Promise<boolean> {
        try {
            const client = DatabaseClient.getInstance();
            await client.$queryRaw`SELECT 1`;
            return true;
        } catch (error) {
            logger.error('Database health check failed', {
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }
}

/**
 * Export singleton Prisma Client instance
 */
export const prisma = DatabaseClient.getInstance();

/**
 * Export database utilities
 */
export const connectDatabase = DatabaseClient.connect.bind(DatabaseClient);
export const disconnectDatabase = DatabaseClient.disconnect.bind(DatabaseClient);
export const checkDatabaseHealth = DatabaseClient.healthCheck.bind(DatabaseClient);
