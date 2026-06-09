import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpMethodsEnum } from '../../types/enums';
import Requester from '../http/request';
import { WhatsAppNetworkError, WhatsAppThrottlingError } from '../isMetaError';

function makeThrottlingError(): WhatsAppThrottlingError {
    return new WhatsAppThrottlingError(
        'Rate limit exceeded',
        { message: 'Rate limit exceeded', type: 'OAuthException', code: 130429, fbtrace_id: 'trace123' },
        429,
    );
}

function makeOkResponse() {
    return {
        rawResponse: () => ({ ok: true }),
        statusCode: () => 200,
        json: async () => ({ success: true }),
    };
}

describe('Requester — retry behavior', () => {
    let requester: Requester;

    beforeEach(() => {
        // Use 1ms delays so tests run fast without fake timers
        requester = new Requester('22', 123456789, 'test_token', 'biz_id', 'test-agent', {
            maxAttempts: 3,
            backoff: 'exponential',
            initialDelayMs: 1,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('succeeds on first attempt without retrying', async () => {
        const spy = vi.spyOn(requester.client, 'sendRequest').mockImplementation(async () => makeOkResponse() as any);

        await requester.sendRequest(HttpMethodsEnum.Get, 'test/endpoint', 5000);

        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('routes absolute media URLs without prefixing the Graph API version', async () => {
        const spy = vi.spyOn(requester.client, 'sendRequest').mockImplementation(async () => makeOkResponse() as any);

        await requester.sendRequest(HttpMethodsEnum.Get, 'https://lookaside.fbsbx.com/whatsapp/media?id=123', 5000);

        expect(spy).toHaveBeenCalledWith(
            'lookaside.fbsbx.com',
            'whatsapp/media?id=123',
            'GET',
            expect.any(Object),
            5000,
            undefined,
        );
    });

    it('normalizes Graph API versions when building paths', () => {
        expect(new Requester('23', 123456789, 'test_token', 'biz_id', 'test-agent').buildCAPIPath('me')).toBe(
            'v23.0/me',
        );
        expect(new Requester('23.0', 123456789, 'test_token', 'biz_id', 'test-agent').buildCAPIPath('me')).toBe(
            'v23.0/me',
        );
        expect(new Requester('v23', 123456789, 'test_token', 'biz_id', 'test-agent').buildCAPIPath('me')).toBe(
            'v23.0/me',
        );
        expect(new Requester('v23.0', 123456789, 'test_token', 'biz_id', 'test-agent').buildCAPIPath('me')).toBe(
            'v23.0/me',
        );
    });

    it('encodes repeated form fields for url-encoded array values', async () => {
        const spy = vi.spyOn(requester.client, 'sendRequest').mockImplementation(async () => makeOkResponse() as any);

        await requester.sendUrlEncodedForm(HttpMethodsEnum.Post, 'waba_123/assigned_users', 5000, {
            user: 'user_123',
            tasks: ['MANAGE', 'VIEW_INSIGHTS'],
        });

        expect(spy.mock.calls[0]?.[5]).toBe('user=user_123&tasks=MANAGE&tasks=VIEW_INSIGHTS');
    });

    it('retries on WhatsAppThrottlingError and succeeds on second attempt', async () => {
        let callCount = 0;
        const spy = vi.spyOn(requester.client, 'sendRequest').mockImplementation(async () => {
            callCount++;
            if (callCount === 1) throw makeThrottlingError();
            return makeOkResponse() as any;
        });

        await requester.sendRequest(HttpMethodsEnum.Post, 'test/endpoint', 5000, '{}');

        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('throws after exhausting all maxAttempts', async () => {
        const spy = vi.spyOn(requester.client, 'sendRequest').mockImplementation(async () => {
            throw makeThrottlingError();
        });

        await expect(requester.sendRequest(HttpMethodsEnum.Post, 'test/endpoint', 5000, '{}')).rejects.toBeInstanceOf(
            WhatsAppThrottlingError,
        );

        expect(spy).toHaveBeenCalledTimes(3); // maxAttempts = 3
    });

    it('does NOT retry on non-throttling errors', async () => {
        const spy = vi.spyOn(requester.client, 'sendRequest').mockImplementation(async () => {
            throw new WhatsAppNetworkError('Connection refused');
        });

        await expect(requester.sendRequest(HttpMethodsEnum.Get, 'test/endpoint', 5000)).rejects.toBeInstanceOf(
            WhatsAppNetworkError,
        );

        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('uses default maxAttempts=3 when no retryConfig provided', async () => {
        const defaultRequester = new Requester('22', 123456789, 'test_token', 'biz_id', 'test-agent');
        const spy = vi.spyOn(defaultRequester.client, 'sendRequest').mockImplementation(async () => {
            throw makeThrottlingError();
        });

        await expect(defaultRequester.sendRequest(HttpMethodsEnum.Get, 'test/endpoint', 5000)).rejects.toBeInstanceOf(
            WhatsAppThrottlingError,
        );

        expect(spy).toHaveBeenCalledTimes(3);
    });
});
