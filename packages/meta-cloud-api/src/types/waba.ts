import type { RequesterResponseInterface, ResponseSuccess } from './request';

export type WabaSubscription = {
    whatsapp_business_api_data: {
        id: string;
        link: string;
        name: string;
        category: string;
    };
    override_callback_uri?: string;
};

export interface UpdateWabaSubscription {
    override_callback_uri: string;
    verify_token: string;
}

export interface WabaSubscriptions {
    data: Array<WabaSubscription>;
}

export interface WABAClass {
    getWabaAccount(fields?: WabaAccountFieldsParam): Promise<RequesterResponseInterface<WabaAccount>>;
    getAllWabaSubscriptions(): Promise<RequesterResponseInterface<WabaSubscriptions>>;
    updateWabaSubscription(params: UpdateWabaSubscription): Promise<RequesterResponseInterface<ResponseSuccess>>;
    unsubscribeFromWaba(): Promise<RequesterResponseInterface<ResponseSuccess>>;
}

export enum WabaAccountReviewStatus {
    Approved = 'APPROVED',
    Active = 'ACTIVE',
    Inactive = 'INACTIVE',
    Disabled = 'DISABLED',
}

export enum WabaHealthStatusCanSendMessage {
    Blocked = 'BLOCKED',
    Limited = 'LIMITED',
    Available = 'AVAILABLE',
}

export enum WabaAccountStatus {
    Approved = 'APPROVED',
    Active = 'ACTIVE',
    Inactive = 'INACTIVE',
    Disabled = 'DISABLED',
}

export enum WabaBusinessVerificationStatus {
    Verified = 'verified',
    PendingSubmission = 'pending_submission',
    Unverified = 'unverified',
    Rejected = 'rejected',
}

export interface WabaHealthStatusError {
    error_code?: number;
    error_description?: string;
    possible_solution?: string;
}

export interface WabaHealthStatusEntity {
    entity_type?: string;
    id?: string;
    can_send_message?: string;
    errors?: WabaHealthStatusError[];
}

export interface WabaHealthStatus {
    can_send_message?: WabaHealthStatusCanSendMessage;
    entities?: WabaHealthStatusEntity[];
}

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

export type WabaAccountFields =
    | 'analytics'
    | 'business_verification_status'
    | 'country'
    | 'currency'
    | 'health_status'
    | 'is_enabled_for_insights'
    | 'marketing_messages_lite_api_status'
    | 'on_behalf_of_business_info'
    | 'ownership_type'
    | 'primary_funding_id'
    | 'purchase_order_number'
    | 'status'
    | 'timezone_id';

export type WabaAccountFieldsParam = WabaAccountFields[];
