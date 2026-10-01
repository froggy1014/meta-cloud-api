import type { ConnectionOptions } from 'bullmq';
import { config } from './index.js';

/**
 * Redis connection options for BullMQ.
 *
 * BullMQ must not share the session Redis client from ./redis.ts: that client
 * sets `keyPrefix` (BullMQ rejects ioredis prefixes; it has its own `prefix`
 * option) and `maxRetriesPerRequest: 3` (BullMQ workers require `null`).
 * Passing options instead of an instance also lets BullMQ open the separate
 * blocking connections it needs.
 */
export function queueConnection(): ConnectionOptions {
    const url = new URL(config.REDIS_URL);
    return {
        host: url.hostname,
        port: url.port ? Number(url.port) : 6379,
        username: url.username || undefined,
        password: url.password ? decodeURIComponent(url.password) : undefined,
        db: url.pathname.length > 1 ? Number(url.pathname.slice(1)) : 0,
        ...(url.protocol === 'rediss:' && { tls: {} }),
        maxRetriesPerRequest: null,
    };
}
