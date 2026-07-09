// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers/

import type { Paging, ResponseSuccess } from '../../../types/request';

export type QualityRating = 'GREEN' | 'YELLOW' | 'RED' | 'NA' | 'UNKNOWN';

export type AccountMode = 'LIVE' | 'SANDBOX';

export type CodeVerificationStatus =
    | 'NOT_VERIFIED'
    | 'VERIFIED'
    | 'EXPIRED'
    | 'PENDING'
    | 'DELETED'
    | 'MIGRATED'
    | 'BANNED'
    | 'RESTRICTED'
    | 'RATE_LIMITED'
    | 'FLAGGED'
    | 'CONNECTED'
    | 'DISCONNECTED'
    | 'UNKNOWN'
    | 'UNVERIFIED';

export type MessagingLimitTier =
    | 'TIER_50'
    | 'TIER_250'
    | 'TIER_1K'
    | 'TIER_2K'
    | 'TIER_10K'
    | 'TIER_100K'
    | 'TIER_UNLIMITED'
    | (string & {});

export type PlatformType = 'CLOUD_API' | 'ON_PREMISE' | 'NOT_APPLICABLE';

export type ThroughputLevel = 'STANDARD' | 'HIGH' | 'NOT_APPLICABLE';

export type PhoneNumberStatus = 'PENDING' | 'LINKED' | 'UNLINKED' | 'DELETED' | 'MIGRATED' | 'BANNED' | 'RESTRICTED';

export type UnifiedCertStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'EXPIRED' | 'NONE' | string;

export type HostPlatform = 'CLOUD_API' | 'ON_PREMISE' | 'NOT_APPLICABLE' | string;

export type HealthStatusEntity = {
    entity_type: string;
    id: string;
    can_send_message: string;
    additional_info?: string[];
    errors?: Array<{
        error_code: number;
        error_description: string;
        possible_solution: string;
    }>;
};

export type HealthStatus = {
    can_send_message: string;
    entities: HealthStatusEntity[];
};

export type QualityScore = {
    score: QualityRating;
};

export type Throughput = {
    level: ThroughputLevel;
};

export type PhoneNumberField =
    | 'country_code'
    | 'country_dial_code'
    | 'display_phone_number'
    | 'id'
    | 'quality_rating'
    | 'verified_name'
    | 'account_mode'
    | 'certificate'
    | 'code_verification_status'
    | 'conversational_automation'
    | 'eligibility_for_api_business_global_search'
    | 'health_status'
    | 'host_platform'
    | 'is_official_business_account'
    | 'is_on_biz_app'
    | 'is_pin_enabled'
    | 'is_preverified_number'
    | 'last_onboarded_time'
    | 'messaging_limit_tier'
    | 'name_status'
    | 'new_certificate'
    | 'new_name_status'
    | 'platform_type'
    | 'quality_score'
    | 'search_visibility'
    | 'status'
    | 'throughput'
    | 'unified_cert_status'
    | 'username';

export type PhoneNumberFieldsParam = PhoneNumberField[] | string;

export type PhoneNumberSort =
    | 'creation_time.asc'
    | 'creation_time.desc'
    | 'last_onboarded_time.asc'
    | 'last_onboarded_time.desc'
    | (string & {});

export type PhoneNumberFilter = Record<string, unknown>;

export type PhoneNumbersListParams = {
    fields?: PhoneNumberFieldsParam;
    filtering?: PhoneNumberFilter[] | string;
    sort?: PhoneNumberSort;
    limit?: number;
    after?: string;
    before?: string;
};

export type GraphObject = Record<string, unknown>;

export type CreatePhoneNumberRequest = {
    cc?: string;
    phone_number?: string;
    verified_name?: string;
    preverified_id?: string;
    [key: string]: unknown;
};

export type CreatePhoneNumberResponse = {
    id: string;
    [key: string]: unknown;
};

export type UpdatePhoneNumberStatusRequest = {
    connection_status?: 'CONNECTED' | 'DISCONNECTED' | (string & {});
    webhook_url?: string;
    whatsapp_business_api_data?: Record<string, unknown>;
    pin?: string;
};

export type PhoneNumberSettingsFieldsParam = string[] | string;

export type PhoneNumberSettingsParams = {
    fields?: PhoneNumberSettingsFieldsParam;
    include_sip_credentials?: boolean;
};

export type PhoneNumberSettingsResponse = GraphObject;

export type UpdatePhoneNumberSettingsRequest = {
    calling?: GraphObject;
    [key: string]: unknown;
};

export type OfficialBusinessAccountStatusResponse = GraphObject;

export type OfficialBusinessAccountAction = 'SUBMIT_APPLICATION' | 'WITHDRAW_APPLICATION' | 'RESUBMIT_APPLICATION';

export type OfficialBusinessAccountApplicationData = {
    business_name?: string;
    business_description?: string;
    /**
     * OBA examples use `website_url`, while the schema also exposes `business_website_url`.
     * Both are accepted to track Meta's published OpenAPI variants.
     */
    website_url?: string;
    business_website_url?: string;
    contact_email?: string;
    primary_country_of_operation?: string;
    primary_language?: string;
    parent_business_or_brand?: string;
    [key: string]: unknown;
};

export type UpdateOfficialBusinessAccountStatusRequest = {
    action?: OfficialBusinessAccountAction | (string & {});
    application_data?: OfficialBusinessAccountApplicationData;
    business_website_url?: string;
    primary_country_of_operation?: string;
    [key: string]: unknown;
};

export type BusinessComplianceInfoResponse = GraphObject;

export type UpdateBusinessComplianceInfoRequest = {
    [key: string]: unknown;
};

export type PhoneNumberResponse = {
    display_phone_number: string;
    id: string;
    quality_rating: QualityRating;
    verified_name: string;
    account_mode?: AccountMode;
    certificate?: string;
    code_verification_status?: CodeVerificationStatus;
    conversational_automation?: Record<string, unknown>;
    country_code?: string;
    country_dial_code?: string;
    eligibility_for_api_business_global_search?: string;
    health_status?: HealthStatus;
    host_platform?: HostPlatform;
    is_official_business_account?: boolean;
    is_on_biz_app?: boolean;
    is_pin_enabled?: boolean;
    is_preverified_number?: boolean;
    last_onboarded_time?: string;
    messaging_limit_tier?: MessagingLimitTier;
    name_status?: string;
    new_certificate?: string;
    new_name_status?: string;
    platform_type?: PlatformType;
    quality_score?: QualityScore;
    search_visibility?: string;
    status?: PhoneNumberStatus | CodeVerificationStatus;
    throughput?: Throughput;
    unified_cert_status?: UnifiedCertStatus;
    username?: string;
};

export type Cursors = {
    before: string;
    after: string;
};

export type PhoneNumbersResponse = {
    data: PhoneNumberResponse[];
    paging: Paging;
};

/**
 * Username status.
 *
 * - "approved" — Username has been approved and will be visible when the feature is available
 * - "reserved" — Username is reserved and approved, but not yet visible to users
 */
export type UsernameStatus = 'approved' | 'reserved' | (string & {});

/**
 * Behavior when the desired username is already in use by another phone number
 * in the same portfolio.
 *
 * - "none"           — Default; do not transfer a username already in use elsewhere
 * - "force_transfer" — Move the username from another phone number in the portfolio.
 *   If the API returns error code 147005, retry the request with "force_transfer".
 */
export type UsernameTransferAction = 'none' | 'force_transfer';

export type UpdateUsernameRequest = {
    username: string;
    /** Optional. Defaults to "none". */
    transfer_action?: UsernameTransferAction;
};

export type UsernameResponse = {
    username?: string;
    status?: UsernameStatus;
    [key: string]: unknown;
};

export type UsernameSuggestionsResponse = {
    [key: string]: unknown;
};

export type RequestVerificationCodeRequest = {
    code_method: 'SMS' | 'VOICE';
    language: string;
};

export type VerifyCodeRequest = {
    code: string;
};

export type TwoStepVerificationParams = {
    pin: string;
};

/**
 * Conversational Components - Commands
 */
export type ConversationalCommand = {
    command_name: string;
    command_description: string;
};

/**
 * Conversational Components - Ice Breakers (Prompts)
 */
export type ConversationalPrompt = string;

/**
 * Request payload for configuring conversational automation
 */
export type ConversationalAutomationRequest = {
    enable_welcome_message?: boolean;
    commands?: ConversationalCommand[];
    prompts?: ConversationalPrompt[];
};

/**
 * Response from conversational automation GET endpoint
 */
export type ConversationalAutomationResponse = {
    enable_welcome_message?: boolean;
    commands?: ConversationalCommand[];
    prompts?: ConversationalPrompt[];
    id: string;
};

/**
 * Response from throughput GET endpoint
 */
export type ThroughputResponse = {
    throughput: Throughput;
    id: string;
};

export interface PhoneNumberClass {
    getPhoneNumberById(fields?: PhoneNumberFieldsParam): Promise<PhoneNumberResponse>;
    getPhoneNumbers(params?: PhoneNumbersListParams): Promise<PhoneNumbersResponse>;
    createPhoneNumber(request: CreatePhoneNumberRequest, wabaId?: string): Promise<CreatePhoneNumberResponse>;
    updatePhoneNumberStatus(request: UpdatePhoneNumberStatusRequest): Promise<ResponseSuccess>;
    requestVerificationCode(params: RequestVerificationCodeRequest): Promise<ResponseSuccess>;
    verifyCode(params: VerifyCodeRequest): Promise<ResponseSuccess>;
    getPhoneNumberSettings(params?: PhoneNumberSettingsParams): Promise<PhoneNumberSettingsResponse>;
    updatePhoneNumberSettings(params: UpdatePhoneNumberSettingsRequest): Promise<ResponseSuccess>;
    setConversationalAutomation(params: ConversationalAutomationRequest): Promise<ResponseSuccess>;
    getConversationalAutomation(): Promise<ConversationalAutomationResponse>;
    getThroughput(): Promise<ThroughputResponse>;
    getOfficialBusinessAccountStatus(): Promise<OfficialBusinessAccountStatusResponse>;
    updateOfficialBusinessAccountStatus(params: UpdateOfficialBusinessAccountStatusRequest): Promise<ResponseSuccess>;
    getBusinessComplianceInfo(): Promise<BusinessComplianceInfoResponse>;
    updateBusinessComplianceInfo(params: UpdateBusinessComplianceInfoRequest): Promise<ResponseSuccess>;
    getUsername(): Promise<UsernameResponse>;
    updateUsername(params: UpdateUsernameRequest): Promise<ResponseSuccess>;
    deleteUsername(): Promise<ResponseSuccess>;
    getUsernameSuggestions(): Promise<UsernameSuggestionsResponse>;
}
