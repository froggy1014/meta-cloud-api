import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RequestHookContext, ResponseHookContext } from '../../types/config';
import { HttpMethodsEnum } from '../../types/enums';
import Requester from '../http/request';

function makeRequester(hooks: { onRequest?: any; onResponse?: any }, fetchImpl: typeof fetch) {
    return new Requester(
        'v23.0',
        123,
        'secret-token',
        'biz',
        'agent',
        { maxAttempts: 2, initialDelayMs: 1 },
        undefined,
        fetchImpl,
        hooks,
    );
}

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json', ...headers },
    });
}

describe('request hooks', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('calls onRequest before sending with redacted headers and the body', async () => {
        const order: string[] = [];
        const fetchImpl = vi.fn(async () => {
            order.push('fetch');
            return jsonResponse({ ok: true });
        });
        const onRequest = vi.fn(async (_ctx: RequestHookContext) => {
            order.push('onRequest');
        });

        const requester = makeRequester({ onRequest }, fetchImpl as unknown as typeof fetch);
        await requester.getJson(HttpMethodsEnum.Post, '123/messages', 5000, JSON.stringify({ to: '1' }));

        expect(order).toEqual(['onRequest', 'fetch']);
        expect(onRequest).toHaveBeenCalledTimes(1);
        const ctx = onRequest.mock.calls[0]?.[0] as RequestHookContext;
        expect(ctx).toMatchObject({
            method: 'POST',
            url: 'https://graph.facebook.com/v23.0/123/messages',
            body: '{"to":"1"}',
            attempt: 1,
        });
        expect(ctx.headers.Authorization).toBe('Bearer ***');
        expect(ctx.headers['Content-Type']).toBe('application/json');
        expect(JSON.stringify(ctx)).not.toContain('secret-token');
    });

    it('calls onResponse with status, headers and duration, also for error statuses', async () => {
        const fetchImpl = vi.fn(async () =>
            jsonResponse({ error: { message: 'bad', type: 'OAuthException', code: 100, fbtrace_id: 't' } }, 400, {
                'x-fb-trace-id': 'abc',
            }),
        );
        const onResponse = vi.fn(async (_ctx: ResponseHookContext) => {});

        const requester = makeRequester({ onResponse }, fetchImpl as unknown as typeof fetch);
        await expect(requester.getJson(HttpMethodsEnum.Get, 'me', 5000)).rejects.toMatchObject({
            name: 'WhatsAppApiError',
            message: 'bad',
        });

        expect(onResponse).toHaveBeenCalledTimes(1);
        const ctx = onResponse.mock.calls[0]?.[0] as ResponseHookContext;
        expect(ctx).toMatchObject({ method: 'GET', url: 'https://graph.facebook.com/v23.0/me', statusCode: 400 });
        expect(ctx.responseHeaders['x-fb-trace-id']).toBe('abc');
        expect(ctx.durationMs).toBeGreaterThanOrEqual(0);
        expect(ctx.headers.Authorization).toBe('Bearer ***');
    });

    it('reports the attempt number on retries', async () => {
        const fetchImpl = vi
            .fn()
            .mockResolvedValueOnce(
                jsonResponse(
                    { error: { message: 'slow', type: 'OAuthException', code: 130429, fbtrace_id: 't' } },
                    429,
                ),
            )
            .mockResolvedValueOnce(jsonResponse({ ok: true }));
        const onRequest = vi.fn();
        const onResponse = vi.fn();

        const requester = makeRequester({ onRequest, onResponse }, fetchImpl as unknown as typeof fetch);
        await requester.getJson(HttpMethodsEnum.Get, 'me', 5000);

        expect(onRequest.mock.calls.map((c) => c[0].attempt)).toEqual([1, 2]);
        expect(onResponse.mock.calls.map((c) => [c[0].attempt, c[0].statusCode])).toEqual([
            [1, 429],
            [2, 200],
        ]);
    });

    it('ignores errors thrown by hooks', async () => {
        const fetchImpl = vi.fn(async () => jsonResponse({ ok: true }));
        const onRequest = vi.fn(() => {
            throw new Error('hook boom');
        });
        const onResponse = vi.fn(async () => {
            throw new Error('async hook boom');
        });

        const requester = makeRequester({ onRequest, onResponse }, fetchImpl as unknown as typeof fetch);
        await expect(requester.getJson(HttpMethodsEnum.Get, 'me', 5000)).resolves.toEqual({ ok: true });
        expect(fetchImpl).toHaveBeenCalledTimes(1);
    });

    it('does not call onResponse when the request never gets a response', async () => {
        const fetchImpl = vi.fn(async () => {
            throw new Error('ECONNREFUSED');
        });
        const onRequest = vi.fn();
        const onResponse = vi.fn();

        const requester = makeRequester({ onRequest, onResponse }, fetchImpl as unknown as typeof fetch);
        await expect(requester.getJson(HttpMethodsEnum.Get, 'me', 5000)).rejects.toMatchObject({
            name: 'WhatsAppNetworkError',
        });
        expect(onRequest).toHaveBeenCalledTimes(1);
        expect(onResponse).not.toHaveBeenCalled();
    });
});
