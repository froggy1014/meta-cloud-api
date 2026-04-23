import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpMethodsEnum } from '../../types/enums';
import Requester from '../http/request';
import { WhatsAppNetworkError, WhatsAppThrottlingError } from '../isMetaError';

function makeThrottlingError(): WhatsAppThrottlingError {
    return new WhatsAppThrottlingError(
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
