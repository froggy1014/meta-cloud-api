import {
    type InteractiveButtonReplyMessage,
    MessageTypesEnum,
    type TextMessage,
    type WebhookPayload,
    WebhookProcessor,
} from 'meta-cloud-api';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
    createButtonReplyWebhook,
    createImageMessageWebhook,
    createListReplyWebhook,
    createLocationWebhook,
    createMessageWebhook,
    createReactionWebhook,
    createSignedWebhookRequest,
    createStatusWebhook,
    createTextMessageWebhook,
    createWebhookPayload,
    type MessageWebhookPayload,
    TEST_DISPLAY_PHONE_NUMBER,
    TEST_PHONE_NUMBER_ID,
    TEST_WABA_ID,
} from '../index';

const APP_SECRET = 'test-app-secret';
const CUSTOMER = '15551234567';

function createProcessor() {
    return new WebhookProcessor({
        accessToken: 'test-token',
        phoneNumberId: Number(TEST_PHONE_NUMBER_ID),
        appSecret: APP_SECRET,
        verifyWebhookSignature: true,
    });
}

async function deliver(processor: WebhookProcessor, payload: WebhookPayload) {
    const response = await processor.processWebhook(
        await createSignedWebhookRequest(payload, { appSecret: APP_SECRET }),
    );
    expect(response.status).toBe(200);
}

function firstMessage<M extends TextMessage | InteractiveButtonReplyMessage>(payload: MessageWebhookPayload<M>): M {
    const message = payload.entry[0]?.changes[0]?.value.messages[0];
    if (!message) throw new Error('payload has no message');
    return message;
}

describe('webhook payload factories', () => {
    it('builds a text message payload in the shape Meta sends', () => {
        const payload = createTextMessageWebhook({
            from: CUSTOMER,
            text: 'hi',
            profileName: 'Ada',
            id: 'wamid.fixed',
            timestamp: new Date('2026-01-01T00:00:00Z'),
        });

        expect(payload).toEqual({
            object: 'whatsapp_business_account',
            entry: [
                {
                    id: TEST_WABA_ID,
                    changes: [
                        {
                            field: 'messages',
                            value: {
                                messaging_product: 'whatsapp',
                                metadata: {
                                    display_phone_number: TEST_DISPLAY_PHONE_NUMBER,
                                    phone_number_id: TEST_PHONE_NUMBER_ID,
                                },
                                contacts: [{ profile: { name: 'Ada' }, wa_id: CUSTOMER }],
                                messages: [
                                    {
                                        from: CUSTOMER,
                                        id: 'wamid.fixed',
                                        timestamp: '1767225600',
                                        type: 'text',
                                        text: { body: 'hi' },
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
        });
    });

    it('returns types assignable to the SDK webhook types', () => {
        const text = createTextMessageWebhook({ from: CUSTOMER, text: 'hi' });
        expectTypeOf(text).toExtend<WebhookPayload>();
        expectTypeOf(firstMessage(text)).toEqualTypeOf<TextMessage>();
        expectTypeOf(
            createButtonReplyWebhook({ from: CUSTOMER, buttonId: 'b', title: 'B' }),
        ).toExtend<WebhookPayload>();
        expectTypeOf(createStatusWebhook({ status: 'read', recipientId: CUSTOMER })).toExtend<WebhookPayload>();
        expectTypeOf(createWebhookPayload('account_update', { event: 'VERIFIED_ACCOUNT' })).toExtend<WebhookPayload>();
    });

    it('uses the given phone number ID, WABA ID and a fresh wamid per message', () => {
        const a = createTextMessageWebhook({ from: CUSTOMER, text: 'a', phoneNumberId: 42, wabaId: 'WABA' });
        const b = createTextMessageWebhook({ from: CUSTOMER, text: 'b' });

        expect(a.entry[0]?.id).toBe('WABA');
        expect(a.entry[0]?.changes[0]?.value.metadata.phone_number_id).toBe('42');
        expect(firstMessage(a).id).toMatch(/^wamid\./);
        expect(firstMessage(a).id).not.toBe(firstMessage(b).id);
        expect(Number(firstMessage(a).timestamp)).toBeCloseTo(Date.now() / 1000, -1);
    });

    it('adds the default error to a failed status', () => {
        const payload = createStatusWebhook({ status: 'failed', recipientId: CUSTOMER, messageId: 'wamid.out' });
        const status = payload.entry[0]?.changes[0]?.value.statuses[0];
        expect(status).toMatchObject({ id: 'wamid.out', status: 'failed', recipient_id: CUSTOMER });
        expect(status?.errors?.[0]?.code).toBe(131026);
    });
});

describe('WebhookProcessor dispatch of factory payloads', () => {
    it('sends a text message to onText', async () => {
        const processor = createProcessor();
        const seen: string[] = [];
        processor.onText((_wa, processed) => {
            seen.push(`${processed.profileName}:${processed.message.text.body}:${processed.message.from}`);
        });

        await deliver(processor, createTextMessageWebhook({ from: CUSTOMER, text: 'hello', profileName: 'Ada' }));
        expect(seen).toEqual([`Ada:hello:${CUSTOMER}`]);
    });

    it('sends an image to onImage', async () => {
        const processor = createProcessor();
        const seen: unknown[] = [];
        processor.onImage((_wa, processed) => {
            seen.push(processed.message.image);
        });

        await deliver(processor, createImageMessageWebhook({ from: CUSTOMER, mediaId: '987', caption: 'look' }));
        expect(seen).toEqual([
            expect.objectContaining({ id: '987', caption: 'look', mime_type: 'image/jpeg', url: expect.any(String) }),
        ]);
    });

    it('sends button and list replies to onInteractive', async () => {
        const processor = createProcessor();
        const seen: string[] = [];
        processor.onInteractive((_wa, processed) => {
            const { interactive } = processed.message;
            if (interactive.type === 'button_reply') seen.push(`button:${interactive.button_reply.id}`);
            if (interactive.type === 'list_reply') seen.push(`list:${interactive.list_reply.id}`);
        });

        await deliver(
            processor,
            createButtonReplyWebhook({ from: CUSTOMER, buttonId: 'yes', title: 'Yes', contextMessageId: 'wamid.q' }),
        );
        await deliver(processor, createListReplyWebhook({ from: CUSTOMER, rowId: 'row-2', title: 'Two' }));
        expect(seen).toEqual(['button:yes', 'list:row-2']);
    });

    it('sends a reaction to onReaction', async () => {
        const processor = createProcessor();
        const seen: unknown[] = [];
        processor.onReaction((_wa, processed) => {
            seen.push(processed.message.reaction);
        });

        await deliver(processor, createReactionWebhook({ from: CUSTOMER, messageId: 'wamid.out', emoji: '👍' }));
        await deliver(processor, createReactionWebhook({ from: CUSTOMER, messageId: 'wamid.out' }));
        expect(seen).toEqual([{ message_id: 'wamid.out', emoji: '👍' }, { message_id: 'wamid.out' }]);
    });

    it('sends a location to onLocation', async () => {
        const processor = createProcessor();
        const seen: unknown[] = [];
        processor.onLocation((_wa, processed) => {
            seen.push(processed.message.location);
        });

        await deliver(
            processor,
            createLocationWebhook({ from: CUSTOMER, latitude: 37.5, longitude: 127, name: 'Office' }),
        );
        expect(seen).toEqual([{ latitude: 37.5, longitude: 127, name: 'Office' }]);
    });

    it('sends every status to onStatus', async () => {
        const processor = createProcessor();
        const seen: string[] = [];
        processor.onStatus((_wa, processed) => {
            seen.push(`${processed.status.status}:${processed.status.id}`);
        });

        for (const status of ['sent', 'delivered', 'read', 'failed'] as const) {
            await deliver(processor, createStatusWebhook({ status, recipientId: CUSTOMER, messageId: 'wamid.out' }));
        }
        expect(seen).toEqual(['sent:wamid.out', 'delivered:wamid.out', 'read:wamid.out', 'failed:wamid.out']);
    });

    it('wraps any message with createMessageWebhook', async () => {
        const processor = createProcessor();
        const seen: string[] = [];
        processor.onDocument((_wa, processed) => {
            seen.push(processed.message.document.filename);
        });

        await deliver(
            processor,
            createMessageWebhook({
                from: CUSTOMER,
                id: 'wamid.doc',
                timestamp: '1',
                type: MessageTypesEnum.Document,
                document: { filename: 'invoice.pdf', mime_type: 'application/pdf', sha256: 'x', id: '1', url: 'u' },
            }),
        );
        expect(seen).toEqual(['invoice.pdf']);
    });

    it('sends other fields to their handler with createWebhookPayload', async () => {
        const processor = createProcessor();
        const seen: string[] = [];
        processor.onAccountUpdate((_wa, processed) => {
            seen.push(`${processed.wabaId}:${processed.value.event}`);
        });

        await deliver(
            processor,
            createWebhookPayload('account_update', { event: 'VERIFIED_ACCOUNT' }, { wabaId: 'W1' }),
        );
        expect(seen).toEqual(['W1:VERIFIED_ACCOUNT']);
    });
});
