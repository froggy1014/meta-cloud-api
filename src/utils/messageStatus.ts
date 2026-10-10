// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/status/

import type { StatusWebhook } from '../core/webhook/types/status';

/** Status reported by a message status webhook (`statuses[].status`). */
export type MessageDeliveryStatus = StatusWebhook['status'];

/**
 * Progress of an outgoing message, lowest first. `failed` sits between `sent` and `delivered`: a
 * failure replaces `sent`, but once Meta has reported `delivered` or `read` a late `failed` cannot
 * undo it.
 */
const STATUS_ORDER: Record<MessageDeliveryStatus, number> = {
    sent: 1,
    failed: 2,
    delivered: 3,
    read: 4,
};

function rank(status: string | null | undefined): number {
    return status && Object.hasOwn(STATUS_ORDER, status) ? STATUS_ORDER[status as MessageDeliveryStatus] : 0;
}

/**
 * Orders two message statuses by delivery progress: `sent` < `failed` < `delivered` < `read`.
 * Statuses the SDK does not know rank below `sent`.
 *
 * Returns a negative number when `a` is earlier than `b`, a positive number when it is later, and
 * `0` when they are at the same stage. Usable as an `Array.prototype.sort` comparator.
 *
 * @example
 * ```ts
 * compareMessageStatus('delivered', 'read'); // < 0
 * ```
 */
export function compareMessageStatus(
    a: MessageDeliveryStatus | (string & {}),
    b: MessageDeliveryStatus | (string & {}),
): number {
    return rank(a) - rank(b);
}

/**
 * Whether storing `incoming` over `current` moves the message forward. True when nothing is stored
 * yet; false for a repeat of the same status or a late, earlier one.
 *
 * Use it to skip the database write for a stale webhook.
 */
export function isMessageStatusAdvance(
    current: MessageDeliveryStatus | (string & {}) | null | undefined,
    incoming: MessageDeliveryStatus | (string & {}),
): boolean {
    if (current === null || current === undefined || current === '') return true;
    return compareMessageStatus(incoming, current) > 0;
}

/**
 * Returns the status to store when a status webhook arrives for a message whose stored status is
 * `current`. The result never moves backwards.
 *
 * Meta does not guarantee the order of status webhooks. `sent`, `delivered` and `read` for the same
 * message often arrive within a second of each other, and `read` can arrive before `delivered`.
 * Writing every webhook as it comes turns a read message back into a delivered one (grey ticks
 * instead of blue). Resolve each update through this function instead:
 *
 * - `sent` → `read` → `delivered` resolves to `read`
 * - `sent` → `failed` resolves to `failed`; `read` → `failed` stays `read`
 * - with no stored status (`null`/`undefined`), the incoming status is taken as-is
 * - an unknown incoming status never replaces a known one
 *
 * @example
 * ```ts
 * handler.processor.onStatus(async (_whatsapp, { status }) => {
 *     const row = await db.messages.find(status.id);
 *     const next = resolveMessageStatus(row?.status, status.status);
 *     if (next !== row?.status) await db.messages.update(status.id, { status: next });
 * });
 * ```
 *
 * @see {@link https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/status/ | Status messages webhook reference}
 */
export function resolveMessageStatus<T extends MessageDeliveryStatus | (string & {})>(
    current: T | null | undefined,
    incoming: T,
): T {
    if (current === null || current === undefined || current === '') return incoming;
    return compareMessageStatus(incoming, current) > 0 ? incoming : current;
}
