import type { RateLimitInfo } from '../utils/rateLimit';
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
    /**
     * Wait as long as Meta asks before retrying a throttled request. When a throttling response
     * carries `Retry-After` (seconds) or `X-Business-Use-Case-Usage` with
     * `estimated_time_to_regain_access` (minutes), the retry waits the larger of the backoff delay and
     * that server delay, capped at {@link RetryConfig.maxServerDelayMs}. It never adds attempts.
     * Defaults to `true`; set `false` to use the backoff delay only.
     */
    respectServerDelay?: boolean;
    /**
     * Upper bound in milliseconds for a server-provided wait. A longer wait is shortened to this
     * value, so the retry may still be throttled; inspect `error.rateLimit` to reschedule instead.
     * Defaults to 30000 (30 seconds).
     */
    maxServerDelayMs?: number;
}

/** Request details passed to {@link WhatsAppConfig.onRateLimitInfo}. */
export interface RateLimitInfoContext {
    /** HTTP method of the request. */
    method: string;
    /** Endpoint path or absolute URL as passed to the requester. */
    endpoint: string;
    /** HTTP status code of the response. */
    statusCode: number;
}

/** Callback receiving rate limit information parsed from every response that carries it. */
export type RateLimitInfoListener = (info: RateLimitInfo, context: RateLimitInfoContext) => void | Promise<void>;

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
     * Called with the parsed `X-App-Usage` / `X-Business-Use-Case-Usage` / `Retry-After` headers of
     * every response (successful or not) that carries at least one of them. Errors thrown by the
     * callback are ignored. See also `whatsapp.getLastRateLimitInfo()`.
     */
    onRateLimitInfo?: RateLimitInfoListener;
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

    /**
     * Rate limit header listener. Passed through from WhatsAppConfig.
     */
    onRateLimitInfo?: RateLimitInfoListener;
};
