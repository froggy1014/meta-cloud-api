// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/overview/

// Endpoints:
// - GET /{PHONE_NUMBER_ID}/message_history
// - GET /{MESSAGE_HISTORY_ID}/events

import { BaseAPI } from '../../types/base';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import { objectToQueryString } from '../../utils/objectToQueryString';

import type * as messageHistory from './types';

export default class MessageHistoryApi extends BaseAPI implements messageHistory.MessageHistoryClass {
    private resolveFields(fields?: messageHistory.MessageHistoryFieldsParam): string | undefined {
        return Array.isArray(fields) ? fields.join(',') : fields;
    }

    async getMessageHistory(
        params?: messageHistory.MessageHistoryListParams,
    ): Promise<messageHistory.MessageHistoryResponse> {
        const query = params
            ? objectToQueryString({
                  fields: this.resolveFields(params.fields),
                  message_id: params.message_id,
                  start_time: params.start_time,
                  end_time: params.end_time,
                  limit: params.limit,
                  after: params.after,
                  before: params.before,
              })
            : '';

        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/message_history${query}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async getMessageHistoryEvents(
        messageHistoryId: string,
        params?: messageHistory.MessageHistoryEventListParams,
    ): Promise<messageHistory.MessageHistoryResponse> {
        const query = params
            ? objectToQueryString({
                  fields: this.resolveFields(params.fields),
                  status_filter: params.status_filter,
                  limit: params.limit,
                  after: params.after,
                  before: params.before,
              })
            : '';

        return this.sendJson(
            HttpMethodsEnum.Get,
            `${messageHistoryId}/events${query}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }
}
