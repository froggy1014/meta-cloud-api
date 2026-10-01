import { describe, expect, it } from 'vitest';
import { createMockCloudApi, createSignedWebhookRequest, createStatusWebhook } from '../index';

describe('testing helper isolation and concurrent requests', () => {
    it('reserves a limited async route before another request can use it', async () => {
        const mock = createMockCloudApi();
        mock.on(
            'GET',
            '/test',
            async () => {
                await Promise.resolve();
                return { custom: true };
            },
            { times: 1 },
        );

        const replies = await Promise.all(
            Array.from({ length: 3 }, async () => {
                const response = await mock.fetch('https://graph.facebook.com/test');
                return response.json();
            }),
        );

        expect(replies.filter((reply) => reply.custom === true)).toHaveLength(1);
    });

    it('matches global regex routes consistently without changing caller state', async () => {
        const mock = createMockCloudApi();
        const pattern = /^\/test$/g;
        mock.on('GET', pattern, () => ({ custom: true }));

        for (let attempt = 0; attempt < 3; attempt++) {
            expect(await (await mock.fetch('https://graph.facebook.com/test')).json()).toEqual({ custom: true });
        }
        expect(pattern.lastIndex).toBe(0);
        expect(mock.requestsTo('GET', pattern)).toHaveLength(3);
    });

    it('overrides default headers regardless of casing', async () => {
        const request = await createSignedWebhookRequest('{}', {
            appSecret: 'test-secret',
            headers: { 'X-Hub-Signature-256': 'broken', 'Content-Type': 'text/plain' },
        });

        expect(request.headers.get('x-hub-signature-256')).toBe('broken');
        expect(request.headers.get('content-type')).toBe('text/plain');
    });

    it('keeps default template objects independent between mocks', () => {
        const first = createMockCloudApi();
        const template = first.templates[0];
        if (!template) throw new Error('missing default template');
        const original = template.name;
        try {
            template.name = 'changed';
            expect(createMockCloudApi().templates[0]?.name).toBe('hello_world');
        } finally {
            template.name = original;
        }
    });

    it('keeps default failure details independent between payloads', () => {
        const first = createStatusWebhook({ status: 'failed', recipientId: '15551234567' });
        const details = first.entry[0]?.changes[0]?.value.statuses[0]?.errors?.[0]?.error_data;
        if (!details) throw new Error('missing default error details');
        const original = details.details;
        try {
            details.details = 'changed';
            const second = createStatusWebhook({ status: 'failed', recipientId: '15551234567' });
            expect(second.entry[0]?.changes[0]?.value.statuses[0]?.errors?.[0]?.error_data?.details).toBe(original);
        } finally {
            details.details = original;
        }
    });
});
