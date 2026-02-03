// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-profiles/

export * from './common';
export * from './upload';

// Common types
export type {
    BusinessProfileClass,
    BusinessProfileData,
    BusinessProfileField,
    BusinessProfileFieldsParam,
    BusinessProfileResponse,
    UpdateBusinessProfileRequest,
} from './common';

// Upload types
export type {
    CreateUploadSessionParams,
    GetUploadHandleParams,
    UploadBusinessProfileResponse,
    UploadHandle,
    UploadMediaParams,
    UploadSession,
    UploadSessionResponse,
} from './upload';
