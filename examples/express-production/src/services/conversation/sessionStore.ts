import { config } from '@config/index.js';
import { logger } from '@config/logger.js';
import { redis } from '@config/redis.js';
import { ConversationState } from '@prisma/client';

/**
 * Session data structure
 */
export interface SessionData {
    userId: string;
    state: ConversationState;
    userName?: string;
    issue?: string;
    category?: string;
    context?: Record<string, any>;
    lastMessageAt: number;
    messageCount: number;
}

/**
 * Redis-based session store
 * Manages user conversation sessions with TTL
 */
export class SessionStore {
    private static readonly SESSION_PREFIX = 'session:';
    private static readonly LOCK_PREFIX = 'lock:';
    private static readonly LOCK_TIMEOUT = 5000; // 5 seconds

    /**
     * Generate session key
     */
    private static getSessionKey(userId: string): string {
        return `${SessionStore.SESSION_PREFIX}${userId}`;
    }

    /**
     * Generate lock key
     */
    private static getLockKey(userId: string): string {
        return `${SessionStore.LOCK_PREFIX}${userId}`;
    }

    /**
     * Get session data
     */
    static async get(userId: string): Promise<SessionData | null> {
        try {
            const key = SessionStore.getSessionKey(userId);
            const data = await redis.get(key);

            if (!data) {
                return null;
            }

            const session = JSON.parse(data) as SessionData;

            logger.debug('Session retrieved', {
                userId,
                state: session.state,
                messageCount: session.messageCount,
            });

            return session;
        } catch (error) {
            logger.error('Failed to get session', {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });
            return null;
        }
    }

    /**
     * Set session data with TTL
     */
    static async set(userId: string, data: SessionData): Promise<boolean> {
        try {
            const key = SessionStore.getSessionKey(userId);
            const serialized = JSON.stringify(data);

            await redis.setex(key, config.SESSION_TIMEOUT, serialized);

            logger.debug('Session saved', {
                userId,
                state: data.state,
                ttl: config.SESSION_TIMEOUT,
            });

            return true;
        } catch (error) {
            logger.error('Failed to set session', {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }

    /**
     * Update session data
     */
    static async update(userId: string, updates: Partial<SessionData>): Promise<boolean> {
        try {
            const existing = await SessionStore.get(userId);

            if (!existing) {
                logger.warn('Cannot update non-existent session', { userId });
                return false;
            }

            const updated: SessionData = {
                ...existing,
                ...updates,
                lastMessageAt: Date.now(),
            };

            return await SessionStore.set(userId, updated);
        } catch (error) {
            logger.error('Failed to update session', {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }

    /**
     * Delete session
     */
    static async delete(userId: string): Promise<boolean> {
        try {
            const key = SessionStore.getSessionKey(userId);
            await redis.del(key);

            logger.debug('Session deleted', { userId });

            return true;
        } catch (error) {
            logger.error('Failed to delete session', {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }

    /**
     * Create or initialize a new session
     */
    static async create(userId: string, state: ConversationState = ConversationState.IDLE): Promise<SessionData> {
        const session: SessionData = {
            userId,
            state,
            lastMessageAt: Date.now(),
            messageCount: 0,
            context: {},
        };

        await SessionStore.set(userId, session);

        logger.info('Session created', { userId, state });

        return session;
    }

    /**
     * Get or create session
     */
    static async getOrCreate(userId: string): Promise<SessionData> {
        const existing = await SessionStore.get(userId);

        if (existing) {
            return existing;
        }

        return await SessionStore.create(userId);
    }

    /**
     * Acquire a lock for a user session
     * Prevents concurrent modifications
     */
    static async acquireLock(userId: string): Promise<boolean> {
        try {
            const key = SessionStore.getLockKey(userId);
            const result = await redis.set(key, '1', 'PX', SessionStore.LOCK_TIMEOUT, 'NX');

            return result === 'OK';
        } catch (error) {
            logger.error('Failed to acquire lock', {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }

    /**
     * Release a lock for a user session
     */
    static async releaseLock(userId: string): Promise<boolean> {
        try {
            const key = SessionStore.getLockKey(userId);
            await redis.del(key);

            return true;
        } catch (error) {
            logger.error('Failed to release lock', {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }

    /**
     * Execute a function with a lock
     */
    static async withLock<T>(userId: string, fn: () => Promise<T>): Promise<T | null> {
        const acquired = await SessionStore.acquireLock(userId);

        if (!acquired) {
            logger.warn('Failed to acquire lock, skipping operation', { userId });
            return null;
        }

        try {
            return await fn();
        } finally {
            await SessionStore.releaseLock(userId);
        }
    }

    /**
     * Get session TTL
     */
    static async getTTL(userId: string): Promise<number> {
        try {
            const key = SessionStore.getSessionKey(userId);
            return await redis.ttl(key);
        } catch (error) {
            logger.error('Failed to get TTL', {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });
            return -1;
        }
    }

    /**
     * Extend session TTL
     */
    static async extendTTL(userId: string): Promise<boolean> {
        try {
            const key = SessionStore.getSessionKey(userId);
            await redis.expire(key, config.SESSION_TIMEOUT);

            logger.debug('Session TTL extended', { userId, ttl: config.SESSION_TIMEOUT });

            return true;
        } catch (error) {
            logger.error('Failed to extend TTL', {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }

    /**
     * Clean up expired sessions (called periodically)
     */
    static async cleanup(): Promise<number> {
        try {
            const pattern = `${SessionStore.SESSION_PREFIX}*`;
            const keys = await redis.keys(pattern);

            let cleaned = 0;

            for (const key of keys) {
                const ttl = await redis.ttl(key);

                if (ttl <= 0) {
                    await redis.del(key);
                    cleaned++;
                }
            }

            if (cleaned > 0) {
                logger.info('Session cleanup completed', { cleaned });
            }

            return cleaned;
        } catch (error) {
            logger.error('Session cleanup failed', {
                error: error instanceof Error ? error.message : String(error),
            });
            return 0;
        }
    }
}
