import {
    WhatsApp,
    WhatsAppApiError,
    WhatsAppAuthorizationError,
    WhatsAppSendMessageError,
    WhatsAppThrottlingError,
} from 'meta-cloud-api';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createMetaErrorResponse, createMockCloudApi, type MockCloudApi } from '../index';

const PHONE_NUMBER_ID = 1234567890;
const WABA_ID = '9876543210';
const TO = '15551234567';

describe('createMockCloudApi with a real WhatsApp client', () => {
    let mock: MockCloudApi;
    let wa: WhatsApp;

    beforeEach(() => {
        mock = createMockCloudApi().install();
        wa = new WhatsApp({
            accessToken: 'test-token',
            phoneNumberId: PHONE_NUMBER_ID,
            businessAcctId: WABA_ID,
            retry: { maxAttempts: 1 },
        });
    });

    afterEach(() => {
        mock.restore();
    });

    it('answers messages.text with a wamid and records the payload', async () => {
        const response = await wa.messages.text({ to: '+15551234567', body: 'hello' });

        expect(response.messages[0]?.id).toMatch(/^wamid\./);
        expect(response.contacts[0]).toEqual({ input: '+15551234567', wa_id: '15551234567' });

        const [request] = mock.requests;
        expect(request).toMatchObject({
            method: 'POST',
            host: 'graph.facebook.com',
            path: `/${PHONE_NUMBER_ID}/messages`,
            apiVersion: expect.stringMatching(/^v\d+\.\d+$/),
            bodyType: 'json',
        });
        expect(request?.headers.authorization).toBe('Bearer test-token');
        expect(mock.sentMessages()).toEqual([
            expect.objectContaining({
                messaging_product: 'whatsapp',
                to: '+15551234567',
                type: 'text',
                text: expect.objectContaining({ body: 'hello' }),
            }),
        ]);
        expect(mock.lastSentMessage('text')?.text).toMatchObject({ body: 'hello' });
        expect(mock.sentMessages('image')).toEqual([]);
    });

    it('leaves read receipts out of sentMessages', async () => {
        await expect(wa.messages.markAsRead({ messageId: 'wamid.in' })).resolves.toEqual({ success: true });
        expect(mock.requests).toHaveLength(1);
        expect(mock.sentMessages()).toEqual([]);
    });

    it('uploads media as multipart and serves it back by ID', async () => {
        const file = new File([new Uint8Array([1, 2, 3])], 'photo.png', { type: 'image/png' });
        const { id } = await wa.media.uploadMedia(file);

        expect(id).toMatch(/^\d{16}$/);
        const [upload] = mock.requestsTo('POST', '/:phoneNumberId/media');
        expect(upload?.bodyType).toBe('multipart');
        expect(upload?.body).toMatchObject({ messaging_product: 'whatsapp', type: 'image/png' });
        expect(mock.media.get(id)).toMatchObject({ mimeType: 'image/png', fileSize: 3 });

        const info = await wa.media.getMediaById(id);
        expect(info).toMatchObject({ id, mime_type: 'image/png', file_size: 3, messaging_product: 'whatsapp' });
        expect(info.sha256).toBe('039058c6f2c0cb492c533b0a4d14ef77cc0f78abccced5287d84a1a2011cfb81');

        const download = await fetch(info.url);
        expect(new Uint8Array(await download.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
    });

    it('lists templates with query filters', async () => {
        const all = await wa.templates.getTemplates();
        expect(all.data.map((t) => t.name)).toEqual(['hello_world']);

        const none = await wa.templates.getTemplates({ name: 'missing' });
        expect(none.data).toEqual([]);
        expect(mock.requestsTo('GET', `/${WABA_ID}/message_templates`)[1]?.query).toMatchObject({ name: 'missing' });
    });

    it('lets a route override the default response', async () => {
        mock.on('POST', '/:phoneNumberId/messages', ({ params, body }) => ({
            messaging_product: 'whatsapp',
            contacts: [],
            messages: [{ id: `wamid.custom.${params.phoneNumberId}.${(body as { type: string }).type}` }],
        }));

        const response = await wa.messages.text({ to: '15551234567', body: 'hi' });
        expect(response.messages[0]?.id).toBe(`wamid.custom.${PHONE_NUMBER_ID}.text`);
    });

    it('falls through when a handler returns undefined and stops after `times`', async () => {
        const seen: string[] = [];
        mock.on('*', /^\/(?<id>\d+)\/messages$/, ({ params }) => {
            seen.push(params.id ?? '');
        });
        mock.fail('POST', '/:phoneNumberId/messages', { code: 131026, message: 'Message undeliverable' }, { times: 1 });

        await expect(wa.messages.text({ to: TO, body: 'a' })).rejects.toBeInstanceOf(WhatsAppSendMessageError);
        await expect(wa.messages.text({ to: TO, body: 'b' })).resolves.toMatchObject({ messaging_product: 'whatsapp' });
        expect(seen).toEqual([String(PHONE_NUMBER_ID)]);
    });

    it('maps forced Meta errors to WhatsAppError subclasses', async () => {
        const remove = mock.fail('POST', '/:phoneNumberId/messages', {
            code: 190,
            message: 'Invalid OAuth access token',
        });
        const auth = await wa.messages.text({ to: TO, body: 'x' }).catch((error: unknown) => error);
        expect(auth).toBeInstanceOf(WhatsAppAuthorizationError);
        expect(auth).toMatchObject({ statusCode: 401, error: { code: 190, message: 'Invalid OAuth access token' } });
        remove();

        mock.fail('POST', '/:phoneNumberId/messages', { code: 130429, message: 'Rate limit hit' });
        await expect(wa.messages.text({ to: TO, body: 'x' })).rejects.toBeInstanceOf(WhatsAppThrottlingError);

        mock.on('GET', '/:id', () => createMetaErrorResponse({ code: 100, error_subcode: 33 }, 404));
        const notFound = await wa.media.getMediaById('1').catch((error: unknown) => error);
        expect(notFound).toBeInstanceOf(WhatsAppApiError);
        expect(notFound).toMatchObject({ statusCode: 404, error: { code: 100, error_subcode: 33 } });
    });

    it('rejects unknown Graph routes with a Meta error and passes other hosts through', async () => {
        await expect(wa.phoneNumbers.getPhoneNumbers()).rejects.toThrow(/no mock route for GET/);

        const external = createMockCloudApi({ fetch: async () => new Response('passthrough') });
        const response = await external.fetch('https://example.com/');
        expect(await response.text()).toBe('passthrough');
        expect(external.requests).toEqual([]);
    });

    it('restores the previous fetch and resets state', async () => {
        await wa.messages.text({ to: TO, body: 'x' });
        mock.on('POST', '/:id/messages', () => ({ ok: true }));
        mock.reset();
        expect(mock.requests).toEqual([]);
        expect((await wa.messages.text({ to: TO, body: 'y' })).messages[0]?.id).toMatch(/^wamid\./);

        const before = mock.fetch;
        mock.restore();
        expect(globalThis.fetch).not.toBe(before);
    });
});
