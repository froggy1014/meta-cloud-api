// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages
import { randomDigits, randomWamid } from './random';
import {
    type ImageMessage,
    type InteractiveButtonReplyMessage,
    type InteractiveListReplyMessage,
    type LocationMessage,
    MessageTypesEnum,
    type MessageWebhookValue,
    type NonMessageWebhookField,
    type ReactionMessage,
    type StatusWebhook,
    type StatusWebhookValue,
    type TextMessage,
    type WebhookFieldType,
    type WebhookFieldValueMap,
    type WebhookValue,
    type WhatsAppMessage,
} from './sdk';

/** Phone number ID used when a factory is not given one. */
export const TEST_PHONE_NUMBER_ID = '100000000000001';
/** Display phone number used when a factory is not given one. */
export const TEST_DISPLAY_PHONE_NUMBER = '15550100000';
/** WhatsApp Business Account ID used when a factory is not given one. */
export const TEST_WABA_ID = '100000000000002';

/** The `change` object for a webhook field, as Meta nests it under `entry[].changes[]`. */
export type WebhookChangeFor<F extends WebhookFieldType> = F extends NonMessageWebhookField
    ? { field: F; value: WebhookFieldValueMap[F] }
    : { field: 'messages'; value: WebhookValue };

/** Any `change` object the SDK understands. */
export type WebhookChange = WebhookChangeFor<WebhookFieldType>;

/**
 * A webhook payload whose changes are narrowed to `C`. It is assignable to the
 * SDK's `WebhookPayload`, so it can be passed anywhere one is expected.
 */
export type TestWebhookPayload<C extends WebhookChange = WebhookChange> = {
    object: 'whatsapp_business_account';
    entry: Array<{ id: string; changes: Array<C> }>;
};

/** `messages` field value carrying messages of type `M`. */
export type MessageWebhookValueOf<M extends WhatsAppMessage> = Omit<MessageWebhookValue, 'messages'> & {
    messages: Array<M>;
};

/** Webhook payload delivering one inbound message of type `M`. */
export type MessageWebhookPayload<M extends WhatsAppMessage = WhatsAppMessage> = TestWebhookPayload<{
    field: 'messages';
    value: MessageWebhookValueOf<M>;
}>;

/** Webhook payload delivering message status updates. */
export type StatusWebhookPayload = TestWebhookPayload<{ field: 'messages'; value: StatusWebhookValue }>;

/** Options shared by every factory. */
export interface WebhookTargetOptions {
    /** Your business phone number ID. Defaults to {@link TEST_PHONE_NUMBER_ID}. */
    phoneNumberId?: string | number;
    /** Your business display phone number. Defaults to {@link TEST_DISPLAY_PHONE_NUMBER}. */
    displayPhoneNumber?: string;
    /** WhatsApp Business Account ID (`entry[].id`). Defaults to {@link TEST_WABA_ID}. */
    wabaId?: string;
}

/** Options for factories that deliver a message sent by a customer. */
export interface InboundMessageOptions extends WebhookTargetOptions {
    /** Customer phone number (WhatsApp ID) that sent the message. */
    from: string;
    /** Customer profile name. Defaults to `'Test User'`. */
    profileName?: string;
    /** Message ID. Defaults to a random `wamid.` ID. */
    id?: string;
    /** Unix seconds (string or number) or a Date. Defaults to now. */
    timestamp?: string | number | Date;
}

function toTimestamp(value: string | number | Date | undefined): string {
    if (value === undefined) return String(Math.floor(Date.now() / 1000));
    if (value instanceof Date) return String(Math.floor(value.getTime() / 1000));
    return String(value);
}

function metadata(options: WebhookTargetOptions): MessageWebhookValue['metadata'] {
    return {
        display_phone_number: options.displayPhoneNumber ?? TEST_DISPLAY_PHONE_NUMBER,
        phone_number_id: String(options.phoneNumberId ?? TEST_PHONE_NUMBER_ID),
    };
}

type BaseFields = { from: string; id: string; timestamp: string };

function baseFields(options: InboundMessageOptions): BaseFields {
    return { from: options.from, id: options.id ?? randomWamid(), timestamp: toTimestamp(options.timestamp) };
}

/** The `context` Meta attaches to button and list replies: the business message being answered. */
function replyContext(options: InboundMessageOptions & { contextMessageId?: string }) {
    return {
        from: options.displayPhoneNumber ?? TEST_DISPLAY_PHONE_NUMBER,
        id: options.contextMessageId ?? randomWamid(),
    };
}

/**
 * Wrap a field value in the `object` / `entry` / `changes` envelope Meta posts to
 * your webhook. Works for every field the SDK types, for example
 * `createWebhookPayload('account_update', { event: 'VERIFIED_ACCOUNT' })`.
 */
export function createWebhookPayload<F extends WebhookFieldType>(
    field: F,
    value: WebhookChangeFor<F>['value'],
    options: Pick<WebhookTargetOptions, 'wabaId'> = {},
): TestWebhookPayload<WebhookChangeFor<F>> {
    // TypeScript cannot correlate `field` and `value` through the conditional type.
    return envelope({ field, value } as WebhookChangeFor<F>, options);
}

function envelope<C extends WebhookChange>(
    change: C,
    options: Pick<WebhookTargetOptions, 'wabaId'>,
): TestWebhookPayload<C> {
    return {
        object: 'whatsapp_business_account',
        entry: [{ id: options.wabaId ?? TEST_WABA_ID, changes: [change] }],
    };
}

/**
 * Deliver any inbound message object. The typed factories below build the
 * message for you; use this one for types they do not cover (video, document, ...).
 */
export function createMessageWebhook<M extends WhatsAppMessage>(
    message: M,
    options: WebhookTargetOptions & { profileName?: string } = {},
): MessageWebhookPayload<M> {
    const value: MessageWebhookValueOf<M> = {
        messaging_product: 'whatsapp',
        metadata: metadata(options),
        contacts: [{ profile: { name: options.profileName ?? 'Test User' }, wa_id: message.from }],
        messages: [message],
    };
    return envelope({ field: 'messages', value }, options);
}

/** A customer sent a text message. Dispatched to `processor.onText`. */
export function createTextMessageWebhook(
    options: InboundMessageOptions & { text: string },
): MessageWebhookPayload<TextMessage> {
    const message: TextMessage = { ...baseFields(options), type: MessageTypesEnum.Text, text: { body: options.text } };
    return createMessageWebhook(message, options);
}

/** A customer sent an image. Dispatched to `processor.onImage`. */
export function createImageMessageWebhook(
    options: InboundMessageOptions & {
        /** Media ID to pass to `media.getMediaById`. Defaults to a random numeric ID. */
        mediaId?: string;
        mimeType?: string;
        sha256?: string;
        caption?: string;
        /** Defaults to a lookaside URL built from the media ID. */
        url?: string;
    },
): MessageWebhookPayload<ImageMessage> {
    const mediaId = options.mediaId ?? randomDigits(16);
    const image: ImageMessage['image'] = {
        id: mediaId,
        mime_type: options.mimeType ?? 'image/jpeg',
        sha256: options.sha256 ?? 'test-sha256',
        url: options.url ?? `https://lookaside.fbsbx.com/whatsapp_business/attachments/?mid=${mediaId}`,
    };
    if (options.caption !== undefined) image.caption = options.caption;
    const message: ImageMessage = { ...baseFields(options), type: MessageTypesEnum.Image, image };
    return createMessageWebhook(message, options);
}

/** A customer tapped a reply button. Dispatched to `processor.onInteractive`. */
export function createButtonReplyWebhook(
    options: InboundMessageOptions & {
        /** The `id` you gave the button. */
        buttonId: string;
        title: string;
        /** ID of your interactive message. Defaults to a random `wamid.` ID. */
        contextMessageId?: string;
    },
): MessageWebhookPayload<InteractiveButtonReplyMessage> {
    const message: InteractiveButtonReplyMessage = {
        ...baseFields(options),
        type: MessageTypesEnum.Interactive,
        context: replyContext(options),
        interactive: { type: 'button_reply', button_reply: { id: options.buttonId, title: options.title } },
    };
    return createMessageWebhook(message, options);
}

/** A customer picked a list row. Dispatched to `processor.onInteractive`. */
export function createListReplyWebhook(
    options: InboundMessageOptions & {
        /** The `id` you gave the row. */
        rowId: string;
        title: string;
        description?: string;
        /** ID of your list message. Defaults to a random `wamid.` ID. */
        contextMessageId?: string;
    },
): MessageWebhookPayload<InteractiveListReplyMessage> {
    const listReply: InteractiveListReplyMessage['interactive']['list_reply'] = {
        id: options.rowId,
        title: options.title,
    };
    if (options.description !== undefined) listReply.description = options.description;
    const message: InteractiveListReplyMessage = {
        ...baseFields(options),
        type: MessageTypesEnum.Interactive,
        context: replyContext(options),
        interactive: { type: 'list_reply', list_reply: listReply },
    };
    return createMessageWebhook(message, options);
}

/**
 * A customer reacted to a message. Leave `emoji` out to simulate removing a
 * reaction. Dispatched to `processor.onReaction`.
 */
export function createReactionWebhook(
    options: InboundMessageOptions & {
        /** ID of the message that was reacted to. */
        messageId: string;
        emoji?: string;
    },
): MessageWebhookPayload<ReactionMessage> {
    const reaction: ReactionMessage['reaction'] = { message_id: options.messageId };
    if (options.emoji !== undefined) reaction.emoji = options.emoji;
    const message: ReactionMessage = { ...baseFields(options), type: MessageTypesEnum.Reaction, reaction };
    return createMessageWebhook(message, options);
}

/** A customer shared a location. Dispatched to `processor.onLocation`. */
export function createLocationWebhook(
    options: InboundMessageOptions & {
        latitude: number;
        longitude: number;
        name?: string;
        address?: string;
        url?: string;
    },
): MessageWebhookPayload<LocationMessage> {
    const location: LocationMessage['location'] = { latitude: options.latitude, longitude: options.longitude };
    if (options.name !== undefined) location.name = options.name;
    if (options.address !== undefined) location.address = options.address;
    if (options.url !== undefined) location.url = options.url;
    const message: LocationMessage = { ...baseFields(options), type: MessageTypesEnum.Location, location };
    return createMessageWebhook(message, options);
}

/** Default error Meta reports on a `failed` status when none is given. */
const DEFAULT_FAILED_ERROR = {
    code: 131026,
    title: 'Message undeliverable',
    message: 'Message undeliverable',
    error_data: { details: 'Message Undeliverable.' },
};

/**
 * WhatsApp reports a status for a message you sent. Dispatched to
 * `processor.onStatus`. A `failed` status gets error 131026 unless `errors` is given.
 */
export function createStatusWebhook(
    options: WebhookTargetOptions & {
        status: StatusWebhook['status'];
        /** Customer phone number the message was sent to. */
        recipientId: string;
        /** ID of the message you sent (from `messages.text()` etc.). Defaults to a random `wamid.` ID. */
        messageId?: string;
        timestamp?: string | number | Date;
        errors?: StatusWebhook['errors'];
        pricing?: StatusWebhook['pricing'];
        conversation?: StatusWebhook['conversation'];
        bizOpaqueCallbackData?: string;
    },
): StatusWebhookPayload {
    const status: StatusWebhook = {
        id: options.messageId ?? randomWamid(),
        status: options.status,
        timestamp: toTimestamp(options.timestamp),
        recipient_id: options.recipientId,
    };
    if (options.conversation) status.conversation = options.conversation;
    if (options.pricing) status.pricing = options.pricing;
    if (options.bizOpaqueCallbackData !== undefined) status.biz_opaque_callback_data = options.bizOpaqueCallbackData;
    if (options.errors) status.errors = options.errors;
    else if (options.status === 'failed') status.errors = [structuredClone(DEFAULT_FAILED_ERROR)];

    const value: StatusWebhookValue = {
        messaging_product: 'whatsapp',
        metadata: metadata(options),
        statuses: [status],
    };
    return envelope({ field: 'messages', value }, options);
}
