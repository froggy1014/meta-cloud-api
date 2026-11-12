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

/**
 * Identify the WhatsApp user by phone number (`userWaId`) or BSUID (`recipient`).
 * At least one is required.
 */
export type GetCallPermissionsParams = {
    userWaId?: string;
    recipient?: string;
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

export type CallCaptureStatus = 'ENABLED' | 'DISABLED';

/**
 * Supported announcement locales for call recording / transcription.
 * The announcement is played to both participants before capture starts.
 */
export type CallAnnouncementLanguage =
    | 'en'
    | 'en_US'
    | 'en_AU'
    | 'en_CA'
    | 'en_GB'
    | 'en_IN'
    | 'en_NZ'
    | 'nl'
    | 'fr'
    | 'de'
    | 'hi'
    | 'it'
    | 'kn'
    | 'pt'
    | 'es'
    | 'es_ES'
    | 'te'
    | 'vi'
    | (string & {});

/**
 * Per-call recording configuration. When status is ENABLED, `purpose` and
 * `announcement_language` are required; the recording arrives via the
 * `call_recording_available` webhook event.
 */
export type CallRecordingConfig = {
    status: CallCaptureStatus;
    /** Reason for recording, max 250 characters — required when status is ENABLED */
    purpose?: string;
    /** Locale of the pre-recording announcement — required when status is ENABLED */
    announcement_language?: CallAnnouncementLanguage;
};

/**
 * Per-call transcription configuration. When status is ENABLED, `purpose` and
 * `announcement_language` are required; the transcript arrives via the
 * `call_transcription_available` webhook event.
 */
export type CallTranscriptionConfig = {
    status: CallCaptureStatus;
    /** Reason for transcription, max 250 characters — required when status is ENABLED */
    purpose?: string;
    /** Locale of the pre-transcription announcement — required when status is ENABLED */
    announcement_language?: CallAnnouncementLanguage;
};

/**
 * ID of the Messaging account handling the call. Include it when the access
 * token has messaging access to more than one Messaging account on the business
 * phone number, and send the same value on every request for a call.
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/account-model-evolution/messaging#calling-api
 */
type MessagingAccountIdParam = {
    messaging_account_id?: string;
};

export type InitiateCallRequest = MessagingAccountIdParam & {
    /** Callee phone number. Required unless `recipient` is provided; takes precedence when both are set. */
    to?: string;
    /** Callee business-scoped user ID (BSUID) or parent BSUID. Use instead of, or in addition to, `to`. */
    recipient?: string;
    session: CallSession;
    biz_opaque_callback_data?: string;
    recording?: CallRecordingConfig;
    transcription?: CallTranscriptionConfig;
};

export type PreAcceptCallRequest = MessagingAccountIdParam & {
    call_id: string;
    session?: CallSession;
};

export type AcceptCallRequest = MessagingAccountIdParam & {
    call_id: string;
    session?: CallSession;
    biz_opaque_callback_data?: string;
    recording?: CallRecordingConfig;
    transcription?: CallTranscriptionConfig;
};

export type RejectCallRequest = MessagingAccountIdParam & {
    call_id: string;
};

export type TerminateCallRequest = MessagingAccountIdParam & {
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
    getCallPermissions(params: GetCallPermissionsParams): Promise<CallPermissionsResponse>;
    initiateCall(params: InitiateCallRequest): Promise<InitiateCallResponse>;
    preAcceptCall(params: PreAcceptCallRequest): Promise<CallActionResponse>;
    acceptCall(params: AcceptCallRequest): Promise<CallActionResponse>;
    rejectCall(params: RejectCallRequest): Promise<CallActionResponse>;
    terminateCall(params: TerminateCallRequest): Promise<CallActionResponse>;
}
