import Redis from 'ioredis';
import { config } from './index.js';
import { logger } from './logger.js';

/**
 * Redis Client instance for session storage and caching
 * Implements singleton pattern with connection management
 */
class RedisClient {
    private static instance: Redis | null = null;
    private static isConnected = false;

    /**
     * Get Redis Client instance
     * Creates a new instance if it doesn't exist
     */
    public static getInstance(): Redis {
        if (!RedisClient.instance) {
            RedisClient.instance = new Redis(config.REDIS_URL, {
                keyPrefix: config.REDIS_KEY_PREFIX,
                retryStrategy(times) {
                    const delay = Math.min(times * 50, 2000);
                    logger.debug(`Redis retry attempt ${times}, waiting ${delay}ms`);
                    return delay;
                },
                reconnectOnError(err) {
                    logger.warn('Redis reconnect on error', { error: err.message });
                    return true;
                },
                maxRetriesPerRequest: 3,
                enableReadyCheck: true,
                enableOfflineQueue: true,
            });

            // Connection events
            RedisClient.instance.on('connect', () => {
                logger.info('Redis connecting...');
            });

            RedisClient.instance.on('ready', () => {
                RedisClient.isConnected = true;
                logger.info('Redis connected successfully');
            });

            RedisClient.instance.on('error', (error) => {
                logger.error('Redis error', { error: error.message });
            });

            RedisClient.instance.on('close', () => {
                RedisClient.isConnected = false;
                logger.warn('Redis connection closed');
            });

            RedisClient.instance.on('reconnecting', () => {
                logger.info('Redis reconnecting...');
            });

            RedisClient.instance.on('end', () => {
                RedisClient.isConnected = false;
                logger.warn('Redis connection ended');
            });
        }

        return RedisClient.instance;
    }

    /**
     * Disconnect from Redis
     * Ensures clean shutdown
     */
    public static async disconnect(): Promise<void> {
        if (!RedisClient.instance) {
            logger.debug('Redis already disconnected');
            return;
        }

        try {
            await RedisClient.instance.quit();
            RedisClient.isConnected = false;
            RedisClient.instance = null;
            logger.info('Redis disconnected successfully');
        } catch (error) {
            logger.error('Error disconnecting from Redis', {
                error: error instanceof Error ? error.message : String(error),
            });
            // Force disconnect
            RedisClient.instance?.disconnect();
            RedisClient.instance = null;
        }
    }

    /**
     * Health check for Redis connection
     */
    public static async healthCheck(): Promise<boolean> {
        try {
            const client = RedisClient.getInstance();
            const result = await client.ping();
            return result === 'PONG';
        } catch (error) {
            logger.error('Redis health check failed', {
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }

    /**
     * Check if Redis is connected
     */
    public static isReady(): boolean {
        return RedisClient.isConnected && RedisClient.instance?.status === 'ready';
    }
}

/**
 * Export singleton Redis Client instance
 */
export const redis = RedisClient.getInstance();

/**
 * Export Redis utilities
 */
export const disconnectRedis = RedisClient.disconnect.bind(RedisClient);
export const checkRedisHealth = RedisClient.healthCheck.bind(RedisClient);
export const isRedisReady = RedisClient.isReady.bind(RedisClient);
