import { describe, expect, it } from 'vitest';
import { compareMessageStatus, isMessageStatusAdvance, resolveMessageStatus } from '../messageStatus';

/** Folds a sequence of webhook statuses the way a status handler stores them. */
function store(...statuses: string[]): string | undefined {
    return statuses.reduce<string | undefined>(
        (current, incoming) => resolveMessageStatus(current, incoming),
        undefined,
    );
}

describe('compareMessageStatus', () => {
    it('orders sent < failed < delivered < read', () => {
        const sorted = ['read', 'sent', 'delivered', 'failed'].sort(compareMessageStatus);
        expect(sorted).toEqual(['sent', 'failed', 'delivered', 'read']);
    });

    it('ranks unknown statuses below sent', () => {
        expect(compareMessageStatus('played', 'sent')).toBeLessThan(0);
        expect(compareMessageStatus('read', 'read')).toBe(0);
    });
});

describe('resolveMessageStatus', () => {
    it('keeps read when delivered arrives after it', () => {
        expect(store('sent', 'read', 'delivered')).toBe('read');
    });

    it('advances in order', () => {
        expect(store('sent', 'delivered', 'read')).toBe('read');
        expect(store('delivered', 'sent')).toBe('delivered');
    });

    it('lets failed replace sent but never delivered or read', () => {
        expect(store('sent', 'failed')).toBe('failed');
        expect(store('failed', 'sent')).toBe('failed');
        expect(store('read', 'failed')).toBe('read');
        expect(store('delivered', 'failed')).toBe('delivered');
    });

    it('takes the incoming status when nothing is stored yet', () => {
        expect(resolveMessageStatus(undefined, 'delivered')).toBe('delivered');
        expect(resolveMessageStatus(null, 'failed')).toBe('failed');
        expect(resolveMessageStatus('', 'sent')).toBe('sent');
    });

    it('treats an unknown stored status as the earliest stage', () => {
        expect(resolveMessageStatus('sending', 'sent')).toBe('sent');
        expect(resolveMessageStatus('read', 'mystery')).toBe('read');
    });
});

describe('isMessageStatusAdvance', () => {
    it('is true only for a later status or an empty store', () => {
        expect(isMessageStatusAdvance(undefined, 'sent')).toBe(true);
        expect(isMessageStatusAdvance('delivered', 'read')).toBe(true);
        expect(isMessageStatusAdvance('read', 'read')).toBe(false);
        expect(isMessageStatusAdvance('read', 'delivered')).toBe(false);
    });
});
