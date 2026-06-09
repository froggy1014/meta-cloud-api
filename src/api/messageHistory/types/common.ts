// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/overview/

import type { Paging } from '../../../types/request';

export type MessageHistoryFieldsParam = string[] | string;

export type MessageHistoryListParams = {
    fields?: MessageHistoryFieldsParam;
    message_id?: string;
    start_time?: string | number;
    end_time?: string | number;
    limit?: number;
    after?: string;
    before?: string;
};

export type MessageHistoryEventListParams = {
    status_filter?: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | (string & {});
    fields?: MessageHistoryFieldsParam;
    limit?: number;
    after?: string;
    before?: string;
};

export type MessageHistoryItem = Record<string, unknown>;

export type MessageHistoryResponse<T = MessageHistoryItem> = {
    data: T[];
    paging?: Paging;
    summary?: Record<string, unknown>;
};

export interface MessageHistoryClass {
    getMessageHistory(params?: MessageHistoryListParams): Promise<MessageHistoryResponse>;
    getMessageHistoryEvents(
        messageHistoryId: string,
        params?: MessageHistoryEventListParams,
    ): Promise<MessageHistoryResponse>;
}
