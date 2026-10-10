// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/overview/
import { bytesToHex } from '../utils/runtime';
import { randomDigits, randomWamid } from './random';
import {
    CategoryEnum,
    LanguagesEnum,
    type MediaResponse,
    type MessagesResponse,
    type MetaErrorData,
    type ResponsePagination,
    type TemplateResponse,
    type UploadMediaResponse,
} from './sdk';

const GRAPH_HOST = 'graph.facebook.com';
const MEDIA_HOST = 'lookaside.fbsbx.com';

export type MockHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** A request the mock intercepted. */
export interface RecordedRequest {
    method: string;
    /** Full request URL. */
    url: string;
    host: string;
    /** Path without the API version, e.g. `/1234567890/messages`. */
    path: string;
    /** API version from the URL, e.g. `v23.0`, when present. */
    apiVersion: string | undefined;
    /** Query string parameters (the last value wins for repeated keys). */
    query: Record<string, string>;
    /** Request headers with lower-cased names. */
    headers: Record<string, string>;
    /** How the body was encoded. */
    bodyType: 'none' | 'json' | 'form' | 'multipart' | 'text';
    /**
     * Parsed body: the JSON value, an object of URL-encoded or multipart fields
     * (multipart files stay `File`/`Blob`), the raw text, or `undefined`.
     */
    body: unknown;
}

/** What a route handler receives: the recorded request plus the `:params` it matched. */
export interface MockRouteRequest extends RecordedRequest {
    params: Record<string, string>;
}

/**
 * A route handler returns a `Response`, any JSON-serializable value (sent with
 * status 200), or `undefined` to fall through to the next matching route and
 * finally to the built-in default.
 */
export type MockRouteHandler = (request: MockRouteRequest) => unknown;

export interface MockRouteOptions {
    /** Answer only this many requests, then step aside. Defaults to unlimited. */
    times?: number;
}

/** An error in Meta's shape. Only `code` is required. */
export type MetaErrorInit = Partial<MetaErrorData> &
    Pick<MetaErrorData, 'code'> & {
        error_user_title?: string;
        error_user_msg?: string;
    };

/** A message payload the SDK sent to `POST /{PHONE_NUMBER_ID}/messages`. */
export interface SentMessage {
    messaging_product: 'whatsapp';
    to: string;
    type: string;
    recipient_type?: string;
    context?: { message_id: string };
    [field: string]: unknown;
}

/** A file uploaded to the mock with `media.uploadMedia()`. */
export interface MockMedia {
    id: string;
    mimeType: string;
    fileSize: number;
    sha256: string;
    bytes: Uint8Array;
}

export interface MockCloudApiOptions {
    /** Templates returned by `GET /{WABA_ID}/message_templates`. Defaults to one approved `hello_world`. */
    templates?: TemplateResponse[];
    /**
     * fetch used for requests that are not for the Graph API (and the one
     * {@link MockCloudApi.restore} puts back). Defaults to `globalThis.fetch`.
     */
    fetch?: typeof fetch;
    /**
     * What to do with a Graph API request no route or default answers:
     * `'error'` (default) replies with a Meta error so the SDK throws,
     * `'success'` replies `{ "success": true }`.
     */
    unhandled?: 'error' | 'success';
}

const DEFAULT_TEMPLATES: TemplateResponse[] = [
    {
        id: '100000000000010',
        name: 'hello_world',
        status: 'APPROVED',
        language: LanguagesEnum.English_US,
        category: CategoryEnum.Utility,
        components: [],
    },
];

/** Status Meta uses for an error code when none is given. */
function defaultStatusFor(code: number): number {
    if ([0, 3, 10, 190].includes(code)) return 401;
    if ([4, 80007, 130429, 131048, 131056].includes(code)) return 429;
    return 400;
}

/**
 * Build a Graph API error response in Meta's shape
 * (`{ "error": { message, type, code, error_subcode?, error_data?, fbtrace_id } }`).
 * The status defaults to 401 for auth errors, 429 for rate limits and 400 otherwise.
 */
export function createMetaErrorResponse(error: MetaErrorInit, status: number = defaultStatusFor(error.code)): Response {
    const body = {
        error: {
            message: error.message ?? `(#${error.code}) Mock error`,
            type: error.type ?? 'OAuthException',
            ...error,
            fbtrace_id: error.fbtrace_id ?? `mock-${randomDigits(8)}`,
        },
    };
    return jsonResponse(body, status);
}

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

interface Route {
    method: string;
    pattern: string | RegExp;
    handler: MockRouteHandler;
    remaining: number;
}

function matchPath(pattern: string | RegExp, path: string): Record<string, string> | undefined {
    if (pattern instanceof RegExp) {
        const match = new RegExp(pattern.source, pattern.flags).exec(path);
        return match ? { ...match.groups } : undefined;
    }
    const want = pattern.replace(/^\/+|\/+$/g, '').split('/');
    const got = path.replace(/^\/+|\/+$/g, '').split('/');
    if (want.length !== got.length) return undefined;
    const params: Record<string, string> = {};
    for (let i = 0; i < want.length; i++) {
        const w = want[i] ?? '';
        const g = got[i] ?? '';
        if (w.startsWith(':')) params[w.slice(1)] = decodeURIComponent(g);
        else if (w !== '*' && w !== g) return undefined;
    }
    return params;
}

function formToObject(form: FormData): Record<string, FormDataEntryValue | FormDataEntryValue[]> {
    const out: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};
    form.forEach((value, key) => {
        const existing = out[key];
        if (existing === undefined) out[key] = value;
        else out[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    });
    return out;
}

function paramsToObject(params: URLSearchParams): Record<string, string | string[]> {
    const out: Record<string, string | string[]> = {};
    params.forEach((value, key) => {
        const existing = out[key];
        if (existing === undefined) out[key] = value;
        else out[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    });
    return out;
}

async function readBody(
    request: Request,
    init: RequestInit | undefined,
): Promise<Pick<RecordedRequest, 'body' | 'bodyType'>> {
    // The SDK hands fetch a FormData for uploads; read it directly.
    const raw = init?.body;
    if (raw instanceof FormData) return { bodyType: 'multipart', body: formToObject(raw) };
    if (raw instanceof URLSearchParams) return { bodyType: 'form', body: paramsToObject(raw) };
    if (request.body === null) return { bodyType: 'none', body: undefined };

    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('multipart/form-data')) {
        return { bodyType: 'multipart', body: formToObject(await request.formData()) };
    }
    const text = await request.text();
    if (contentType.includes('application/x-www-form-urlencoded')) {
        return { bodyType: 'form', body: paramsToObject(new URLSearchParams(text)) };
    }
    if (text === '') return { bodyType: 'none', body: undefined };
    try {
        return { bodyType: 'json', body: JSON.parse(text) };
    } catch {
        return { bodyType: 'text', body: text };
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSentMessage(request: RecordedRequest): boolean {
    return (
        request.method === 'POST' &&
        /^\/[^/]+\/(messages|marketing_messages)$/.test(request.path) &&
        isRecord(request.body) &&
        typeof request.body.to === 'string' &&
        request.body.status === undefined
    );
}

/**
 * An in-memory Graph API. Install it on `globalThis.fetch` (the SDK uses the
 * global fetch) or hand {@link MockCloudApi.fetch} to code that accepts one.
 * Every Graph API request is recorded; non-Graph requests pass through.
 */
export class MockCloudApi {
    /** Every Graph API request, oldest first. */
    readonly requests: RecordedRequest[] = [];
    /** Files uploaded through `POST /{PHONE_NUMBER_ID}/media`, by media ID. */
    readonly media = new Map<string, MockMedia>();
    /** Templates served by `GET /{WABA_ID}/message_templates`. */
    templates: TemplateResponse[];

    private routes: Route[] = [];
    private readonly passthrough: typeof fetch;
    private readonly unhandled: 'error' | 'success';
    private previousFetch: typeof fetch | undefined;

    constructor(options: MockCloudApiOptions = {}) {
        const base = options.fetch ?? globalThis.fetch;
        this.passthrough = (input, init) => base(input, init);
        this.templates = structuredClone(options.templates ?? DEFAULT_TEMPLATES);
        this.unhandled = options.unhandled ?? 'error';
    }

    /** A fetch that answers Graph API requests from this mock. */
    readonly fetch: typeof fetch = async (input, init) => {
        const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
        if (url.host !== GRAPH_HOST && url.host !== MEDIA_HOST) return this.passthrough(input, init);
        const request = new Request(input, init);

        const versionMatch = /^\/(v\d+(?:\.\d+)?)(\/.*)?$/.exec(url.pathname);
        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
            headers[key] = value;
        });
        const recorded: RecordedRequest = {
            method: request.method.toUpperCase(),
            url: request.url,
            host: url.host,
            path: versionMatch ? versionMatch[2] || '/' : url.pathname,
            apiVersion: versionMatch?.[1],
            query: Object.fromEntries(url.searchParams),
            headers,
            ...(await readBody(request, init)),
        };
        this.requests.push(recorded);
        return this.respond(recorded);
    };

    /** Replace `globalThis.fetch` with {@link MockCloudApi.fetch}. Returns the mock for chaining. */
    install(): this {
        if (this.previousFetch === undefined) {
            this.previousFetch = globalThis.fetch;
            globalThis.fetch = this.fetch;
        }
        return this;
    }

    /** Put back the `globalThis.fetch` that {@link MockCloudApi.install} replaced. */
    restore(): void {
        if (this.previousFetch !== undefined) {
            globalThis.fetch = this.previousFetch;
            this.previousFetch = undefined;
        }
    }

    /**
     * Answer matching requests with `handler`. `path` is matched without the API
     * version: `'/:phoneNumberId/messages'` (`:name` captures a segment, `*` matches
     * any one) or a RegExp (named groups become params). `method` may be `'*'`.
     * Later routes win. Returns a function that removes the route.
     */
    on(
        method: MockHttpMethod | '*',
        path: string | RegExp,
        handler: MockRouteHandler,
        options: MockRouteOptions = {},
    ): () => void {
        const route: Route = { method, pattern: path, handler, remaining: options.times ?? Number.POSITIVE_INFINITY };
        this.routes.unshift(route);
        return () => {
            this.routes = this.routes.filter((r) => r !== route);
        };
    }

    /**
     * Reply to matching requests with a Meta error, so the SDK throws the
     * matching `WhatsAppError` subclass (e.g. code 190 → `WhatsAppAuthorizationError`).
     */
    fail(
        method: MockHttpMethod | '*',
        path: string | RegExp,
        error: MetaErrorInit,
        options: MockRouteOptions & { status?: number } = {},
    ): () => void {
        return this.on(method, path, () => createMetaErrorResponse(error, options.status), options);
    }

    /** Requests matching `method` and `path` (same matching rules as {@link MockCloudApi.on}). */
    requestsTo(method: MockHttpMethod | '*', path: string | RegExp): RecordedRequest[] {
        return this.requests.filter(
            (r) => (method === '*' || r.method === method) && matchPath(path, r.path) !== undefined,
        );
    }

    /**
     * Message payloads sent to `POST /{PHONE_NUMBER_ID}/messages` (and
     * `/marketing_messages`), oldest first. Read receipts and typing indicators
     * are left out. Pass a type such as `'text'` to filter.
     */
    sentMessages(type?: string): SentMessage[] {
        return this.requests
            .filter(isSentMessage)
            .map((r) => r.body as SentMessage)
            .filter((message) => type === undefined || message.type === type);
    }

    /** The most recent {@link MockCloudApi.sentMessages} entry. */
    lastSentMessage(type?: string): SentMessage | undefined {
        return this.sentMessages(type).at(-1);
    }

    /** Forget recorded requests and uploaded media; keep routes. */
    clearRequests(): void {
        this.requests.length = 0;
        this.media.clear();
    }

    /** Forget recorded requests, uploaded media and custom routes. */
    reset(): void {
        this.clearRequests();
        this.routes = [];
    }

    private async respond(request: RecordedRequest): Promise<Response> {
        for (const route of [...this.routes]) {
            if (route.remaining <= 0) continue;
            if (route.method !== '*' && route.method !== request.method) continue;
            const params = matchPath(route.pattern, request.path);
            if (!params) continue;
            // Reserve before awaiting so concurrent requests respect `times`.
            route.remaining--;
            let reply: unknown;
            try {
                reply = await route.handler({ ...request, params });
            } catch (error) {
                route.remaining++;
                throw error;
            }
            if (reply === undefined) {
                route.remaining++;
                continue;
            }
            return reply instanceof Response ? reply : jsonResponse(reply);
        }
        return this.defaultResponse(request);
    }

    private async defaultResponse(request: RecordedRequest): Promise<Response> {
        const { method, path, host } = request;
        const segments = path.replace(/^\/+|\/+$/g, '').split('/');

        if (host === MEDIA_HOST) {
            const media = this.media.get(request.query.mid ?? '');
            return new Response(media ? new Uint8Array(media.bytes) : 'mock media', {
                headers: { 'content-type': media?.mimeType ?? 'application/octet-stream' },
            });
        }

        if (method === 'POST' && segments.length === 2 && /^(messages|marketing_messages)$/.test(segments[1] ?? '')) {
            const body = isRecord(request.body) ? request.body : {};
            if (body.status === 'read') return jsonResponse({ success: true });
            const to = typeof body.to === 'string' ? body.to : '';
            const response: MessagesResponse = {
                messaging_product: 'whatsapp',
                contacts: [{ input: to, wa_id: to.replace(/\D/g, '') || to }],
                messages: [{ id: randomWamid(), ...(body.type === 'template' && { message_status: 'accepted' }) }],
            };
            return jsonResponse(response);
        }

        if (method === 'POST' && segments.length === 2 && segments[1] === 'media') {
            const body = isRecord(request.body) ? request.body : {};
            const file = body.file;
            const id = randomDigits(16);
            const bytes = file instanceof Blob ? new Uint8Array(await file.arrayBuffer()) : new Uint8Array();
            const digest = new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', bytes));
            this.media.set(id, {
                id,
                mimeType: (typeof body.type === 'string' && body.type) || (file instanceof Blob && file.type) || '',
                fileSize: bytes.byteLength,
                sha256: bytesToHex(digest),
                bytes,
            });
            const response: UploadMediaResponse = { id };
            return jsonResponse(response);
        }

        if (segments.length === 2 && segments[1] === 'message_templates') {
            if (method === 'GET') {
                const { name, status, language, category } = request.query;
                const data = this.templates.filter(
                    (t) =>
                        (!name || t.name === name) &&
                        (!status || t.status === status) &&
                        (!language || t.language === language) &&
                        (!category || t.category === category),
                );
                const limit = Number(request.query.limit) || data.length;
                const response: ResponsePagination<TemplateResponse> = {
                    data: data.slice(0, limit),
                    paging: { cursors: { before: 'MAZDZD', after: 'MjQZD' }, next: '' },
                };
                return jsonResponse(response);
            }
            if (method === 'POST') {
                const body = isRecord(request.body) ? request.body : {};
                return jsonResponse({ id: randomDigits(15), status: 'PENDING', category: body.category ?? 'UTILITY' });
            }
            if (method === 'DELETE') return jsonResponse({ success: true });
        }

        if (segments.length === 1 && segments[0]) {
            const id = segments[0];
            if (method === 'DELETE') {
                this.media.delete(id);
                return jsonResponse({ success: true });
            }
            if (method === 'GET') {
                const media = this.media.get(id);
                const response: MediaResponse = {
                    messaging_product: 'whatsapp',
                    id,
                    url: `https://${MEDIA_HOST}/whatsapp_business/attachments/?mid=${id}`,
                    mime_type: media?.mimeType || 'image/jpeg',
                    sha256: media?.sha256 ?? '0'.repeat(64),
                    file_size: media?.fileSize ?? 0,
                };
                return jsonResponse(response);
            }
        }

        if (this.unhandled === 'success') return jsonResponse({ success: true });
        return createMetaErrorResponse(
            {
                code: 100,
                type: 'GraphMethodException',
                message: `meta-cloud-api/testing: no mock route for ${method} ${path}. Add one with mock.on('${method}', '${path}', handler).`,
            },
            400,
        );
    }
}

/**
 * Create an in-memory Graph API for tests. Call `.install()` to route the SDK's
 * requests to it and `.restore()` afterwards.
 *
 * ```ts
 * const mock = createMockCloudApi().install();
 * await new WhatsApp({ accessToken: 'test', phoneNumberId: 1 }).messages.text({ to: '15551234567', body: 'hi' });
 * mock.sentMessages(); // [{ messaging_product: 'whatsapp', to: '15551234567', type: 'text', text: { body: 'hi' }, ... }]
 * mock.restore();
 * ```
 */
export function createMockCloudApi(options?: MockCloudApiOptions): MockCloudApi {
    return new MockCloudApi(options);
}
