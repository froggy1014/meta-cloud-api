import type { DedupeStore, WebhookDedupeConfig } from '../../types/config';

/** Default time a dedupe key is remembered: 24 hours. */
export const DEFAULT_DEDUPE_TTL_SECONDS = 86_400;

/** Default number of keys kept by {@link MemoryDedupeStore}. */
export const DEFAULT_MEMORY_DEDUPE_MAX_ENTRIES = 10_000;

export interface MemoryDedupeStoreOptions {
    /** Most keys kept at once; the least recently seen key is dropped first. Defaults to 10,000. */
    maxEntries?: number;
}

/**
 * Bounded in-memory {@link DedupeStore} with per-key TTL and least recently
 * seen eviction. This is the default store for `dedupe`.
 *
 * Single instance only: it lives in this process's memory, so it does not see
 * deliveries handled by other instances and forgets everything on restart (and
 * on each cold start of a serverless function). Use a shared store such as
 * Redis when you run more than one instance.
 */
export class MemoryDedupeStore implements DedupeStore {
    private readonly maxEntries: number;
    /** key -> expiry time in ms. Map order doubles as recency order (oldest first). */
    private readonly entries = new Map<string, number>();

    constructor(options: MemoryDedupeStoreOptions = {}) {
        const maxEntries = options.maxEntries ?? DEFAULT_MEMORY_DEDUPE_MAX_ENTRIES;
        if (!Number.isInteger(maxEntries) || maxEntries < 1) {
            throw new Error(`MemoryDedupeStore maxEntries must be a positive integer, got ${maxEntries}`);
        }
        this.maxEntries = maxEntries;
    }

    async has(key: string): Promise<boolean> {
        return this.lookup(key, Date.now()) !== undefined;
    }

    async setIfAbsent(key: string, ttlSeconds: number): Promise<boolean> {
        const now = Date.now();
        const expiresAt = this.lookup(key, now);
        if (expiresAt !== undefined) {
            // Mark as recently seen without extending the TTL.
            this.entries.delete(key);
            this.entries.set(key, expiresAt);
            return false;
        }
        this.entries.set(key, now + ttlSeconds * 1000);
        this.evict(now);
        return true;
    }

    /** Number of keys currently held (expired keys may still be counted until evicted). */
    get size(): number {
        return this.entries.size;
    }

    /** Forget every key. */
    clear(): void {
        this.entries.clear();
    }

    private lookup(key: string, now: number): number | undefined {
        const expiresAt = this.entries.get(key);
        if (expiresAt === undefined) return undefined;
        if (expiresAt <= now) {
            this.entries.delete(key);
            return undefined;
        }
        return expiresAt;
    }

    private evict(now: number): void {
        for (const [key, expiresAt] of this.entries) {
            if (this.entries.size <= this.maxEntries && expiresAt > now) break;
            this.entries.delete(key);
        }
    }
}

/** Dedupe settings after defaults are applied. */
export type ResolvedDedupe = {
    store: DedupeStore;
    ttlSeconds: number;
};

/** Apply defaults to the `dedupe` config option. Returns undefined when dedupe is off. */
export function resolveDedupe(config: boolean | WebhookDedupeConfig | undefined): ResolvedDedupe | undefined {
    if (!config) return undefined;
    const options = config === true ? {} : config;
    const ttlSeconds = options.ttlSeconds ?? DEFAULT_DEDUPE_TTL_SECONDS;
    if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
        throw new Error(`dedupe.ttlSeconds must be a positive number, got ${ttlSeconds}`);
    }
    return { store: options.store ?? new MemoryDedupeStore(), ttlSeconds };
}
