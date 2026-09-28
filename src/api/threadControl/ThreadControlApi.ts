// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/conversation-routing/thread-control/

// Endpoints:
// - POST /{PHONE_NUMBER_ID}/thread_control

import { WHATSAPP_MESSAGING_PRODUCT } from '../../config/defaults';
import { BaseAPI } from '../../types/base';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import { WhatsAppValidationError } from '../../utils/isMetaError';

import type * as threadControl from './types/threadControl';

const METADATA_MAX_LENGTH = 2000;

type ThreadControlAction = 'pass' | 'release' | 'take';

/**
 * API for Conversation Routing thread control.
 *
 * When more than one responder shares a WhatsApp account, Conversation Routing
 * gives each thread exactly one owner. Thread control lets a responder pass
 * ownership to another role, release the thread back to idle, or (escalation
 * partner only) take it. Routing itself is configured by the business in Meta
 * Business Suite, not through the API, and the account must be enrolled for
 * thread control before this endpoint accepts requests.
 *
 * There is no endpoint that reports the current owner: track ownership locally
 * from inbound messages, `messaging_handovers` events (`processor.onMessagingHandovers`),
 * and standby events, and reconcile after 24 hours of user inactivity, when the
 * thread returns to idle on its own.
 *
 * Endpoints covered:
 * - `POST /{PHONE_NUMBER_ID}/thread_control` - Pass, release, or take a thread
 *
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/conversation-routing/thread-control/
 */
export default class ThreadControlApi extends BaseAPI implements threadControl.ThreadControlClass {
    private readonly endpoint = 'thread_control';

    /**
     * Pass thread ownership from you (the current owner) to another responder.
     *
     * Without `control_pass`, control goes to the account's escalation partner.
     * With `control_pass.target_role`, control goes to that role. Meta rejects the
     * request if the thread is idle, you do not own it, the target is not enabled,
     * or the target already owns the thread. The new owner receives a
     * `control_passed` `messaging_handovers` event.
     *
     * @param params - The WhatsApp user (`to` or `recipient`), optional `metadata`, and optional `control_pass`.
     * @returns `{ messaging_product, request_id }`.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/conversation-routing/thread-control/#pass
     *
     * @example
     * ```typescript
     * const { request_id } = await client.threadControl.pass({
     *     recipient: 'US.13491208655302741918',
     *     metadata: 'WhatsApp user requested human agent',
     *     control_pass: { target_role: 'customer_service' },
     * });
     * ```
     */
    async pass(params: threadControl.PassThreadControlParams): Promise<threadControl.ThreadControlResponse> {
        return this.send('pass', params);
    }

    /**
     * Release the thread back to idle. The WhatsApp user's next message is
     * re-routed by entry point. Releasing an idle thread succeeds; releasing a
     * thread you do not own is rejected (the escalation partner must take it first).
     * No `messaging_handovers` event fires for a release.
     *
     * @param params - The WhatsApp user (`to` or `recipient`) and optional `metadata`.
     * @returns `{ messaging_product, request_id }`.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/conversation-routing/thread-control/#release
     */
    async release(params: threadControl.ReleaseThreadControlParams): Promise<threadControl.ThreadControlResponse> {
        return this.send('release', params);
    }

    /**
     * Take thread ownership. Only the account's designated escalation partner can
     * take a thread, regardless of who owns it; the previous owner receives a
     * `control_taken` `messaging_handovers` event. Sending a Service message as the
     * escalation partner takes the thread implicitly, without this call.
     *
     * @param params - The WhatsApp user (`to` or `recipient`) and optional `metadata`.
     * @returns `{ messaging_product, request_id }`.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/conversation-routing/thread-control/#take
     */
    async take(params: threadControl.TakeThreadControlParams): Promise<threadControl.ThreadControlResponse> {
        return this.send('take', params);
    }

    private async send(
        action: ThreadControlAction,
        params: threadControl.PassThreadControlParams,
    ): Promise<threadControl.ThreadControlResponse> {
        const hasTo = Boolean(params?.to);
        const hasRecipient = Boolean(params?.recipient);
        if (hasTo === hasRecipient) {
            throw new WhatsAppValidationError('Exactly one of "to" or "recipient" is required for thread control.');
        }
        if (params.metadata && params.metadata.length > METADATA_MAX_LENGTH) {
            throw new WhatsAppValidationError(
                `"metadata" must be at most ${METADATA_MAX_LENGTH} characters for thread control.`,
            );
        }
        if (action !== 'pass' && params.control_pass) {
            throw new WhatsAppValidationError('"control_pass" is only supported for the pass action.');
        }

        const body = {
            messaging_product: WHATSAPP_MESSAGING_PRODUCT,
            ...(hasTo ? { to: params.to } : { recipient: params.recipient }),
            action,
            ...(params.metadata !== undefined && { metadata: params.metadata }),
            ...(params.control_pass && { control_pass: params.control_pass }),
        };

        return await this.sendJson<threadControl.ThreadControlResponse>(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }
}
