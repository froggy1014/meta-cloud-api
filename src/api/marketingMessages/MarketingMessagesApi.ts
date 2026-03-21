// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/send-marketing-messages/

// Endpoints:
// - POST /{PHONE_NUMBER_ID}/marketing_messages

import { BaseAPI } from '../../types/base';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';

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
     * @param params - The marketing message request parameters.
     * @param params.to - The recipient's WhatsApp phone number.
     * @param params.template - The template configuration (name, language, components).
     * @param params.message_activity_sharing - Optional flag to enable message activity sharing.
     * @returns The messages response with message ID and status.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/send-marketing-messages/
     */
    async sendTemplateMessage(params: marketing.MarketingMessageRequest): Promise<MessagesResponse> {
        const body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: params.to,
            type: 'template',
            template: params.template,
        } as {
            messaging_product: 'whatsapp';
            recipient_type: 'individual';
            to: string;
            type: 'template';
            template: marketing.MarketingMessageRequest['template'];
            message_activity_sharing?: boolean;
        };

        if (params.message_activity_sharing !== undefined) {
            body.message_activity_sharing = params.message_activity_sharing;
        }

        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }
}
