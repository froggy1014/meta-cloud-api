// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/send-marketing-messages/

// Endpoints:
// - POST /{PHONE_NUMBER_ID}/marketing_messages

import { WHATSAPP_MESSAGING_PRODUCT } from '../../config/defaults';
import { BaseAPI } from '../../types/base';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import { WhatsAppValidationError } from '../../utils/isMetaError';

import type { MessagesResponse } from '../messages/types';
import type * as marketing from './types';

/**
 * API for WhatsApp Marketing Messages.
 *
 * Provides methods to send marketing template messages to WhatsApp users,
 * with support for message activity sharing opt-in.
 *
 * Endpoints covered:
 * - `POST /{PHONE_NUMBER_ID}/marketing_messages` - Send a marketing template message
 *
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/send-marketing-messages/
 */
export default class MarketingMessagesApi extends BaseAPI implements marketing.MarketingMessagesClass {
    private readonly endpoint = 'marketing_messages';

    /**
     * Send a marketing template message to a WhatsApp user.
     *
     * Address the user either by phone number (`to`) or by business-scoped user ID
     * (`recipient`). Exactly one of the two is required.
     *
     * @param params - The marketing message request parameters.
     * @param params.to - The recipient's WhatsApp phone number.
     * @param params.recipient - The recipient's BSUID or parent BSUID, used instead of `to`.
     * @param params.template - The template configuration (name, language, components).
     * @param params.message_activity_sharing - Optional flag to enable message activity sharing.
     * @param params.product_policy - Optional product policy for marketing messages.
     * @returns The messages response with message ID and status.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/send-marketing-messages/
     */
    async sendTemplateMessage(params: marketing.MarketingMessageRequest): Promise<MessagesResponse> {
        if (!params.to === !params.recipient) {
            throw new WhatsAppValidationError('Provide exactly one of "to" (phone number) or "recipient" (BSUID).');
        }

        const body = {
            messaging_product: WHATSAPP_MESSAGING_PRODUCT,
            recipient_type: 'individual',
            type: 'template',
            template: params.template,
        } as {
            messaging_product: 'whatsapp';
            recipient_type: 'individual';
            to?: string;
            recipient?: string;
            type: 'template';
            template: marketing.MarketingMessageRequest['template'];
            message_activity_sharing?: boolean;
            product_policy?: marketing.MarketingMessageRequest['product_policy'];
        };

        if (params.to !== undefined) {
            body.to = params.to;
        }

        if (params.recipient !== undefined) {
            body.recipient = params.recipient;
        }

        if (params.message_activity_sharing !== undefined) {
            body.message_activity_sharing = params.message_activity_sharing;
        }

        if (params.product_policy !== undefined) {
            body.product_policy = params.product_policy;
        }

        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }
}
