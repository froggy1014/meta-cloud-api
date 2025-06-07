import type { ResponseSuccess } from '../../types/request';

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
    currency?: string;
}

/**
 * Available fields for WABA account queries
 */
export type WabaAccountFields =
    | 'id'
    | 'name'
    | 'account_review_status'
    | 'auth_international_rate_eligibility'
    | 'business_verification_status'
    | 'country'
    | 'currency'
    | 'health_status'
    | 'status'
    | 'ownership_type'
    | 'message_template_namespace';

/**
 * Parameter type for specifying which WABA account fields to retrieve
 */
export type WabaAccountFieldsParam = WabaAccountFields[];

/**
 * Interface defining all WABA API methods
 */
export interface WABAClass {
    getWabaAccount(fields?: WabaAccountFieldsParam): Promise<WabaAccount>;
    getAllWabaSubscriptions(): Promise<WabaSubscriptions>;
    updateWabaSubscription(params: UpdateWabaSubscription): Promise<ResponseSuccess>;
    unsubscribeFromWaba(): Promise<ResponseSuccess>;
}
