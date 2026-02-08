// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/reference/

// Endpoints:
// - POST /{PHONE_NUMBER_ID}/settings
// - GET /{PHONE_NUMBER_ID}/settings?fields&include_sip_credentials
// - GET /{PHONE_NUMBER_ID}/call_permissions?user_wa_id
// - POST /{PHONE_NUMBER_ID}/calls

import { BaseAPI } from '../../types/base';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import type { ResponseSuccess } from '../../types/request';
import { objectToQueryString } from '../../utils/objectToQueryString';

import type * as calling from './types';

/**
 * API for WhatsApp Calling features.
 */
export default class CallingApi extends BaseAPI implements calling.CallingClass {
    private readonly endpoint = 'calls';

    async updateCallingSettings(params: calling.UpdateCallingSettingsRequest): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/settings`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(params),
        );
    }

    async getCallingSettings(params?: {
        fields?: string[] | string;
        include_sip_credentials?: boolean;
    }): Promise<calling.CallingSettingsResponse> {
        const fieldsValue = Array.isArray(params?.fields) ? params?.fields.join(',') : params?.fields;
        const queryParams = objectToQueryString({
            ...(fieldsValue ? { fields: fieldsValue } : {}),
            ...(params?.include_sip_credentials !== undefined
                ? { include_sip_credentials: params.include_sip_credentials }
                : {}),
        });
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/settings${queryParams}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async getCallPermissions(params: { userWaId: string }): Promise<calling.CallPermissionsResponse> {
        const queryParams = objectToQueryString({ user_wa_id: params.userWaId });
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/call_permissions${queryParams}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async initiateCall(params: calling.InitiateCallRequest): Promise<calling.InitiateCallResponse> {
        const body = {
            messaging_product: 'whatsapp',
            to: params.to,
            action: 'connect',
            session: params.session,
        } as {
            messaging_product: 'whatsapp';
            to: string;
            action: calling.CallAction;
            session: calling.CallSession;
            biz_opaque_callback_data?: string;
        };

        if (params.biz_opaque_callback_data) {
            body.biz_opaque_callback_data = params.biz_opaque_callback_data;
        }

        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }

    async preAcceptCall(params: calling.PreAcceptCallRequest): Promise<calling.CallActionResponse> {
        const body = {
            messaging_product: 'whatsapp',
            call_id: params.call_id,
            action: 'pre_accept',
        } as {
            messaging_product: 'whatsapp';
            call_id: string;
            action: calling.CallAction;
            session?: calling.CallSession;
        };

        if (params.session) body.session = params.session;

        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }

    async acceptCall(params: calling.AcceptCallRequest): Promise<calling.CallActionResponse> {
        const body = {
            messaging_product: 'whatsapp',
            call_id: params.call_id,
            action: 'accept',
        } as {
            messaging_product: 'whatsapp';
            call_id: string;
            action: calling.CallAction;
            session?: calling.CallSession;
            biz_opaque_callback_data?: string;
        };

        if (params.session) body.session = params.session;
        if (params.biz_opaque_callback_data) {
            body.biz_opaque_callback_data = params.biz_opaque_callback_data;
        }

        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }

    async rejectCall(params: calling.RejectCallRequest): Promise<calling.CallActionResponse> {
        const body = {
            messaging_product: 'whatsapp',
            call_id: params.call_id,
            action: 'reject',
        };

        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }

    async terminateCall(params: calling.TerminateCallRequest): Promise<calling.CallActionResponse> {
        const body = {
            messaging_product: 'whatsapp',
            call_id: params.call_id,
            action: 'terminate',
        };

        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }
}
