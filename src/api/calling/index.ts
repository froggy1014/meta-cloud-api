// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/reference/

import CallingApi from './CallingApi';

export default CallingApi;

export type {
    AcceptCallRequest,
    CallAction,
    CallActionResponse,
    CallAnnouncementLanguage,
    CallbackPermissionStatus,
    CallCaptureStatus,
    CallHours,
    CallHoursDay,
    CallHoursStatus,
    CallIconVisibility,
    CallingClass,
    CallingSettings,
    CallingSettingsResponse,
    CallingStatus,
    CallPermission,
    CallPermissionAction,
    CallPermissionLimit,
    CallPermissionsResponse,
    CallRecordingConfig,
    CallSdpType,
    CallSession,
    CallTranscriptionConfig,
    HolidaySchedule,
    InitiateCallRequest,
    InitiateCallResponse,
    PreAcceptCallRequest,
    RejectCallRequest,
    SipServer,
    SipSettings,
    SipStatus,
    TerminateCallRequest,
    UpdateCallingSettingsRequest,
    WeeklyOperatingHours,
} from './types';
export { CallingApi };
