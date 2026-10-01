import { describe, expect, it } from 'vitest';
import {
    CUSTOMER_SERVICE_WINDOW_MS,
    canSendFreeformMessage,
    FREE_ENTRY_POINT_WINDOW_MS,
    getCustomerServiceWindow,
    getFreeEntryPointWindow,
    MAX_FREE_ENTRY_POINT_WINDOW_MS,
} from '../customerServiceWindow';
import { WhatsAppValidationError } from '../isMetaError';

const HOUR = 60 * 60 * 1000;
const T0_SECONDS = 1_727_856_000; // 2024-10-02T08:00:00Z
const T0 = T0_SECONDS * 1000;

describe('getCustomerServiceWindow', () => {
    it('is 24 hours long', () => {
        expect(CUSTOMER_SERVICE_WINDOW_MS).toBe(24 * HOUR);
    });

    it('is open right after the inbound message', () => {
        const window = getCustomerServiceWindow(new Date(T0), { now: T0 + 1000 });
        expect(window).toEqual({
            isOpen: true,
            expiresAt: new Date(T0 + 24 * HOUR),
            remainingMs: 24 * HOUR - 1000,
        });
    });

    it('is open 1ms before the boundary and closed exactly at it', () => {
        expect(getCustomerServiceWindow(T0, { now: T0 + 24 * HOUR - 1 })).toMatchObject({
            isOpen: true,
            remainingMs: 1,
        });
        expect(getCustomerServiceWindow(T0, { now: T0 + 24 * HOUR })).toEqual({
            isOpen: false,
            expiresAt: new Date(T0 + 24 * HOUR),
            remainingMs: 0,
        });
        expect(getCustomerServiceWindow(T0, { now: T0 + 25 * HOUR }).remainingMs).toBe(0);
    });

    it('accepts webhook unix-seconds strings, seconds and milliseconds numbers, and ISO strings', () => {
        const now = T0 + HOUR;
        const expected = new Date(T0 + 24 * HOUR);
        expect(getCustomerServiceWindow(String(T0_SECONDS), { now }).expiresAt).toEqual(expected);
        expect(getCustomerServiceWindow(` ${T0_SECONDS} `, { now }).expiresAt).toEqual(expected);
        expect(getCustomerServiceWindow(T0_SECONDS, { now }).expiresAt).toEqual(expected);
        expect(getCustomerServiceWindow(T0, { now }).expiresAt).toEqual(expected);
        expect(getCustomerServiceWindow(new Date(T0).toISOString(), { now }).expiresAt).toEqual(expected);
        expect(getCustomerServiceWindow(T0, { now: String(T0_SECONDS + 3600) }).remainingMs).toBe(23 * HOUR);
    });

    it('defaults now to Date.now()', () => {
        expect(getCustomerServiceWindow(Date.now() - HOUR).isOpen).toBe(true);
        expect(getCustomerServiceWindow(Date.now() - 25 * HOUR).isOpen).toBe(false);
    });

    it('returns a closed window without expiry when the user never messaged', () => {
        expect(getCustomerServiceWindow(undefined)).toEqual({ isOpen: false, expiresAt: null, remainingMs: 0 });
        expect(getCustomerServiceWindow(null)).toEqual({ isOpen: false, expiresAt: null, remainingMs: 0 });
    });

    it('throws a validation error for malformed timestamps', () => {
        for (const bad of ['', 'yesterday', 'abc123', Number.NaN, Number.POSITIVE_INFINITY, new Date('x')]) {
            expect(() => getCustomerServiceWindow(bad as never, { now: T0 })).toThrow(WhatsAppValidationError);
        }
        expect(() => getCustomerServiceWindow({} as never, { now: T0 })).toThrow(WhatsAppValidationError);
        expect(() => getCustomerServiceWindow(T0, { now: 'soon' })).toThrow(WhatsAppValidationError);
        expect(() => getCustomerServiceWindow(T0, { safetyMarginMs: -1 })).toThrow(WhatsAppValidationError);
    });

    it('rejects finite timestamps and computed expiries outside the Date range', () => {
        expect(() => getCustomerServiceWindow(1e20, { now: T0 })).toThrow(WhatsAppValidationError);
        expect(() => getCustomerServiceWindow(T0, { now: 1e20 })).toThrow(WhatsAppValidationError);
        expect(() => getCustomerServiceWindow(8.64e15, { now: T0 })).toThrow(WhatsAppValidationError);
        expect(() => getFreeEntryPointWindow(T0, { durationMs: Number.MAX_VALUE })).toThrow(WhatsAppValidationError);
    });

    it('never reports more than 24h remaining when the inbound timestamp is ahead of the local clock', () => {
        const window = getCustomerServiceWindow(T0 + 5 * 60 * 1000, { now: T0 });
        expect(window.isOpen).toBe(true);
        expect(window.remainingMs).toBe(24 * HOUR);
        expect(window.expiresAt).toEqual(new Date(T0 + 5 * 60 * 1000 + 24 * HOUR));
    });

    it('closes early by safetyMarginMs to absorb clock drift', () => {
        const margin = 2 * 60 * 1000;
        expect(
            getCustomerServiceWindow(T0, { now: T0 + 24 * HOUR - margin - 1, safetyMarginMs: margin }),
        ).toMatchObject({ isOpen: true, remainingMs: 1 });
        expect(getCustomerServiceWindow(T0, { now: T0 + 24 * HOUR - margin, safetyMarginMs: margin })).toMatchObject({
            isOpen: false,
            remainingMs: 0,
            expiresAt: new Date(T0 + 24 * HOUR),
        });
    });
});

describe('canSendFreeformMessage', () => {
    it('mirrors isOpen', () => {
        expect(canSendFreeformMessage(String(T0_SECONDS), { now: T0 + 23 * HOUR })).toBe(true);
        expect(canSendFreeformMessage(String(T0_SECONDS), { now: T0 + 24 * HOUR })).toBe(false);
        expect(canSendFreeformMessage(undefined, { now: T0 })).toBe(false);
    });
});

describe('getFreeEntryPointWindow', () => {
    it('defaults to 72 hours from the business reply', () => {
        expect(FREE_ENTRY_POINT_WINDOW_MS).toBe(72 * HOUR);
        expect(getFreeEntryPointWindow(T0, { now: T0 + 71 * HOUR })).toMatchObject({
            isOpen: true,
            remainingMs: HOUR,
            expiresAt: new Date(T0 + 72 * HOUR),
        });
        expect(getFreeEntryPointWindow(T0, { now: T0 + 72 * HOUR }).isOpen).toBe(false);
    });

    it('supports up to 7 days via durationMs', () => {
        expect(MAX_FREE_ENTRY_POINT_WINDOW_MS).toBe(7 * 24 * HOUR);
        const window = getFreeEntryPointWindow(T0, {
            now: T0 + 100 * HOUR,
            durationMs: MAX_FREE_ENTRY_POINT_WINDOW_MS,
        });
        expect(window.isOpen).toBe(true);
        expect(window.expiresAt).toEqual(new Date(T0 + 168 * HOUR));
    });

    it('prefers an explicit expiresAt such as conversation.expiration_timestamp', () => {
        const expiresAtSeconds = String(T0_SECONDS + 5 * 24 * 3600);
        const window = getFreeEntryPointWindow(T0, { now: T0 + 100 * HOUR, expiresAt: expiresAtSeconds });
        expect(window).toEqual({ isOpen: true, expiresAt: new Date(T0 + 120 * HOUR), remainingMs: 20 * HOUR });
    });

    it('validates durationMs', () => {
        expect(() => getFreeEntryPointWindow(T0, { durationMs: -1 })).toThrow(WhatsAppValidationError);
        expect(() => getFreeEntryPointWindow(T0, { durationMs: Number.NaN })).toThrow(WhatsAppValidationError);
    });

    it('does not make free-form messages sendable', () => {
        const repliedAt = T0 + HOUR;
        const now = T0 + 30 * HOUR;
        expect(getFreeEntryPointWindow(repliedAt, { now }).isOpen).toBe(true);
        expect(canSendFreeformMessage(T0, { now })).toBe(false);
    });
});
