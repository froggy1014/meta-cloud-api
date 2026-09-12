// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/send-marketing-messages/

import type { ComponentTypesEnum } from '../../../types/enums';
import type { MessagesResponse, MessageTemplateObject } from '../../messages/types';

/**
 * Marketing Messages API Types
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/send-marketing-messages/
 */

export type MarketingMessageRequest = {
    /**
     * WhatsApp user phone number. Omit when addressing the user by `recipient`
     * (BSUID) instead.
     */
    to?: string;
    /**
     * Business-scoped user ID (BSUID) or parent BSUID of the recipient, used in
     * place of `to` for individual messages.
     *
     * Templates carrying `bid_spec` (max price) cannot be sent to a BSUID
     * recipient — that combination fails with error `131062`.
     */
    recipient?: string;
    template: MessageTemplateObject<ComponentTypesEnum>;
    message_activity_sharing?: boolean;
    product_policy?: 'CLOUD_API_FALLBACK' | 'STRICT';
    /**
     * Per-message max price adjustment. Scales the template's `bid_amount`
     * (set in `optimization_spec`) for this send only, without editing the
     * template.
     *
     * Meta's recommendation: set the template's `bid_amount` to the highest
     * price you are willing to pay, then use a multiplier below 1 to scale
     * individual messages down. This gives the delivery system the widest
     * range to optimize against.
     *
     * The message-level multiplier is subject to change during the beta.
     */
    bid_spec?: MarketingMessageBidSpec;
};

/**
 * Send-time max price multiplier for `POST /{PHONE_NUMBER_ID}/marketing_messages`.
 *
 * Meta keeps the `bid_spec` object name on the send call even though template
 * create/update moved from `bid_spec` to `optimization_spec` on July 31, 2026.
 *
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/pricing
 */
export type MarketingMessageBidSpec = {
    /**
     * Positive multiplier applied to the template's `bid_amount`. Defaults to
     * `1` (the template amount unchanged); `1.5` raises the max price for this
     * message by 50%, `0.5` halves it.
     */
    per_message_bid_multiplier: number;
};

export interface MarketingMessagesClass {
    sendTemplateMessage(params: MarketingMessageRequest): Promise<MessagesResponse>;
}
