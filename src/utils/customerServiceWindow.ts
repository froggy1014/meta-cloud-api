// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages/

import { WhatsAppValidationError } from './isMetaError';

const HOUR_MS = 60 * 60 * 1000;

/**
 * Length of the customer service window: 24 hours.
 *
 * "When a WhatsApp user messages you or calls you, a 24-hour timer called a customer service window
 * starts. If the user messages or calls you again before the timer expires, the timer resets to
 * 24 hours. [...] When the window closes, you can only send pre-approved template messages."
 *
 * @see {@link https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages/ | Send messages: customer service windows}
 */
export const CUSTOMER_SERVICE_WINDOW_MS = 24 * HOUR_MS;

/**
 * SDK fallback length of a free entry point (FEP) window: 72 hours.
 * Prefer the expiry supplied by Meta; this fallback does not establish billing eligibility.
 *
 * @see {@link https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/ | Pricing: free entry point windows}
 */
export const FREE_ENTRY_POINT_WINDOW_MS = 72 * HOUR_MS;

/**
 * Longest free entry point window Meta documents: up to 7 days for conversations started from an
 * ad that clicks to WhatsApp.
 *
 * @see {@link https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/ | Pricing: free entry point windows}
 */
export const MAX_FREE_ENTRY_POINT_WINDOW_MS = 7 * 24 * HOUR_MS;

/**
 * A point in time accepted by the window helpers:
 * - `Date`
 * - `number`: Unix epoch in milliseconds, or in seconds when below `1e11` (before the year 5138 in
 *   seconds, before March 1973 in milliseconds), so both `Date.now()` and webhook timestamps work
 * - `string`: a numeric string such as the webhook `messages[].timestamp` (`"1727856000"`, Unix
 *   seconds, same rule as numbers), or any string `Date.parse` understands (ISO 8601)
 */
export type WindowTimestamp = Date | number | string;

/** State of a messaging window at a given instant. */
export interface MessagingWindow {
    /** True while the window is open (`now < expiresAt`). */
    isOpen: boolean;
    /** When the window closes, or `null` when there is no window (no inbound message yet). */
    expiresAt: Date | null;
    /** Milliseconds until the window closes, `0` once closed. Never more than the window length. */
    remainingMs: number;
}

export interface CustomerServiceWindowOptions {
    /** The instant to evaluate. Defaults to `Date.now()`. */
    now?: WindowTimestamp;
    /**
     * Treat the window as closing this many milliseconds early. Use it to absorb clock drift between
     * your servers and Meta and the time a send spends in flight. Defaults to `0`.
     */
    safetyMarginMs?: number;
}

export interface FreeEntryPointWindowOptions extends CustomerServiceWindowOptions {
    /**
     * Window length. Defaults to {@link FREE_ENTRY_POINT_WINDOW_MS} (72 hours). Meta may keep a
     * click-to-WhatsApp ad window open for up to {@link MAX_FREE_ENTRY_POINT_WINDOW_MS} (7 days)
     * without saying how long a given window lasts, so prefer `expiresAt` when you have it.
     */
    durationMs?: number;
    /**
     * Exact expiry when known, for example the status webhook's `conversation.expiration_timestamp`
     * (Unix seconds). Overrides `durationMs`.
     */
    expiresAt?: WindowTimestamp;
}

const SECONDS_THRESHOLD = 1e11;

function toEpochMs(value: WindowTimestamp, name: string): number {
    let ms: number;

    if (value instanceof Date) {
        ms = value.getTime();
    } else if (typeof value === 'number') {
        ms = Math.abs(value) < SECONDS_THRESHOLD ? value * 1000 : value;
    } else if (typeof value === 'string') {
        const trimmed = value.trim();
        if (/^\d+(\.\d+)?$/.test(trimmed)) {
            const num = Number(trimmed);
            ms = num < SECONDS_THRESHOLD ? num * 1000 : num;
        } else {
            ms = trimmed === '' ? Number.NaN : Date.parse(trimmed);
        }
    } else {
        ms = Number.NaN;
    }

    if (!Number.isFinite(ms) || !Number.isFinite(new Date(ms).getTime())) {
        throw new WhatsAppValidationError(`${name} is not a valid timestamp: ${String(value)}`);
    }
    return ms;
}

function toNonNegativeMs(value: number | undefined, name: string, fallback: number): number {
    if (value === undefined) return fallback;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
        throw new WhatsAppValidationError(`${name} must be a non-negative number of milliseconds`);
    }
    return value;
}

function computeWindow(startMs: number, endMs: number, nowMs: number, safetyMarginMs: number): MessagingWindow {
    if (!Number.isFinite(new Date(endMs).getTime())) {
        throw new WhatsAppValidationError('Window expiry is outside the supported timestamp range');
    }
    const lengthMs = Math.max(0, endMs - startMs);
    const effectiveEndMs = endMs - safetyMarginMs;
    // A start in the future means the clocks disagree; never report more than one full window.
    const remainingMs = Math.min(Math.max(0, effectiveEndMs - nowMs), lengthMs);
    return {
        isOpen: remainingMs > 0,
        expiresAt: new Date(endMs),
        remainingMs,
    };
}

const CLOSED: MessagingWindow = Object.freeze({ isOpen: false, expiresAt: null, remainingMs: 0 }) as MessagingWindow;

/**
 * Returns the state of the 24-hour customer service window opened by the user's last inbound
 * message (or call).
 *
 * Free-form (non-template) messages can only be sent while it is open; outside it only approved
 * template messages are delivered (Meta rejects others with error `131047`). The window is exactly
 * 24 hours from the user's last message: at `lastInboundAt + 24h` it is closed.
 *
 * Pass the webhook message `timestamp` (Unix seconds string) of the latest message from the user.
 * Messages you send do not extend the window. Pass `null`/`undefined` when the user has never
 * messaged you; that returns a closed window with `expiresAt: null`.
 *
 * A free entry point window does not reopen this window: "the customer service window is independent
 * of the FEP window, so if the customer service window closes, you will only be able to send template
 * messages." Use {@link getFreeEntryPointWindow} for the pricing side.
 *
 * @throws WhatsAppValidationError when a timestamp or `safetyMarginMs` is malformed.
 *
 * @see {@link https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages/ | Send messages: customer service windows}
 * @see {@link https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/ | Pricing}
 *
 * @example
 * ```ts
 * const { isOpen, expiresAt } = getCustomerServiceWindow(message.timestamp);
 * if (!isOpen) await sendTemplateInstead();
 * ```
 */
export function getCustomerServiceWindow(
    lastInboundAt: WindowTimestamp | null | undefined,
    options: CustomerServiceWindowOptions = {},
): MessagingWindow {
    const safetyMarginMs = toNonNegativeMs(options.safetyMarginMs, 'safetyMarginMs', 0);
    const nowMs = options.now === undefined ? Date.now() : toEpochMs(options.now, 'now');
    if (lastInboundAt === null || lastInboundAt === undefined) return { ...CLOSED };

    const startMs = toEpochMs(lastInboundAt, 'lastInboundAt');
    return computeWindow(startMs, startMs + CUSTOMER_SERVICE_WINDOW_MS, nowMs, safetyMarginMs);
}

/**
 * True when a free-form (non-template) message can be sent: the customer service window opened by
 * the user's last inbound message is still open. See {@link getCustomerServiceWindow}.
 *
 * @throws WhatsAppValidationError when a timestamp or `safetyMarginMs` is malformed.
 */
export function canSendFreeformMessage(
    lastInboundAt: WindowTimestamp | null | undefined,
    options: CustomerServiceWindowOptions = {},
): boolean {
    return getCustomerServiceWindow(lastInboundAt, options).isOpen;
}

/**
 * Returns the state of a free entry point (FEP) window.
 *
 * For eligible click-to-WhatsApp ad traffic, replying within the customer service window opens
 * a billing window from the time of your reply. Pass that first reply time as `openedAt`.
 *
 * Meta documents windows lasting up to 7 days for ads that click to WhatsApp. This helper uses
 * a 72-hour fallback estimate. Pass `expiresAt` (the status webhook's
 * `conversation.expiration_timestamp`) when you have it, or set `durationMs`.
 *
 * This is a billing window only. It does not allow free-form messages after the customer service
 * window closes; check {@link canSendFreeformMessage} for that.
 *
 * @throws WhatsAppValidationError when a timestamp, `durationMs` or `safetyMarginMs` is malformed.
 *
 * @see {@link https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/ | Pricing: free entry point windows}
 */
export function getFreeEntryPointWindow(
    openedAt: WindowTimestamp | null | undefined,
    options: FreeEntryPointWindowOptions = {},
): MessagingWindow {
    const safetyMarginMs = toNonNegativeMs(options.safetyMarginMs, 'safetyMarginMs', 0);
    const durationMs = toNonNegativeMs(options.durationMs, 'durationMs', FREE_ENTRY_POINT_WINDOW_MS);
    const nowMs = options.now === undefined ? Date.now() : toEpochMs(options.now, 'now');
    if (openedAt === null || openedAt === undefined) return { ...CLOSED };

    const startMs = toEpochMs(openedAt, 'openedAt');
    const endMs = options.expiresAt === undefined ? startMs + durationMs : toEpochMs(options.expiresAt, 'expiresAt');
    return computeWindow(startMs, endMs, nowMs, safetyMarginMs);
}
