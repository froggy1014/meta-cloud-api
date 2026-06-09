// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/whatsapp-business-accounts/

import type { Paging, ResponseSuccess } from '../../../types/request';

/**
 * WhatsApp Business Account subscription configuration
 */
export type WabaSubscription = {
    whatsapp_business_api_data: {
        id: string;
        link: string;
        name: string;
        category: string;
    };
    override_callback_uri?: string;
};

/**
 * Parameters for updating WABA subscription
 */
export interface UpdateWabaSubscription {
    override_callback_uri: string;
    verify_token: string;
}

/**
 * Response containing all WABA subscriptions
 */
export interface WabaSubscriptions {
    data: Array<WabaSubscription>;
}

/**
 * WABA account review status enumeration
 */
export enum WabaAccountReviewStatus {
    Approved = 'APPROVED',
    Active = 'ACTIVE',
    Inactive = 'INACTIVE',
    Disabled = 'DISABLED',
}

/**
 * WABA health status for message sending capability
 */
export enum WabaHealthStatusCanSendMessage {
    Blocked = 'BLOCKED',
    Limited = 'LIMITED',
    Available = 'AVAILABLE',
}

/**
 * WABA account status enumeration
 */
export enum WabaAccountStatus {
    Approved = 'APPROVED',
    Active = 'ACTIVE',
    Inactive = 'INACTIVE',
    Disabled = 'DISABLED',
}

/**
 * Business verification status enumeration
 */
export enum WabaBusinessVerificationStatus {
    Verified = 'verified',
    PendingSubmission = 'pending_submission',
    Unverified = 'unverified',
    Rejected = 'rejected',
}

/**
 * WABA health status error details
 */
export interface WabaHealthStatusError {
    error_code?: number;
    error_description?: string;
    possible_solution?: string;
}

/**
 * WABA health status entity information
 */
export interface WabaHealthStatusEntity {
    entity_type?: string;
    id?: string;
    can_send_message?: string;
    errors?: WabaHealthStatusError[];
}

/**
 * Overall WABA health status
 */
export interface WabaHealthStatus {
    can_send_message?: WabaHealthStatusCanSendMessage;
    entities?: WabaHealthStatusEntity[];
}

/**
 * WhatsApp Business Account information
 */
export interface WabaAccount {
    account_review_status?: WabaAccountReviewStatus;
    id?: string;
    health_status?: WabaHealthStatus;
    status?: WabaAccountStatus;
    business_verification_status?: WabaBusinessVerificationStatus;
    message_template_namespace?: string;
    name?: string;
    ownership_type?: string;
    timezone_id?: string;
    primary_business_location?: Record<string, unknown> | string;
    currency?: string;
    country?: string;
    analytics?: Record<string, unknown>;
    is_enabled_for_insights?: boolean;
    is_shared_with_partners?: boolean;
    marketing_messages_lite_api_status?: string;
    marketing_messages_onboarding_status?: string;
    on_behalf_of_business_info?: Record<string, unknown>;
    primary_funding_id?: string;
    purchase_order_number?: string;
    whatsapp_business_manager_messaging_limit?: string;
}

/**
 * Available fields for WABA account queries
 */
export type WabaAccountFields =
    | 'id'
    | 'name'
    | 'timezone_id'
    | 'account_review_status'
    | 'auth_international_rate_eligibility'
    | 'business_verification_status'
    | 'country'
    | 'currency'
    | 'health_status'
    | 'status'
    | 'ownership_type'
    | 'message_template_namespace'
    | 'primary_business_location'
    | 'analytics'
    | 'is_enabled_for_insights'
    | 'is_shared_with_partners'
    | 'marketing_messages_lite_api_status'
    | 'marketing_messages_onboarding_status'
    | 'on_behalf_of_business_info'
    | 'primary_funding_id'
    | 'purchase_order_number'
    | 'whatsapp_business_manager_messaging_limit';

/**
 * Parameter type for specifying which WABA account fields to retrieve
 */
export type WabaAccountFieldsParam = WabaAccountFields[];

export type WabaGraphObject = Record<string, unknown>;

export type WabaFieldsParam = string[] | string;

export type WabaListParams = {
    fields?: WabaFieldsParam;
    filtering?: WabaGraphObject[] | string;
    sort?: string;
    limit?: number;
    after?: string;
    before?: string;
};

export type WabaListResponse<T = WabaGraphObject> = {
    data: T[];
    paging?: Paging;
    summary?: WabaGraphObject;
};

export type UpdateWabaAccountRequest = {
    name?: string;
    timezone_id?: string;
    [key: string]: unknown;
};

export type AssignedUsersListParams = WabaListParams & {
    business: string;
};

export type AssignedUserRequest = {
    user: string;
    tasks: string[];
};

export type RemoveAssignedUserRequest = {
    user: string;
    [key: string]: unknown;
};

export type CreateOBOMobilityIntentRequest = {
    intent?: string;
    [key: string]: unknown;
};

export type SetOBOMobilityIntentRequest = {
    [key: string]: unknown;
};

export type CreateScheduleRequest = {
    name?: string;
    schedule_type?: string;
    [key: string]: unknown;
};

export type UpdateWhatsAppBusinessProfileRequest = {
    [key: string]: unknown;
};

/**
 * Interface defining all WABA API methods
 */
export interface WABAClass {
    getWabaAccount(fields?: WabaAccountFieldsParam): Promise<WabaAccount>;
    updateWabaAccount(params: UpdateWabaAccountRequest): Promise<ResponseSuccess>;
    getWabaActivities(params?: WabaListParams): Promise<WabaListResponse>;
    getAllWabaSubscriptions(): Promise<WabaSubscriptions>;
    updateWabaSubscription(params: UpdateWabaSubscription): Promise<ResponseSuccess>;
    unsubscribeFromWaba(): Promise<ResponseSuccess>;
    getAssignedUsers(params: AssignedUsersListParams, wabaId?: string): Promise<WabaListResponse>;
    addAssignedUser(params: AssignedUserRequest, wabaId?: string): Promise<ResponseSuccess>;
    removeAssignedUser(params: RemoveAssignedUserRequest, wabaId?: string): Promise<ResponseSuccess>;
    getInProgressOnBehalfRequests(params?: WabaListParams, wabaId?: string): Promise<WabaListResponse>;
    getOBOMobilityIntent(oboMobilityIntentId: string, fields?: WabaFieldsParam): Promise<WabaGraphObject>;
    createOBOMobilityIntent(params: CreateOBOMobilityIntentRequest, wabaId?: string): Promise<WabaGraphObject>;
    setOBOMobilityIntent(params: SetOBOMobilityIntentRequest, wabaId?: string): Promise<WabaGraphObject>;
    getWabaSchedules(params?: WabaListParams, wabaId?: string): Promise<WabaListResponse>;
    createWabaSchedule(params: CreateScheduleRequest, wabaId?: string): Promise<WabaGraphObject>;
    getWhatsAppBusinessBotDetails(botId: string, fields?: WabaFieldsParam): Promise<WabaGraphObject>;
    getWhatsAppBusinessProfileDetails(profileId: string, fields?: WabaFieldsParam): Promise<WabaGraphObject>;
    updateWhatsAppBusinessProfile(
        profileId: string,
        params: UpdateWhatsAppBusinessProfileRequest,
    ): Promise<ResponseSuccess>;
}
