// Docs: https://developers.facebook.com/docs/graph-api/overview/rate-limiting/

/**
 * Usage percentages reported by Meta. Each value is the share (0-100+) of the allowance used in the
 * current rolling window.
 */
export interface RateLimitUsage {
    /** Percentage of calls made (`call_count`). */
    callCount?: number;
    /** Percentage of total CPU time used (`total_cputime`). */
    totalCputime?: number;
    /** Percentage of total time used (`total_time`). */
    totalTime?: number;
}

/** One entry of the `X-Business-Use-Case-Usage` header. */
export interface BusinessUseCaseUsage extends RateLimitUsage {
    /** The business object the entry belongs to (for WhatsApp, usually the WABA or phone number ID). */
    businessId: string;
    /** Rate limit type, e.g. `whatsapp_business_management` or `whatsapp`. */
    type?: string;
    /**
     * `estimated_time_to_regain_access`: "Time, in minutes, until calls will no longer be throttled."
     * `0` when not throttled.
     */
    estimatedTimeToRegainAccessMinutes?: number;
    /** `ads_api_access_tier`, only sent for Marketing API use cases. */
    adsApiAccessTier?: string;
}

/**
 * Rate limit information parsed from a Graph API response.
 *
 * WhatsApp Cloud API responses carry `x-business-use-case-usage` (types
 * `whatsapp_business_management` and `whatsapp`) and `x-app-usage`; throttled responses may add
 * `Retry-After` (seconds).
 */
export interface RateLimitInfo {
    /** Parsed `X-App-Usage` header (platform rate limits). */
    appUsage?: RateLimitUsage;
    /** Parsed `X-Business-Use-Case-Usage` header, flattened across business IDs. Empty when absent. */
    businessUseCaseUsage: BusinessUseCaseUsage[];
    /** Parsed `Retry-After` header in milliseconds (seconds or HTTP-date form). */
    retryAfterMs?: number;
    /**
     * Highest usage percentage across every parsed metric, handy for alerting before Meta starts
     * throttling (it throttles at 100).
     */
    maxUsagePercent?: number;
    /**
     * How long Meta asks you to wait, in milliseconds: the larger of `retryAfterMs` and the largest
     * `estimatedTimeToRegainAccessMinutes`. Undefined when Meta gave no wait time.
     */
    retryDelayMs?: number;
}

/** Headers accepted by {@link parseRateLimitHeaders}. */
export type RateLimitHeadersInput =
    | Headers
    | Record<string, string | string[] | undefined>
    | { get(name: string): string | null };

function readHeader(headers: RateLimitHeadersInput, name: string): string | undefined {
    if (typeof (headers as { get?: unknown }).get === 'function') {
        const value = (headers as { get(name: string): string | null }).get(name);
        return value ?? undefined;
    }
    const record = headers as Record<string, string | string[] | undefined>;
    const key = Object.keys(record).find((k) => k.toLowerCase() === name);
    if (key === undefined) return undefined;
    const value = record[key];
    return Array.isArray(value) ? value[0] : value;
}

function parseJson(value: string | undefined): unknown {
    if (value === undefined || value.trim() === '') return undefined;
    try {
        return JSON.parse(value);
    } catch {
        return undefined;
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function num(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
    return undefined;
}

function str(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
}

function parseUsage(value: Record<string, unknown>): RateLimitUsage {
    const usage: RateLimitUsage = {};
    const callCount = num(value.call_count);
    const totalCputime = num(value.total_cputime);
    const totalTime = num(value.total_time);
    if (callCount !== undefined) usage.callCount = callCount;
    if (totalCputime !== undefined) usage.totalCputime = totalCputime;
    if (totalTime !== undefined) usage.totalTime = totalTime;
    return usage;
}

function parseBusinessUseCaseUsage(value: unknown): BusinessUseCaseUsage[] {
    if (!isRecord(value)) return [];
    const entries: BusinessUseCaseUsage[] = [];
    for (const [businessId, list] of Object.entries(value)) {
        if (!Array.isArray(list)) continue;
        for (const item of list) {
            if (!isRecord(item)) continue;
            const entry: BusinessUseCaseUsage = { businessId, ...parseUsage(item) };
            const type = str(item.type);
            const regain = num(item.estimated_time_to_regain_access);
            const tier = str(item.ads_api_access_tier);
            if (type !== undefined) entry.type = type;
            if (regain !== undefined) entry.estimatedTimeToRegainAccessMinutes = regain;
            if (tier !== undefined) entry.adsApiAccessTier = tier;
            entries.push(entry);
        }
    }
    return entries;
}

/**
 * Parses a `Retry-After` value (delta-seconds or HTTP-date) into milliseconds.
 * Returns undefined for missing or malformed values.
 */
export function parseRetryAfter(value: string | null | undefined, now: number = Date.now()): number | undefined {
    if (value === null || value === undefined) return undefined;
    const trimmed = value.trim();
    if (trimmed === '') return undefined;
    if (/^\d+(\.\d+)?$/.test(trimmed)) return Math.round(Number(trimmed) * 1000);
    // An HTTP-date always names a weekday/month; this rejects values such as "-1" that Date.parse accepts.
    if (!/[a-z]/i.test(trimmed)) return undefined;
    const date = Date.parse(trimmed);
    if (!Number.isFinite(date)) return undefined;
    return Math.max(0, date - now);
}

/**
 * Parses Meta's rate limit headers (`X-App-Usage`, `X-Business-Use-Case-Usage`, `Retry-After`).
 * Header names are matched case-insensitively. Malformed JSON or values are ignored, never thrown.
 *
 * Returns undefined when none of the headers are present.
 *
 * @see {@link https://developers.facebook.com/docs/graph-api/overview/rate-limiting/ | Graph API rate limiting}
 *
 * @example
 * ```ts
 * const info = parseRateLimitHeaders(response.headers);
 * if ((info?.maxUsagePercent ?? 0) > 80) slowDown();
 * ```
 */
export function parseRateLimitHeaders(headers: RateLimitHeadersInput | null | undefined): RateLimitInfo | undefined {
    if (!headers) return undefined;

    const appRaw = readHeader(headers, 'x-app-usage');
    const bucRaw = readHeader(headers, 'x-business-use-case-usage');
    const retryAfterRaw = readHeader(headers, 'retry-after');
    if (appRaw === undefined && bucRaw === undefined && retryAfterRaw === undefined) return undefined;

    const info: RateLimitInfo = { businessUseCaseUsage: [] };

    const appJson = parseJson(appRaw);
    if (isRecord(appJson)) info.appUsage = parseUsage(appJson);

    info.businessUseCaseUsage = parseBusinessUseCaseUsage(parseJson(bucRaw));

    const retryAfterMs = parseRetryAfter(retryAfterRaw);
    if (retryAfterMs !== undefined) info.retryAfterMs = retryAfterMs;

    const usages: RateLimitUsage[] = [...(info.appUsage ? [info.appUsage] : []), ...info.businessUseCaseUsage];
    const percents = usages.flatMap((u) =>
        [u.callCount, u.totalCputime, u.totalTime].filter((v): v is number => v !== undefined),
    );
    if (percents.length > 0) info.maxUsagePercent = Math.max(...percents);

    const waits = [
        ...(retryAfterMs !== undefined ? [retryAfterMs] : []),
        ...info.businessUseCaseUsage
            .map((u) => u.estimatedTimeToRegainAccessMinutes)
            .filter((m): m is number => m !== undefined && m > 0)
            .map((m) => m * 60_000),
    ];
    if (waits.length > 0) info.retryDelayMs = Math.max(...waits);

    return info;
}
