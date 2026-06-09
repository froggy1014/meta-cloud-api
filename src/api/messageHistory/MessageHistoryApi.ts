// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/overview/

// Endpoints:
// - GET /{PHONE_NUMBER_ID}/message_history
// - GET /{MESSAGE_HISTORY_ID}/events

import { BaseAPI } from '../../types/base';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import { objectToQueryString } from '../../utils/objectToQueryString';

import type * as messageHistory from './types';

export default class MessageHistoryApi extends BaseAPI implements messageHistory.MessageHistoryClass {
    private toQuery(params?: messageHistory.MessageHistoryEventListParams): string {
        if (!params) return '';

        const fields = Array.isArray(params.fields) ? params.fields.join(',') : params.fields;
        return objectToQueryString({
            fields,
            message_id: params.message_id,
            start_time: params.start_time,
            end_time: params.end_time,
            delivery_status: params.delivery_status,
            limit: params.limit,
            after: params.after,
            before: params.before,
        });
    }

    async getMessageHistory(
        params?: messageHistory.MessageHistoryListParams,
    ): Promise<messageHistory.MessageHistoryResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/message_history${this.toQuery(params)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async getMessageHistoryEvents(
        messageHistoryId: string,
        params?: messageHistory.MessageHistoryEventListParams,
    ): Promise<messageHistory.MessageHistoryResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${messageHistoryId}/events${this.toQuery(params)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }
}
