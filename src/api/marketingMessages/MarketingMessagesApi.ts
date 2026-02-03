// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/send-marketing-messages/

import { BaseAPI } from '../../types/base';
import type { WabaConfigType } from '../../types/config';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import type { RequesterClass } from '../../types/request';

import type * as marketing from './types';

/**
 * API for WhatsApp Marketing Messages.
 */
export default class MarketingMessagesApi extends BaseAPI implements marketing.MarketingMessagesClass {
    private readonly endpoint = 'marketing_messages';

    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    async sendTemplateMessage(params: marketing.MarketingMessageRequest) {
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
