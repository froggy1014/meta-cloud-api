import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpMethodsEnum } from '../../types/enums';
import HttpsClient from '../http/httpsClient';
import Requester from '../http/request';

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

describe('custom fetch', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('routes requests through the fetch passed to the requester', async () => {
        const globalFetch = vi.fn(async () => jsonResponse({ from: 'global' }));
        vi.stubGlobal('fetch', globalFetch);
        const customFetch = vi.fn(async () => jsonResponse({ from: 'custom' }));

        const requester = new Requester(
            'v23.0',
            123,
            'token',
            'biz',
            'agent',
            undefined,
            undefined,
            customFetch as unknown as typeof fetch,
        );
        const result = await requester.getJson<{ from: string }>(HttpMethodsEnum.Get, 'me', 5000);

        expect(result).toEqual({ from: 'custom' });
        expect(globalFetch).not.toHaveBeenCalled();
        expect(customFetch).toHaveBeenCalledTimes(1);
        const [url, init] = customFetch.mock.calls[0] as unknown as [string, RequestInit];
        expect(url).toBe('https://graph.facebook.com/v23.0/me');
        expect(init.method).toBe('GET');
        expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token');
        expect(init.signal).toBeInstanceOf(AbortSignal);
    });

    it('resolves the global fetch at call time when none is passed', async () => {
        const client = new HttpsClient();
        const first = vi.fn(async () => jsonResponse({ n: 1 }));
        const second = vi.fn(async () => jsonResponse({ n: 2 }));

        vi.stubGlobal('fetch', first);
        await client.sendRequest('graph.facebook.com', 'v23.0/me', HttpMethodsEnum.Get, {}, 5000);
        vi.stubGlobal('fetch', second);
        await client.sendRequest('graph.facebook.com', 'v23.0/me', HttpMethodsEnum.Get, {}, 5000);

        expect(first).toHaveBeenCalledTimes(1);
        expect(second).toHaveBeenCalledTimes(1);
    });

    it('surfaces errors thrown by the custom fetch as network errors', async () => {
        const customFetch = vi.fn(async () => {
            throw new Error('proxy refused');
        });
        const requester = new Requester(
            'v23.0',
            123,
            'token',
            'biz',
            'agent',
            undefined,
            undefined,
            customFetch as unknown as typeof fetch,
        );

        await expect(requester.getJson(HttpMethodsEnum.Get, 'me', 5000)).rejects.toMatchObject({
            name: 'WhatsAppNetworkError',
            message: 'proxy refused',
        });
    });
});
