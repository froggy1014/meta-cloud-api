import { WhatsAppValidationError } from './isMetaError';

/**
 * Asserts that a phone number is in valid E.164 format.
 * Accepts numbers with or without leading '+'.
 * Must be 10-15 digits (not counting the '+').
 *
 * @throws WhatsAppValidationError if the phone number is invalid
 *
 * @example
 * assertPhoneNumber('+14155552671'); // ok
 * assertPhoneNumber('14155552671');  // ok
 * assertPhoneNumber('123');          // throws
 */
export function assertPhoneNumber(phone: string): void {
    if (!/^\+?\d{10,15}$/.test(phone)) {
        throw new WhatsAppValidationError(
            `Invalid phone number: "${phone}". Expected E.164 format (e.g. +14155552671 or 14155552671).`,
        );
    }
}

/**
 * Asserts that an array is non-empty.
 * Also guards against null/undefined to preserve backward compatibility
 * with callers that may pass untyped values.
 *
 * @throws WhatsAppValidationError if the array is null, undefined, or empty
 *
 * @example
 * assertNonEmpty(['user1'], 'users'); // ok
 * assertNonEmpty([], 'users');        // throws
 */
export function assertNonEmpty<T>(arr: T[] | null | undefined, name: string): void {
    if (!arr || arr.length === 0) {
        throw new WhatsAppValidationError(`"${name}" must contain at least one item.`);
    }
}
