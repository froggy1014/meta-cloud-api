// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/reference/

import CallingApi from './CallingApi';

export default CallingApi;

export { CallingApi };

export type {
    AcceptCallRequest,
    CallAction,
    CallActionResponse,
    CallbackPermissionStatus,
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
    CallSdpType,
    CallSession,
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
