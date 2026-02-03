// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers/

import type { Paging, ResponseSuccess } from '../../../types/request';

export type QualityRating = 'GREEN' | 'YELLOW' | 'RED' | 'NA';

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

export type MessagingLimitTier = 'TIER_50' | 'TIER_250' | 'TIER_1K' | 'TIER_10K' | 'TIER_100K' | 'TIER_UNLIMITED';

export type PlatformType = 'CLOUD_API' | 'ON_PREMISE' | 'NOT_APPLICABLE';

export type ThroughputLevel = 'STANDARD' | 'HIGH' | 'NOT_APPLICABLE';

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
    | 'throughput';

export type PhoneNumberFieldsParam = PhoneNumberField[] | string;

export type PhoneNumberResponse = {
    display_phone_number: string;
    id: string;
    quality_rating: QualityRating;
    verified_name: string;
    account_mode?: AccountMode;
    certificate?: string;
    code_verification_status?: CodeVerificationStatus;
    conversational_automation?: Record<string, unknown>;
    eligibility_for_api_business_global_search?: string;
    health_status?: HealthStatus;
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
    status?: CodeVerificationStatus;
    throughput?: Throughput;
};

export type Cursors = {
    before: string;
    after: string;
};

export type PhoneNumbersResponse = {
    data: PhoneNumberResponse[];
    paging: Paging;
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
    getPhoneNumbers(): Promise<PhoneNumbersResponse>;
    requestVerificationCode(params: RequestVerificationCodeRequest): Promise<ResponseSuccess>;
    verifyCode(params: VerifyCodeRequest): Promise<ResponseSuccess>;
    setConversationalAutomation(params: ConversationalAutomationRequest): Promise<ResponseSuccess>;
    getConversationalAutomation(): Promise<ConversationalAutomationResponse>;
    getThroughput(): Promise<ThroughputResponse>;
}
