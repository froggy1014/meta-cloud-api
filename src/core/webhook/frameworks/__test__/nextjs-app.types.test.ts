import { describe, expect, expectTypeOf, it } from 'vitest';
import { nextjsAppWebhookHandler } from '../nextjs-app';
import type { NextRequest } from '../nextjs-app/nextjs-app';

// Route handlers receive a NextRequest from Next.js, but apps also call them
// with a plain Request (e.g. forwarding a simulated webhook). Both must type-check.
describe('nextjsAppWebhookHandler request types', () => {
    const handler = nextjsAppWebhookHandler({ accessToken: 'token', phoneNumberId: 987654 });

    it('accepts a plain Request and a NextRequest', () => {
        expectTypeOf(handler.GET).parameter(0).toEqualTypeOf<Request>();
        expectTypeOf(handler.POST).parameter(0).toEqualTypeOf<Request>();
        expectTypeOf(handler.webhook.GET).parameter(0).toEqualTypeOf<Request>();
        expectTypeOf(handler.webhook.POST).parameter(0).toEqualTypeOf<Request>();
        expectTypeOf(handler.flow.GET).parameter(0).toEqualTypeOf<Request>();
        expectTypeOf(handler.flow.POST).parameter(0).toEqualTypeOf<Request>();
        expectTypeOf<NextRequest>().toExtend<Request>();
    });

    it('handles a plain Request at runtime', async () => {
        const response = await handler.GET(
            new Request('https://example.com/api/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=1'),
        );
        expect(response.status).toBe(403);
    });
});
