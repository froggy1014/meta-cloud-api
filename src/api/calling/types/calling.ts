// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/reference/

import type { ResponseSuccess } from '../../../types/request';

/**
 * Calling API Types
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/reference/
 */

export type CallingStatus = 'ENABLED' | 'DISABLED';
export type CallIconVisibility = 'DEFAULT' | 'DISABLE_ALL';
export type CallbackPermissionStatus = 'ENABLED' | 'DISABLED';
export type CallHoursStatus = 'ENABLED' | 'DISABLED';
export type SipStatus = 'ENABLED' | 'DISABLED';

export type CallHoursDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export type WeeklyOperatingHours = {
    day_of_week: CallHoursDay;
    open_time: string;
    close_time: string;
};

export type HolidaySchedule = {
    date: string;
    start_time: string;
    end_time: string;
};

export type CallHours = {
    status: CallHoursStatus;
    timezone_id: string;
    weekly_operating_hours: WeeklyOperatingHours[];
    holiday_schedule?: HolidaySchedule[];
};

export type SipServer = {
    hostname: string;
    port?: number;
    request_uri_user_params?: Record<string, string>;
    sip_user_password?: string;
};

export type SipSettings = {
    status: SipStatus;
    servers?: SipServer[];
};

export type CallingSettings = {
    status?: CallingStatus;
    call_icon_visibility?: CallIconVisibility;
    call_hours?: CallHours;
    callback_permission_status?: CallbackPermissionStatus;
    sip?: SipSettings;
};

export type UpdateCallingSettingsRequest = {
    calling: CallingSettings;
};

export type CallingSettingsResponse = {
    calling?: CallingSettings;
    [key: string]: unknown;
};

export type CallPermission = {
    status: string;
    expiration_time?: number;
};

export type CallPermissionLimit = {
    time_period: string;
    max_allowed: number;
    current_usage: number;
    limit_expiration_time?: number;
};

export type CallPermissionAction = {
    action_name: string;
    can_perform_action: boolean;
    limits?: CallPermissionLimit[];
};

export type CallPermissionsResponse = {
    messaging_product: 'whatsapp';
    permission: CallPermission;
    actions?: CallPermissionAction[];
};

export type CallSdpType = 'offer' | 'answer';

export type CallSession = {
    sdp_type: CallSdpType;
    sdp: string;
};

export type CallAction = 'connect' | 'pre_accept' | 'accept' | 'reject' | 'terminate';

export type InitiateCallRequest = {
    to: string;
    session: CallSession;
    biz_opaque_callback_data?: string;
};

export type PreAcceptCallRequest = {
    call_id: string;
    session?: CallSession;
};

export type AcceptCallRequest = {
    call_id: string;
    session?: CallSession;
    biz_opaque_callback_data?: string;
};

export type RejectCallRequest = {
    call_id: string;
};

export type TerminateCallRequest = {
    call_id: string;
};

export type InitiateCallResponse = {
    messaging_product: 'whatsapp';
    calls: Array<{ id: string }>;
};

export type CallActionResponse = {
    messaging_product: 'whatsapp';
    success: boolean;
};

export interface CallingClass {
    updateCallingSettings(params: UpdateCallingSettingsRequest): Promise<ResponseSuccess>;
    getCallingSettings(params?: {
        fields?: string[] | string;
        include_sip_credentials?: boolean;
    }): Promise<CallingSettingsResponse>;
    getCallPermissions(params: { userWaId: string }): Promise<CallPermissionsResponse>;
    initiateCall(params: InitiateCallRequest): Promise<InitiateCallResponse>;
    preAcceptCall(params: PreAcceptCallRequest): Promise<CallActionResponse>;
    acceptCall(params: AcceptCallRequest): Promise<CallActionResponse>;
    rejectCall(params: RejectCallRequest): Promise<CallActionResponse>;
    terminateCall(params: TerminateCallRequest): Promise<CallActionResponse>;
}
