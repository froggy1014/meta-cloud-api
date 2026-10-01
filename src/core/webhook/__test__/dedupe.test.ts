import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DedupeStore, WhatsAppConfig } from '../../../types/config';
import Logger from '../../../utils/logger';
import { DEFAULT_DEDUPE_TTL_SECONDS, MemoryDedupeStore, resolveDedupe } from '../dedupe';
import { WebhookProcessor } from '../WebhookProcessor';

vi.mock('../../whatsapp', () => ({
    WhatsApp: class MockWhatsApp {},
}));

const createProcessor = (dedupe: WhatsAppConfig['dedupe']) =>
    new WebhookProcessor({
        accessToken: 'test-token',
        phoneNumberId: 123456789,
        webhookVerificationToken: 'test-verify-token',
        dedupe,
    });

const metadata = { display_phone_number: '15550000000', phone_number_id: '123456789' };

const request = (field: string, value: unknown) =>
    new Request('https://example.com/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            object: 'whatsapp_business_account',
            entry: [{ id: 'WABA_ID', changes: [{ field, value }] }],
        }),
    });

const textMessage = (id: string) =>
    request('messages', {
        messaging_product: 'whatsapp',
        metadata,
        contacts: [{ profile: { name: 'Alice' }, wa_id: '15551234567' }],
        messages: [{ from: '15551234567', id, timestamp: '1700000000', type: 'text', text: { body: 'hi' } }],
    });

const statusUpdate = (id: string, status: string) =>
    request('messages', {
        messaging_product: 'whatsapp',
        metadata,
        statuses: [{ id, status, timestamp: '1700000000', recipient_id: '15551234567' }],
    });

const callEvent = (id: string, event: string) =>
    request('calls', { messaging_product: 'whatsapp', metadata, calls: [{ id, event, timestamp: 1700000000 }] });

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('MemoryDedupeStore', () => {
    it('stores a key once and reports later attempts as duplicates', async () => {
        const store = new MemoryDedupeStore();
        expect(await store.setIfAbsent('a', 60)).toBe(true);
        expect(await store.setIfAbsent('a', 60)).toBe(false);
        expect(await store.has('a')).toBe(true);
        expect(await store.has('b')).toBe(false);
    });

    it('forgets keys after their TTL', async () => {
        vi.useFakeTimers();
        const store = new MemoryDedupeStore();
        await store.setIfAbsent('a', 10);

        vi.advanceTimersByTime(9_999);
        expect(await store.has('a')).toBe(true);
        vi.advanceTimersByTime(1);
        expect(await store.has('a')).toBe(false);
        expect(await store.setIfAbsent('a', 10)).toBe(true);
    });

    it('does not extend the TTL when a duplicate is seen', async () => {
        vi.useFakeTimers();
        const store = new MemoryDedupeStore();
        await store.setIfAbsent('a', 10);
        vi.advanceTimersByTime(5_000);
        expect(await store.setIfAbsent('a', 10)).toBe(false);
        vi.advanceTimersByTime(5_000);
        expect(await store.setIfAbsent('a', 10)).toBe(true);
    });

    it('evicts the least recently seen key when full', async () => {
        const store = new MemoryDedupeStore({ maxEntries: 2 });
        await store.setIfAbsent('a', 60);
        await store.setIfAbsent('b', 60);
        await store.setIfAbsent('a', 60); // touch a, so b is now the oldest
        await store.setIfAbsent('c', 60);

        expect(store.size).toBe(2);
        expect(await store.has('a')).toBe(true);
        expect(await store.has('b')).toBe(false);
        expect(await store.has('c')).toBe(true);
    });

    it('sweeps expired keys on write even when not full', async () => {
        vi.useFakeTimers();
        const store = new MemoryDedupeStore({ maxEntries: 3 });
        await store.setIfAbsent('short', 1);
        await store.setIfAbsent('long', 60);
        vi.advanceTimersByTime(1_000);
        await store.setIfAbsent('new', 60);

        expect(store.size).toBe(2);
        expect(await store.has('long')).toBe(true);
        expect(await store.has('new')).toBe(true);
    });

    it('rejects an invalid maxEntries', () => {
        expect(() => new MemoryDedupeStore({ maxEntries: 0 })).toThrow(/maxEntries/);
    });
});

describe('resolveDedupe', () => {
    it('is off unless configured', () => {
        expect(resolveDedupe(undefined)).toBeUndefined();
        expect(resolveDedupe(false)).toBeUndefined();
    });

    it('applies defaults', () => {
        const resolved = resolveDedupe(true);
        expect(resolved?.ttlSeconds).toBe(DEFAULT_DEDUPE_TTL_SECONDS);
        expect(resolved?.store).toBeInstanceOf(MemoryDedupeStore);
    });

    it('rejects a non-positive TTL', () => {
        expect(() => resolveDedupe({ ttlSeconds: 0 })).toThrow(/ttlSeconds/);
    });
});

describe('WebhookProcessor dedupe', () => {
    it('is off by default', async () => {
        const processor = createProcessor(undefined);
        const handler = vi.fn();
        processor.onText(handler);

        await processor.processWebhook(textMessage('wamid.1'));
        await processor.processWebhook(textMessage('wamid.1'));

        expect(handler).toHaveBeenCalledTimes(2);
    });

    it('skips pre, type and post handlers for a duplicate message but returns 200', async () => {
        const processor = createProcessor(true);
        const pre = vi.fn();
        const handler = vi.fn();
        const post = vi.fn();
        processor.onMessagePreProcess(pre);
        processor.onText(handler);
        processor.onMessagePostProcess(post);

        const first = await processor.processWebhook(textMessage('wamid.1'));
        const second = await processor.processWebhook(textMessage('wamid.1'));
        await processor.processWebhook(textMessage('wamid.2'));

        expect(first.status).toBe(200);
        expect(second.status).toBe(200);
        expect(handler).toHaveBeenCalledTimes(2);
        expect(pre).toHaveBeenCalledTimes(2);
        expect(post).toHaveBeenCalledTimes(2);
    });

    it('skips a repeated status but not a new status of the same message', async () => {
        const processor = createProcessor(true);
        const handler = vi.fn();
        processor.onStatus(handler);

        await processor.processWebhook(statusUpdate('wamid.out', 'sent'));
        await processor.processWebhook(statusUpdate('wamid.out', 'sent'));
        await processor.processWebhook(statusUpdate('wamid.out', 'delivered'));
        await processor.processWebhook(statusUpdate('wamid.out', 'read'));

        expect(handler.mock.calls.map((call) => call[1].status.status)).toEqual(['sent', 'delivered', 'read']);
    });

    it('processes a message again once the TTL has passed', async () => {
        vi.useFakeTimers();
        const processor = createProcessor({ ttlSeconds: 60 });
        const handler = vi.fn();
        processor.onText(handler);

        await processor.processWebhook(textMessage('wamid.1'));
        vi.advanceTimersByTime(59_000);
        await processor.processWebhook(textMessage('wamid.1'));
        vi.advanceTimersByTime(1_000);
        await processor.processWebhook(textMessage('wamid.1'));

        expect(handler).toHaveBeenCalledTimes(2);
    });

    it('dedupes call events by call id and event', async () => {
        const processor = createProcessor(true);
        const handler = vi.fn();
        processor.onCalls(handler);

        await processor.processWebhook(callEvent('call.1', 'connect'));
        await processor.processWebhook(callEvent('call.1', 'connect'));
        await processor.processWebhook(callEvent('call.1', 'terminate'));

        expect(handler).toHaveBeenCalledTimes(2);
    });

    it('never dedupes fields without a natural id', async () => {
        const processor = createProcessor(true);
        const handler = vi.fn();
        processor.on('account_update', handler);
        const value = { phone_number: '15550000000', event: 'VERIFIED_ACCOUNT' };

        await processor.processWebhook(request('account_update', value));
        await processor.processWebhook(request('account_update', value));

        expect(handler).toHaveBeenCalledTimes(2);
    });

    it('uses a custom store with the configured TTL and documented keys', async () => {
        const seen = new Set<string>();
        const store: DedupeStore = {
            setIfAbsent: vi.fn(async (key: string) => {
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            }),
        };
        const processor = createProcessor({ store, ttlSeconds: 120 });
        const text = vi.fn();
        const status = vi.fn();
        processor.onText(text);
        processor.onStatus(status);

        await processor.processWebhook(textMessage('wamid.1'));
        await processor.processWebhook(textMessage('wamid.1'));
        await processor.processWebhook(statusUpdate('wamid.out', 'sent'));

        expect(text).toHaveBeenCalledOnce();
        expect(status).toHaveBeenCalledOnce();
        expect(store.setIfAbsent).toHaveBeenNthCalledWith(1, 'message:wamid.1', 120);
        expect(store.setIfAbsent).toHaveBeenNthCalledWith(3, 'status:wamid.out:sent', 120);
    });

    it('does not touch the store when no handler would run', async () => {
        const store: DedupeStore = { setIfAbsent: vi.fn(async () => true) };
        const processor = createProcessor({ store });

        await processor.processWebhook(textMessage('wamid.1'));
        await processor.processWebhook(callEvent('call.1', 'connect'));

        expect(store.setIfAbsent).not.toHaveBeenCalled();
    });

    it('fails open and logs when the store throws', async () => {
        const error = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
        const store: DedupeStore = {
            setIfAbsent: vi.fn(async () => {
                throw new Error('redis down');
            }),
        };
        const processor = createProcessor({ store });
        const handler = vi.fn();
        processor.onText(handler);

        const first = await processor.processWebhook(textMessage('wamid.1'));
        const second = await processor.processWebhook(textMessage('wamid.1'));

        expect(first.status).toBe(200);
        expect(second.status).toBe(200);
        expect(handler).toHaveBeenCalledTimes(2);
        expect(error).toHaveBeenCalledWith(
            expect.stringContaining('Dedupe store failed'),
            expect.objectContaining({ key: 'message:wamid.1' }),
        );
    });

    it('keeps a separate in-memory store per processor', async () => {
        const a = createProcessor(true);
        const b = createProcessor(true);
        const handlerA = vi.fn();
        const handlerB = vi.fn();
        a.onText(handlerA);
        b.onText(handlerB);

        await a.processWebhook(textMessage('wamid.1'));
        await b.processWebhook(textMessage('wamid.1'));

        expect(handlerA).toHaveBeenCalledOnce();
        expect(handlerB).toHaveBeenCalledOnce();
    });
});
