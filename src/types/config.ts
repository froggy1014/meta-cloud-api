import { WabaConfigEnum } from './enums';

/**
 * Configuration for automatic retry behavior on throttling errors.
 *
 * When the WhatsApp API returns a rate limit error (WhatsAppThrottlingError),
 * the SDK will automatically retry the request using exponential backoff.
 *
 * @example
 * ```typescript
 * const wa = new WhatsApp({
 *   accessToken: '...',
 *   phoneNumberId: 123,
 *   retry: { maxAttempts: 3, backoff: 'exponential', initialDelayMs: 1000 },
 * });
 * ```
 */
export interface RetryConfig {
    /**
     * Maximum number of attempts (including the initial attempt).
     * Defaults to 3.
     */
    maxAttempts?: number;
    /**
     * Backoff strategy.
     * - 'exponential': delay doubles each attempt (1s → 2s → 4s)
     * - 'fixed': constant delay between attempts
     * Defaults to 'exponential'.
     */
    backoff?: 'exponential' | 'fixed';
    /**
     * Initial delay in milliseconds before the first retry.
     * Defaults to 1000 (1 second).
     */
    initialDelayMs?: number;
}

/**
 * Storage used to drop duplicate webhook deliveries. Meta retries deliveries,
 * so the same message or status can arrive more than once.
 *
 * `setIfAbsent` must be atomic: store `key` for `ttlSeconds` only if it is not
 * already there, and resolve `true` when it stored the key (first delivery) or
 * `false` when the key already existed (duplicate). It maps 1:1 to Redis
 * `SET key 1 NX EX ttlSeconds`, which replies `OK` only when the key was set.
 *
 * @example
 * ```typescript
 * const store: DedupeStore = {
 *     async setIfAbsent(key, ttlSeconds) {
 *         return (await redis.set(`wa:${key}`, '1', { NX: true, EX: ttlSeconds })) === 'OK';
 *     },
 * };
 * ```
 */
export interface DedupeStore {
    /** Atomically store `key` for `ttlSeconds` if absent. Resolves `true` if stored, `false` if it existed. */
    setIfAbsent(key: string, ttlSeconds: number): Promise<boolean>;
    /** Optional read-only check. The webhook processor never calls it; it is there for inspection and tests. */
    has?(key: string): Promise<boolean>;
}

/**
 * Opt-in deduplication of webhook deliveries. See {@link DedupeStore}.
 */
export interface WebhookDedupeConfig {
    /**
     * Where seen keys are kept. Defaults to an in-memory store that is bounded
     * and only sees deliveries made to this process: with several instances
     * behind a load balancer, pass a shared store such as Redis.
     */
    store?: DedupeStore;
    /** How long a key is remembered, in seconds. Defaults to 86400 (24 hours). */
    ttlSeconds?: number;
}

export type WhatsAppConfig = {
    accessToken: string;
    appId?: string;
    appSecret?: string;
    phoneNumberId?: number;
    businessAcctId?: string;
    apiVersion?: string;
    webhookEndpoint?: string;
    webhookVerificationToken?: string;
    listenerPort?: number;
    debug?: boolean;
    maxRetriesAfterWait?: number;
    requestTimeout?: number;
    privatePem?: string;
    passphrase?: string;
    /** Automatic retry configuration for throttling errors. */
    retry?: RetryConfig;
    /**
     * Reject webhook POSTs whose `X-Hub-Signature-256` header is not a valid
     * HMAC-SHA256 of the raw body keyed with `appSecret`. Requires `appSecret`.
     *
     * Off by default for backward compatibility. Turn it on in production:
     * without it anyone who knows your webhook URL can post fake messages.
     *
     * Express users must keep the raw body, since re-serialized JSON will not match:
     * `app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf.toString(); } }))`.
     */
    verifyWebhookSignature?: boolean;
    /**
     * Skip handlers for webhook deliveries that were already seen (Meta retries
     * deliveries). Duplicates still get a 200 response. Used by
     * `WebhookProcessor` and the framework adapters only.
     *
     * Keys: `message:<id>` for messages, `status:<id>:<status>` for statuses,
     * and the call or echo ids for `calls`, `smb_message_echoes` and
     * `message_echoes`. Other fields have no natural id and are never deduped.
     *
     * `true` uses the defaults (in-memory store, single instance only, 24 hour TTL).
     * Off by default.
     */
    dedupe?: boolean | WebhookDedupeConfig;
};

export type WabaConfigType = {
    /**
     * The Meta for Developers business application Id for this registered application.
     */
    [WabaConfigEnum.AppId]: string;

    /**
     * The Meta for Developers business application secret for this registered application.
     */
    [WabaConfigEnum.AppSecret]: string;

    /**
     * The Meta for Developers phone number id used by the registered business.
     */
    [WabaConfigEnum.PhoneNumberId]: number;

    /**
     * The Meta for Developers business id for the registered business.
     */
    [WabaConfigEnum.BusinessAcctId]: string;
    /**
     * The version of the Cloud API being used. Starts with a "v" and follows the major number.
     */
    [WabaConfigEnum.APIVersion]: string;

    /**
     * The access token to make calls on behalf of the signed in Meta for Developers account or business.
     */
    [WabaConfigEnum.AccessToken]: string;

    /**
     * The endpoint path (e.g. if the value here is webhook, the webhook URL would look like http/https://{host}/webhook).
     */
    [WabaConfigEnum.WebhookEndpoint]: string;

    /**
     * The verification token that needs to match what is sent by the Cloud API webhook in order to subscribe.
     */
    [WabaConfigEnum.WebhookVerificationToken]: string;

    /**
     * The listener port for the webhook web server.
     */
    [WabaConfigEnum.ListenerPort]: number;

    /**
     * To turn on global debugging of the logger to print verbose output across the APIs.
     */
    [WabaConfigEnum.Debug]: boolean;

    /**
     * The total number of times a request should be retried after the wait period if it fails.
     */
    [WabaConfigEnum.MaxRetriesAfterWait]: number;

    /**
     * The timeout period for a request to quit and destroy the attempt in ms.
     */
    [WabaConfigEnum.RequestTimeout]: number;

    /**
     * The private key for the Meta for Developers business.
     */
    [WabaConfigEnum.PrivatePem]: string;

    /**
     * The passphrase for the Meta for Developers business.
     */
    [WabaConfigEnum.Passphrase]: string;

    /**
     * Automatic retry configuration for throttling errors.
     * Passed through from WhatsAppConfig.
     */
    retry?: RetryConfig;
};
