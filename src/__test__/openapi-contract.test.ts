// Docs: https://github.com/facebook/openapi (vendored at docs/reference/business-messaging-api_v23.0.yaml)

/**
 * OpenAPI contract test.
 *
 * Every public method of every API class composed on `WhatsApp` is invoked with
 * a recording requester. The (HTTP method, path) pairs it issues are matched
 * against the vendored Meta OpenAPI snapshot, so a typo'd edge, a wrong HTTP
 * method, or an endpoint that Meta does not document fails `pnpm test`.
 *
 * Path matching:
 * - Query strings are ignored; the `{Version}` prefix of spec paths is dropped.
 * - The configured phone number ID must land on a `{Phone-Number-ID}` segment and
 *   the configured WABA ID on a `{WABA-ID}` / `{WhatsApp-Business-Account-ID}`
 *   segment. Any other argument-supplied ID (`DUMMY_ID`) matches any `{Param}`.
 * - Literal segments must match exactly.
 *
 * Methods are discovered from the prototype chain, so new methods are covered
 * automatically. A method that throws for every heuristic argument set needs an
 * `ARG_OVERRIDES` entry; a helper that never issues a request must be listed in
 * `NON_REQUEST_METHODS`.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import * as apiModules from '../api';
import { WhatsApp } from '../core/whatsapp';
import { BaseAPI } from '../types/base';

const SPEC_PATH = fileURLToPath(new URL('../../docs/reference/business-messaging-api_v23.0.yaml', import.meta.url));

const PHONE_NUMBER_ID = 1110000001;
const WABA_ID = '2220000002';
/** Value used for every ID / string argument. Valid E.164 so phone-number validators accept it. */
const DUMMY_ID = '15550001111';
const MEDIA_URL = 'https://lookaside.fbsbx.com/whatsapp_business/attachments/?mid=1';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;

/**
 * SDK endpoints that are intentionally absent from the v23.0 snapshot.
 * Key: `<METHOD> <normalized path>` as printed by this test. Each entry must
 * still be called by the SDK and still be missing from the spec, otherwise the
 * stale-allowlist test fails and the entry has to be removed.
 */
const SPEC_ALLOWLIST: Record<string, string> = {
    // Payments (India) onboarding APIs are documented separately and not part of the snapshot.
    'GET {ID}/payment_configurations': 'Payments India onboarding API, not in v23 snapshot',
    'GET {ID}/payment_configuration/{ID}': 'Payments India onboarding API, not in v23 snapshot',
    'POST {ID}/payment_configuration': 'Payments India onboarding API, not in v23 snapshot',
    'POST {ID}/payment_configuration/{ID}': 'Payments India onboarding API, not in v23 snapshot',
    'POST {ID}/generate_payment_configuration_oauth_link': 'Payments India onboarding API, not in v23 snapshot',
    'DELETE {ID}/payment_configuration': 'Payments India onboarding API, not in v23 snapshot',
    // Resumable Upload API (Graph API, `app/uploads`) is used for profile pictures; not in the snapshot.
    'POST app/uploads': 'Graph Resumable Upload API session, not in v23 snapshot',
    // Business-scoped user IDs / usernames (2026 changelog), newer than the snapshot.
    'DELETE {PHONE_NUMBER_ID}/contact_book': 'Contact book (BSUID) API, added after v23 snapshot',
    'GET {PHONE_NUMBER_ID}/username': 'Business username API, added after v23 snapshot',
    'POST {PHONE_NUMBER_ID}/username': 'Business username API, added after v23 snapshot',
    'DELETE {PHONE_NUMBER_ID}/username': 'Business username API, added after v23 snapshot',
    'GET {PHONE_NUMBER_ID}/username_suggestions': 'Business username API, added after v23 snapshot',
    // Conversation routing / thread control (2026 changelog), newer than the snapshot.
    'POST {PHONE_NUMBER_ID}/thread_control': 'Thread control API, added after v23 snapshot',
    // Verified 2026-10-02 against the live Groups reference, which documents GET (get link) and
    // POST (reset link). The v23 snapshot only has POST/DELETE, so the snapshot is out of date.
    'GET {ID}/invite_link': 'Live Groups reference documents GET /{group_id}/invite_link; v23 snapshot lacks it',
};

/** Prototype methods that never issue a request (private helpers). Key: `<api>.<method>`. */
const NON_REQUEST_METHODS = new Set<string>([
    'blockUsers.buildBlockUsersBody',
    'business.toQuery',
    'business.fieldsQuery',
    'messageHistory.resolveFields',
    'messages.bodyBuilder',
    'solutions.toQuery',
    'solutions.fieldsQuery',
    'waba.toQuery',
    'waba.fieldsQuery',
    'flows.appendFormValue',
]);

/** Explicit arguments for methods whose validation rejects every heuristic argument set. */
const ARG_OVERRIDES: Record<string, () => unknown[]> = {
    'marketingMessages.sendTemplateMessage': () => [
        { to: DUMMY_ID, template: { name: 'promo', language: { code: 'en_US' } } },
    ],
    'messages.interactiveVoiceCall': () => [
        {
            to: DUMMY_ID,
            body: {
                type: 'voice_call',
                body: { text: 'Call us' },
                action: { name: 'voice_call', parameters: { display_text: 'Call', ttl_minutes: 60 } },
            },
        },
    ],
    'threadControl.pass': () => [{ to: DUMMY_ID }],
    'threadControl.release': () => [{ to: DUMMY_ID }],
    'threadControl.take': () => [{ to: DUMMY_ID }],
    'threadControl.send': () => ['release', { to: DUMMY_ID }],
    'media.downloadMedia': () => [MEDIA_URL],
};

type RecordedCall = { method: string; endpoint: string };
type MethodResult = { key: string; calls: RecordedCall[]; error?: string };

/**
 * A value that behaves like "anything": a one-element array whose every missing
 * property is another universal value and that stringifies to DUMMY_ID.
 * Lets required nested fields (`params.to`, `params.body.text`, ...) resolve.
 */
function universal(): unknown {
    const target: unknown[] = [DUMMY_ID];
    return new Proxy(target, {
        get(t, prop, receiver) {
            if (prop === Symbol.toPrimitive || prop === 'toString' || prop === 'valueOf') return () => DUMMY_ID;
            if (prop === 'then' || prop === 'toJSON') return undefined;
            if (prop in t) return Reflect.get(t, prop, receiver);
            if (typeof prop === 'symbol') return undefined;
            return universal();
        },
    });
}

function heuristicArgSets(arity: number): unknown[][] {
    const n = Math.max(arity, 1);
    return [
        Array.from({ length: n }, () => DUMMY_ID),
        Array.from({ length: n }, () => universal()),
        [DUMMY_ID, ...Array.from({ length: Math.max(n - 1, 1) }, () => universal())],
    ];
}

function normalizeEndpoint(endpoint: string): string {
    if (/^https?:\/\//.test(endpoint)) return '{MEDIA_URL}';
    return endpoint
        .replace(/\?.*$/, '')
        .split('/')
        .filter(Boolean)
        .map((segment) => {
            if (segment === String(PHONE_NUMBER_ID)) return '{PHONE_NUMBER_ID}';
            if (segment === WABA_ID) return '{WABA_ID}';
            if (segment === DUMMY_ID) return '{ID}';
            return segment;
        })
        .join('/');
}

const PARAM_CONSTRAINTS: Record<string, (param: string) => boolean> = {
    '{PHONE_NUMBER_ID}': (param) => param === 'Phone-Number-ID',
    '{WABA_ID}': (param) => param === 'WABA-ID' || param === 'WhatsApp-Business-Account-ID',
    '{MEDIA_URL}': (param) => param === 'Media-URL',
    '{ID}': () => true,
};

function segmentMatches(sdkSegment: string, specSegment: string): boolean {
    const param = /^\{(.+)\}$/.exec(specSegment)?.[1];
    const constraint = PARAM_CONSTRAINTS[sdkSegment];
    if (param === undefined) return constraint === undefined && sdkSegment === specSegment;
    return constraint?.(param) ?? false;
}

type SpecOperation = { method: string; segments: string[]; raw: string };

function loadSpecOperations(): SpecOperation[] {
    const spec = parse(readFileSync(SPEC_PATH, 'utf8')) as { paths: Record<string, Record<string, unknown>> };
    const operations: SpecOperation[] = [];
    for (const [rawPath, item] of Object.entries(spec.paths)) {
        const segments = rawPath.split('/').filter(Boolean);
        if (segments[0] === '{Version}') segments.shift();
        for (const method of HTTP_METHODS) {
            if (item[method]) operations.push({ method: method.toUpperCase(), segments, raw: rawPath });
        }
    }
    return operations;
}

function findSpecOperation(operations: SpecOperation[], key: string): SpecOperation | undefined {
    const [method, path = ''] = key.split(' ');
    const sdkSegments = path.split('/').filter(Boolean);
    return operations.find(
        (op) =>
            op.method === method &&
            op.segments.length === sdkSegments.length &&
            op.segments.every((segment, i) => segmentMatches(sdkSegments[i] ?? '', segment)),
    );
}

function prototypeMethods(api: BaseAPI): string[] {
    const names = new Set<string>();
    let proto = Object.getPrototypeOf(api);
    while (proto && proto !== BaseAPI.prototype) {
        for (const name of Object.getOwnPropertyNames(proto)) {
            if (name !== 'constructor' && typeof Object.getOwnPropertyDescriptor(proto, name)?.value === 'function') {
                names.add(name);
            }
        }
        proto = Object.getPrototypeOf(proto);
    }
    return [...names].sort();
}

function createClient(): { whatsApp: WhatsApp; calls: RecordedCall[] } {
    const whatsApp = new WhatsApp({
        accessToken: 'test_token',
        phoneNumberId: PHONE_NUMBER_ID,
        businessAcctId: WABA_ID,
    });
    const calls: RecordedCall[] = [];
    const record = async (method: string, endpoint: string) => {
        calls.push({ method, endpoint });
        return {};
    };
    const requester = whatsApp.requester as unknown as Record<string, unknown>;
    requester.getJson = record;
    requester.sendFormData = record;
    requester.sendUrlEncodedForm = record;
    requester.sendRequest = async () => {
        throw new Error('API classes must go through getJson/sendFormData/sendUrlEncodedForm');
    };
    return { whatsApp, calls };
}

function apiInstances(whatsApp: WhatsApp): [string, BaseAPI][] {
    return Object.entries(whatsApp).filter((entry): entry is [string, BaseAPI] => entry[1] instanceof BaseAPI);
}

async function invoke(api: BaseAPI, key: string, name: string, calls: RecordedCall[]): Promise<MethodResult> {
    const fn = (api as unknown as Record<string, (...args: unknown[]) => unknown>)[name] as (
        ...args: unknown[]
    ) => unknown;
    const override = ARG_OVERRIDES[key];
    const argSets = override ? [override()] : heuristicArgSets(fn.length);
    let error: string | undefined;
    for (const args of argSets) {
        calls.length = 0;
        try {
            await fn.apply(api, args);
        } catch (e) {
            error = e instanceof Error ? e.message : String(e);
            continue;
        }
        if (calls.length > 0) return { key, calls: [...calls] };
        error = 'issued no request';
    }
    return { key, calls: [], error };
}

describe('OpenAPI contract (docs/reference/business-messaging-api_v23.0.yaml)', () => {
    let specOperations: SpecOperation[];
    let methodNames: Set<string>;
    const results: MethodResult[] = [];
    /** `<METHOD> <normalized path>` -> SDK methods that issue it. */
    const endpoints = new Map<string, Set<string>>();

    beforeAll(async () => {
        specOperations = loadSpecOperations();
        methodNames = new Set();
        const { whatsApp, calls } = createClient();
        for (const [apiName, api] of apiInstances(whatsApp)) {
            for (const name of prototypeMethods(api)) {
                const key = `${apiName}.${name}`;
                methodNames.add(key);
                if (NON_REQUEST_METHODS.has(key)) continue;
                const result = await invoke(api, key, name, calls);
                results.push(result);
                for (const call of result.calls) {
                    const endpointKey = `${call.method.toUpperCase()} ${normalizeEndpoint(call.endpoint)}`;
                    if (!endpoints.has(endpointKey)) endpoints.set(endpointKey, new Set());
                    endpoints.get(endpointKey)?.add(key);
                }
            }
        }
    });

    it('loads the vendored spec', () => {
        expect(specOperations.length).toBeGreaterThan(100);
    });

    it('composes every exported API class on WhatsApp', () => {
        const { whatsApp } = createClient();
        const composed = new Set<unknown>(apiInstances(whatsApp).map(([, api]) => api.constructor));
        const exported = Object.entries(apiModules)
            .filter(([, value]) => typeof value === 'function' && value.prototype instanceof BaseAPI)
            .map(([name, value]) => ({ name, value: value as unknown }));
        expect(exported.length).toBeGreaterThan(0);
        expect(exported.filter(({ value }) => !composed.has(value)).map(({ name }) => name)).toEqual([]);
    });

    it('every public API method issues at least one request', () => {
        const failures = results.filter((r) => r.calls.length === 0).map((r) => `${r.key}: ${r.error}`);
        expect(failures, 'add an ARG_OVERRIDES entry, or NON_REQUEST_METHODS for helpers').toEqual([]);
    });

    it('every SDK endpoint exists in the OpenAPI spec (or is allowlisted)', () => {
        const missing = [...endpoints.entries()]
            .filter(([key]) => !SPEC_ALLOWLIST[key] && !findSpecOperation(specOperations, key))
            .map(([key, methods]) => `${key}  <- ${[...methods].join(', ')}`)
            .sort();
        expect(missing).toEqual([]);
    });

    it('has no stale allowlist entries', () => {
        const staleSpec = Object.keys(SPEC_ALLOWLIST).flatMap((key) => {
            if (!endpoints.has(key)) return [`${key}: no longer called by the SDK`];
            const op = findSpecOperation(specOperations, key);
            return op ? [`${key}: now in the spec as ${op.method} ${op.raw}`] : [];
        });
        const staleHelpers = [...NON_REQUEST_METHODS]
            .filter((key) => !methodNames.has(key))
            .map((key) => `NON_REQUEST_METHODS ${key}: method no longer exists`);
        const staleOverrides = Object.keys(ARG_OVERRIDES)
            .filter((key) => !methodNames.has(key))
            .map((key) => `ARG_OVERRIDES ${key}: method no longer exists`);
        expect([...staleSpec, ...staleHelpers, ...staleOverrides]).toEqual([]);
    });
});
