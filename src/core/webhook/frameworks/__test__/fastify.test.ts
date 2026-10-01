import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { type FastifyWebhookConfig, type FastifyWebhookHandlers, fastifyWebhookHandler } from '../fastify';
import {
    baseConfig,
    compactBody,
    createEncryptedFlowPing,
    prettyBody,
    signatureHeader,
    VERIFY_TOKEN,
    verifyQuery,
} from './adapter-fixtures';

const handlers: FastifyWebhookHandlers[] = [];
const apps: FastifyInstance[] = [];

/** The documented way to keep the raw body: a JSON content-type parser that stores it. */
function keepRawBody(app: FastifyInstance) {
    app.addContentTypeParser('application/json', { parseAs: 'string' }, (request, body, done) => {
        (request as typeof request & { rawBody?: string }).rawBody = body as string;
        try {
            done(null, JSON.parse(body as string));
        } catch (error) {
            done(error as Error, undefined);
        }
    });
}

function setup(config: Partial<FastifyWebhookConfig> = {}, options: { rawBody?: boolean } = {}) {
    const wa = fastifyWebhookHandler({ ...baseConfig, ...config });
    handlers.push(wa);
    const received: string[] = [];
    wa.processor.onText((_whatsapp, processed) => {
        received.push(processed.message.text.body);
    });

    const app = Fastify();
    apps.push(app);
    if (options.rawBody !== false) keepRawBody(app);
    app.get('/webhook', wa.GET);
    app.post('/webhook', wa.POST);
    app.route({ method: ['GET', 'POST', 'PUT'], url: '/auto', handler: wa.webhook });
    app.post('/flow', wa.flow);
    return { wa, app, received };
}

const post = (url: string, body: string, headers: Record<string, string> = {}) => ({
    method: 'POST' as const,
    url,
    payload: body,
    headers: { 'content-type': 'application/json', ...headers },
});

afterEach(async () => {
    for (const wa of handlers.splice(0)) wa.destroy();
    await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe('fastifyWebhookHandler with a real Fastify app', () => {
    describe('GET verification', () => {
        it('returns the challenge for a valid token', async () => {
            const { app } = setup();
            const res = await app.inject({ method: 'GET', url: `/webhook?${verifyQuery(VERIFY_TOKEN)}` });
            expect(res.statusCode).toBe(200);
            expect(res.body).toBe('challenge-123');
            expect(res.headers['content-type']).toContain('text/plain');
        });

        it('returns 403 for a wrong token', async () => {
            const { app } = setup();
            const res = await app.inject({ method: 'GET', url: `/webhook?${verifyQuery('wrong')}` });
            expect(res.statusCode).toBe(403);
        });
    });

    describe('POST webhook', () => {
        it('dispatches a text message to onText', async () => {
            const { app, received } = setup();
            const res = await app.inject(post('/webhook', compactBody));
            expect(res.statusCode).toBe(200);
            expect(received).toEqual(['hi']);
        });

        it('dispatches with the default JSON parser (no raw body)', async () => {
            const { app, received } = setup({}, { rawBody: false });
            const res = await app.inject(post('/webhook', prettyBody));
            expect(res.statusCode).toBe(200);
            expect(received).toEqual(['hi']);
        });
    });

    describe('signature verification', () => {
        it('accepts a valid signature over the raw body and runs the handler', async () => {
            const { app, received } = setup({ verifyWebhookSignature: true });
            const res = await app.inject(
                post('/webhook', prettyBody, { 'x-hub-signature-256': await signatureHeader(prettyBody) }),
            );
            expect(res.statusCode).toBe(200);
            expect(received).toEqual(['hi']);
        });

        it('rejects an invalid signature with 401', async () => {
            const { app, received } = setup({ verifyWebhookSignature: true });
            const res = await app.inject(
                post('/webhook', prettyBody, { 'x-hub-signature-256': await signatureHeader(prettyBody, 'wrong') }),
            );
            expect(res.statusCode).toBe(401);
            expect(received).toEqual([]);
        });

        it('without a raw body, falls back to JSON.stringify(body), which only matches compact JSON', async () => {
            const { app, received } = setup({ verifyWebhookSignature: true }, { rawBody: false });

            // Meta's bytes differ from the re-serialized body: the valid signature is rejected.
            const pretty = await app.inject(
                post('/webhook', prettyBody, { 'x-hub-signature-256': await signatureHeader(prettyBody) }),
            );
            expect(pretty.statusCode).toBe(401);

            // Compact JSON happens to round-trip, so it passes.
            const compact = await app.inject(
                post('/webhook', compactBody, { 'x-hub-signature-256': await signatureHeader(compactBody) }),
            );
            expect(compact.statusCode).toBe(200);
            expect(received).toEqual(['hi']);
        });

        it('accepts a Buffer raw body (fastify-raw-body style)', async () => {
            const wa = fastifyWebhookHandler({ ...baseConfig, verifyWebhookSignature: true });
            handlers.push(wa);
            const received: string[] = [];
            wa.processor.onText((_whatsapp, processed) => {
                received.push(processed.message.text.body);
            });
            const app = Fastify();
            apps.push(app);
            app.addContentTypeParser('application/json', { parseAs: 'buffer' }, (request, body, done) => {
                (request as typeof request & { rawBody?: Buffer }).rawBody = body as Buffer;
                done(null, JSON.parse((body as Buffer).toString('utf8')));
            });
            app.post('/webhook', wa.POST);
            const res = await app.inject(
                post('/webhook', prettyBody, { 'x-hub-signature-256': await signatureHeader(prettyBody) }),
            );
            expect(res.statusCode).toBe(200);
            expect(received).toEqual(['hi']);
        });
    });

    describe('auto-routing webhook', () => {
        it('routes GET and POST and rejects other methods with 405', async () => {
            const { app, received } = setup();
            expect((await app.inject({ method: 'GET', url: `/auto?${verifyQuery(VERIFY_TOKEN)}` })).statusCode).toBe(
                200,
            );
            expect((await app.inject(post('/auto', compactBody))).statusCode).toBe(200);
            expect(received).toEqual(['hi']);
            expect((await app.inject({ method: 'PUT', url: '/auto' })).statusCode).toBe(405);
        });
    });

    describe('flow route', () => {
        it('decrypts a signed Flow ping and encrypts the response', async () => {
            const flow = await createEncryptedFlowPing();
            const { app } = setup({ privatePem: flow.privatePem });
            const res = await app.inject(
                post('/flow', flow.body, { 'x-hub-signature-256': await signatureHeader(flow.body) }),
            );
            expect(res.statusCode).toBe(200);
            expect(await flow.decryptResponse(res.body)).toEqual({ data: { status: 'active' }, version: '3.0' });
        });

        it('rejects an unsigned Flow request with 401', async () => {
            const flow = await createEncryptedFlowPing();
            const { app } = setup({ privatePem: flow.privatePem });
            const res = await app.inject(post('/flow', flow.body));
            expect(res.statusCode).toBe(401);
        });
    });

    describe('errors', () => {
        it('returns 500 when the processor throws', async () => {
            const { wa, app } = setup();
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
            vi.spyOn(wa.processor, 'processWebhook').mockRejectedValueOnce(new Error('boom'));
            const res = await app.inject(post('/webhook', compactBody));
            expect(res.statusCode).toBe(500);
            spy.mockRestore();
        });
    });

    describe('singleton cache', () => {
        it('returns the same instance for the same phoneNumberId', () => {
            const { wa } = setup();
            expect(fastifyWebhookHandler(baseConfig)).toBe(wa);
        });

        it('returns a different instance for a different phoneNumberId', () => {
            const { wa } = setup();
            const other = fastifyWebhookHandler({ ...baseConfig, phoneNumberId: 999 });
            handlers.push(other);
            expect(other).not.toBe(wa);
        });

        it('destroy() removes handlers and evicts the cache entry', async () => {
            const { wa, app, received } = setup();
            const removeAllHandlers = vi.spyOn(wa.processor, 'removeAllHandlers');
            wa.destroy();
            expect(removeAllHandlers).toHaveBeenCalled();
            await app.inject(post('/webhook', compactBody));
            expect(received).toEqual([]);
            const fresh = fastifyWebhookHandler(baseConfig);
            handlers.push(fresh);
            expect(fresh).not.toBe(wa);
        });
    });
});
