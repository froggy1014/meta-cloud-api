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
 *
 * Provides methods to manage calling settings, permissions, and call lifecycle
 * (initiate, pre-accept, accept, reject, terminate).
 *
 * Endpoints covered:
 * - `POST /{PHONE_NUMBER_ID}/settings` - Update calling settings
 * - `GET /{PHONE_NUMBER_ID}/settings` - Get calling settings
 * - `GET /{PHONE_NUMBER_ID}/call_permissions` - Get call permissions for a user
 * - `POST /{PHONE_NUMBER_ID}/calls` - Initiate, pre-accept, accept, reject, or terminate a call
 *
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/reference/
 */
export default class CallingApi extends BaseAPI implements calling.CallingClass {
    private readonly endpoint = 'calls';

    /**
     * Update calling settings for the phone number, such as enabling/disabling calling
     * or configuring SIP credentials.
     *
     * @param params - The calling settings to update.
     * @returns A success response confirming the settings were updated.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/reference/
     */
    async updateCallingSettings(params: calling.UpdateCallingSettingsRequest): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/settings`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(params),
        );
    }

    /**
     * Retrieve the current calling settings for the phone number.
     *
     * @param params - Optional query parameters to filter the response.
     * @param params.fields - Specific fields to include in the response.
     * @param params.include_sip_credentials - Whether to include SIP credentials in the response.
     * @returns The current calling settings configuration.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/reference/
     */
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

    /**
     * Get calling permissions for a specific WhatsApp user.
     *
     * @param params - The request parameters.
     * @param params.userWaId - The WhatsApp ID of the user to check permissions for.
     * @returns The call permissions for the specified user.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/reference/
     */
    async getCallPermissions(params: { userWaId: string }): Promise<calling.CallPermissionsResponse> {
        const queryParams = objectToQueryString({ user_wa_id: params.userWaId });
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/call_permissions${queryParams}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    /**
     * Initiate an outbound call to a WhatsApp user.
     *
     * @param params - The call initiation parameters.
     * @param params.to - The recipient's WhatsApp phone number.
     * @param params.session - The call session configuration.
     * @param params.biz_opaque_callback_data - Optional opaque data passed back in webhooks.
     * @returns The initiated call response with call ID and status.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/reference/
     */
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

    /**
     * Pre-accept an incoming call, signaling readiness to connect before full acceptance.
     *
     * @param params - The pre-accept request parameters.
     * @param params.call_id - The ID of the call to pre-accept.
     * @param params.session - Optional session configuration for the call.
     * @returns The call action response confirming the pre-accept.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/reference/
     */
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

    /**
     * Accept an incoming call and establish the connection.
     *
     * @param params - The accept request parameters.
     * @param params.call_id - The ID of the call to accept.
     * @param params.session - Optional session configuration for the call.
     * @param params.biz_opaque_callback_data - Optional opaque data passed back in webhooks.
     * @returns The call action response confirming acceptance.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/reference/
     */
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

    /**
     * Reject an incoming call.
     *
     * @param params - The reject request parameters.
     * @param params.call_id - The ID of the call to reject.
     * @returns The call action response confirming rejection.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/reference/
     */
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

    /**
     * Terminate an active call.
     *
     * @param params - The terminate request parameters.
     * @param params.call_id - The ID of the call to terminate.
     * @returns The call action response confirming termination.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/reference/
     */
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
