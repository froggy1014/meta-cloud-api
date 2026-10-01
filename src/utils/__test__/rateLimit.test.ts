import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpMethodsEnum } from '../../types/enums';
import { HttpsClientResponse } from '../http/httpsClient';
import Requester from '../http/request';
import { WhatsAppThrottlingError } from '../isMetaError';
import { parseRateLimitHeaders, parseRetryAfter } from '../rateLimit';

// Samples from docs/reference/business-messaging-api_v23.0.yaml (components.headers)
const BUC_SAMPLE =
    '{"102290129340398":[{"type":"whatsapp_business_management","call_count":1,"total_cputime":1,"total_time":1,"estimated_time_to_regain_access":0},{"type":"whatsapp","call_count":1,"total_cputime":1,"total_time":1,"estimated_time_to_regain_access":0}]}';
const APP_USAGE_SAMPLE = '{"call_count":0,"total_cputime":0,"total_time":0}';

// Throttled shape from https://developers.facebook.com/docs/graph-api/overview/rate-limiting/
const BUC_THROTTLED =
    '{"102290129340398":[{"type":"whatsapp_business_management","call_count":100,"total_cputime":25,"total_time":25,"estimated_time_to_regain_access":19}]}';

describe('parseRateLimitHeaders', () => {
    it('parses the WhatsApp Cloud API header samples', () => {
        const info = parseRateLimitHeaders(
            new Headers({ 'x-business-use-case-usage': BUC_SAMPLE, 'x-app-usage': APP_USAGE_SAMPLE }),
        );
        expect(info).toEqual({
            appUsage: { callCount: 0, totalCputime: 0, totalTime: 0 },
            businessUseCaseUsage: [
                {
                    businessId: '102290129340398',
                    type: 'whatsapp_business_management',
                    callCount: 1,
                    totalCputime: 1,
                    totalTime: 1,
                    estimatedTimeToRegainAccessMinutes: 0,
                },
                {
                    businessId: '102290129340398',
                    type: 'whatsapp',
                    callCount: 1,
                    totalCputime: 1,
                    totalTime: 1,
                    estimatedTimeToRegainAccessMinutes: 0,
                },
            ],
            maxUsagePercent: 1,
        });
    });

    it('derives the wait from estimated_time_to_regain_access (minutes) and Retry-After (seconds)', () => {
        expect(parseRateLimitHeaders({ 'X-Business-Use-Case-Usage': BUC_THROTTLED })).toMatchObject({
            maxUsagePercent: 100,
            retryDelayMs: 19 * 60_000,
        });
        expect(parseRateLimitHeaders({ 'retry-after': '60' })).toEqual({
            businessUseCaseUsage: [],
            retryAfterMs: 60_000,
            retryDelayMs: 60_000,
        });
        expect(
            parseRateLimitHeaders({ 'retry-after': '1200', 'x-business-use-case-usage': BUC_THROTTLED }),
        ).toMatchObject({ retryAfterMs: 1_200_000, retryDelayMs: 1_200_000 });
    });

    it('reads plain records case-insensitively and takes the first value of arrays', () => {
        expect(parseRateLimitHeaders({ 'X-App-Usage': [APP_USAGE_SAMPLE, 'ignored'] })?.appUsage).toEqual({
            callCount: 0,
            totalCputime: 0,
            totalTime: 0,
        });
    });

    it('ignores malformed JSON and unexpected shapes without throwing', () => {
        expect(parseRateLimitHeaders({ 'x-app-usage': '{not json', 'x-business-use-case-usage': '[1,2]' })).toEqual({
            businessUseCaseUsage: [],
        });
        expect(
            parseRateLimitHeaders({
                'x-business-use-case-usage': '{"1":"nope","2":[null,{"call_count":"bad","type":5}]}',
                'retry-after': 'soon',
            }),
        ).toEqual({ businessUseCaseUsage: [{ businessId: '2' }] });
    });

    it('returns undefined when no rate limit header is present', () => {
        expect(parseRateLimitHeaders(new Headers({ 'content-type': 'application/json' }))).toBeUndefined();
        expect(parseRateLimitHeaders({})).toBeUndefined();
        expect(parseRateLimitHeaders(undefined)).toBeUndefined();
    });
});

describe('parseRetryAfter', () => {
    it('parses delta-seconds and HTTP-dates', () => {
        const now = Date.parse('2026-10-02T00:00:00Z');
        expect(parseRetryAfter('5')).toBe(5000);
        expect(parseRetryAfter('Fri, 02 Oct 2026 00:00:30 GMT', now)).toBe(30_000);
        expect(parseRetryAfter('Thu, 01 Oct 2026 00:00:00 GMT', now)).toBe(0);
        expect(parseRetryAfter('-1')).toBeUndefined();
        expect(parseRetryAfter('')).toBeUndefined();
        expect(parseRetryAfter(null)).toBeUndefined();
    });
});

function throttledResponse(headers: Record<string, string>) {
    return new HttpsClientResponse(
        new Response(
            JSON.stringify({
                error: { message: 'Rate limit hit', type: 'OAuthException', code: 80007, fbtrace_id: 'trace' },
            }),
            { status: 429, headers },
        ),
    );
}

function okResponse(headers: Record<string, string> = {}) {
    return new HttpsClientResponse(new Response('{"success":true}', { status: 200, headers }));
}

describe('Requester — rate limit info and server-provided retry delay', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('exposes the last rate limit info and calls onRateLimitInfo for every response', async () => {
        const listener = vi.fn();
        const requester = new Requester('23', 1, 'token', 'biz', 'ua', undefined, listener);
        vi.spyOn(requester.client, 'sendRequest').mockResolvedValue(
            okResponse({ 'x-business-use-case-usage': BUC_SAMPLE }) as never,
        );

        expect(requester.getLastRateLimitInfo()).toBeUndefined();
        await requester.sendRequest(HttpMethodsEnum.Get, 'me', 5000);

        expect(requester.getLastRateLimitInfo()?.businessUseCaseUsage).toHaveLength(2);
        expect(listener).toHaveBeenCalledWith(requester.getLastRateLimitInfo(), {
            method: 'GET',
            endpoint: 'me',
            statusCode: 200,
        });
    });

    it('ignores a throwing listener and responses without rate limit headers', async () => {
        const requester = new Requester('23', 1, 'token', 'biz', 'ua', undefined, () => {
            throw new Error('boom');
        });
        const spy = vi.spyOn(requester.client, 'sendRequest');
        spy.mockResolvedValueOnce(okResponse({ 'x-app-usage': APP_USAGE_SAMPLE }) as never);
        spy.mockResolvedValueOnce(okResponse() as never);

        await expect(requester.sendRequest(HttpMethodsEnum.Get, 'me', 5000)).resolves.toBeDefined();
        await requester.sendRequest(HttpMethodsEnum.Get, 'me', 5000);
        expect(requester.getLastRateLimitInfo()?.appUsage).toEqual({ callCount: 0, totalCputime: 0, totalTime: 0 });
    });

    it('consumes rejected async telemetry without blocking successful requests', async () => {
        let rejectListener!: (reason: Error) => void;
        const telemetry = new Promise<void>((_resolve, reject) => {
            rejectListener = reject;
        });
        const requester = new Requester('23', 1, 'token', 'biz', 'ua', undefined, () => telemetry);
        vi.spyOn(requester.client, 'sendRequest').mockResolvedValue(
            okResponse({ 'x-app-usage': APP_USAGE_SAMPLE }) as never,
        );

        await expect(requester.sendRequest(HttpMethodsEnum.Get, 'me', 5000)).resolves.toBeDefined();
        rejectListener(new Error('telemetry unavailable'));
        await vi.advanceTimersByTimeAsync(0);
    });

    it('waits Retry-After instead of the shorter backoff before retrying', async () => {
        const requester = new Requester('23', 1, 'token', 'biz', 'ua', { maxAttempts: 2, initialDelayMs: 100 });
        const spy = vi.spyOn(requester.client, 'sendRequest');
        spy.mockResolvedValueOnce(throttledResponse({ 'retry-after': '5' }) as never);
        spy.mockResolvedValueOnce(okResponse() as never);

        const promise = requester.sendRequest(HttpMethodsEnum.Post, 'msgs', 5000, '{}');
        await vi.advanceTimersByTimeAsync(4999);
        expect(spy).toHaveBeenCalledTimes(1);
        await vi.advanceTimersByTimeAsync(1);
        await promise;
        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('caps estimated_time_to_regain_access at maxServerDelayMs', async () => {
        const requester = new Requester('23', 1, 'token', 'biz', 'ua', {
            maxAttempts: 2,
            initialDelayMs: 100,
            maxServerDelayMs: 2000,
        });
        const spy = vi.spyOn(requester.client, 'sendRequest');
        spy.mockResolvedValueOnce(throttledResponse({ 'x-business-use-case-usage': BUC_THROTTLED }) as never);
        spy.mockResolvedValueOnce(okResponse() as never);

        const promise = requester.sendRequest(HttpMethodsEnum.Get, 'waba', 5000);
        await vi.advanceTimersByTimeAsync(1999);
        expect(spy).toHaveBeenCalledTimes(1);
        await vi.advanceTimersByTimeAsync(1);
        await promise;
        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('defaults the cap to 30 seconds', async () => {
        const requester = new Requester('23', 1, 'token', 'biz', 'ua', { maxAttempts: 2, initialDelayMs: 100 });
        const spy = vi.spyOn(requester.client, 'sendRequest');
        spy.mockResolvedValueOnce(throttledResponse({ 'x-business-use-case-usage': BUC_THROTTLED }) as never);
        spy.mockResolvedValueOnce(okResponse() as never);

        const promise = requester.sendRequest(HttpMethodsEnum.Get, 'waba', 5000);
        await vi.advanceTimersByTimeAsync(29_999);
        expect(spy).toHaveBeenCalledTimes(1);
        await vi.advanceTimersByTimeAsync(1);
        await promise;
        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('keeps the backoff delay when it is longer than the server delay', async () => {
        const requester = new Requester('23', 1, 'token', 'biz', 'ua', { maxAttempts: 2, initialDelayMs: 3000 });
        const spy = vi.spyOn(requester.client, 'sendRequest');
        spy.mockResolvedValueOnce(throttledResponse({ 'retry-after': '1' }) as never);
        spy.mockResolvedValueOnce(okResponse() as never);

        const promise = requester.sendRequest(HttpMethodsEnum.Get, 'waba', 5000);
        await vi.advanceTimersByTimeAsync(2999);
        expect(spy).toHaveBeenCalledTimes(1);
        await vi.advanceTimersByTimeAsync(1);
        await promise;
        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('ignores server delays when respectServerDelay is false', async () => {
        const requester = new Requester('23', 1, 'token', 'biz', 'ua', {
            maxAttempts: 2,
            initialDelayMs: 100,
            respectServerDelay: false,
        });
        const spy = vi.spyOn(requester.client, 'sendRequest');
        spy.mockResolvedValueOnce(throttledResponse({ 'retry-after': '60' }) as never);
        spy.mockResolvedValueOnce(okResponse() as never);

        const promise = requester.sendRequest(HttpMethodsEnum.Get, 'waba', 5000);
        await vi.advanceTimersByTimeAsync(100);
        await promise;
        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('attaches rate limit info to the thrown error and never adds attempts', async () => {
        const requester = new Requester('23', 1, 'token', 'biz', 'ua', { maxAttempts: 2, initialDelayMs: 10 });
        const spy = vi
            .spyOn(requester.client, 'sendRequest')
            .mockImplementation(async () => throttledResponse({ 'retry-after': '2' }) as never);

        const promise = requester.sendRequest(HttpMethodsEnum.Get, 'waba', 5000);
        const assertion = expect(promise).rejects.toSatisfy(
            (error: unknown) => error instanceof WhatsAppThrottlingError && error.rateLimit?.retryAfterMs === 2000,
        );
        await vi.advanceTimersByTimeAsync(2000);
        await assertion;
        expect(spy).toHaveBeenCalledTimes(2);
    });
});
