import type { ResponseSuccess } from '../../../types/request';

/**
 * Payments API Types (India Payment Configuration)
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/onboarding-apis/
 */

export type PaymentConfigurationProvider = 'upi_vpa' | 'razorpay' | 'payu' | 'zaakpay';

export type PaymentConfigurationStatus = 'Active' | 'Needs_Connecting' | 'Needs_Testing';

export type PaymentConfigurationCode = {
    code: string;
    description?: string;
};

export type PaymentConfiguration = {
    configuration_name: string;
    provider_name: string;
    provider_mid?: string;
    status?: PaymentConfigurationStatus;
    merchant_category_code?: PaymentConfigurationCode;
    purpose_code?: PaymentConfigurationCode;
    created_timestamp?: number;
    updated_timestamp?: number;
};

export type PaymentConfigurationsResponse = {
    data: Array<{
        payment_configurations: PaymentConfiguration[];
    }>;
};

export type PaymentConfigurationCreateRequest = {
    configuration_name: string;
    provider_name: PaymentConfigurationProvider;
    purpose_code?: string;
    merchant_category_code?: string;
    redirect_url?: string;
    merchant_vpa?: string;
};

export type PaymentConfigurationUpdateRequest = {
    provider_name?: PaymentConfigurationProvider;
    purpose_code?: string;
    merchant_category_code?: string;
    redirect_url?: string;
    merchant_vpa?: string;
};

export type PaymentConfigurationCreateResponse = {
    success: boolean;
    oauth_url?: string;
    expiration?: number;
};

export type PaymentConfigurationUpdateResponse = PaymentConfigurationCreateResponse;

export type PaymentConfigurationOauthLinkRequest = {
    configuration_name: string;
    redirect_url?: string;
};

export type PaymentConfigurationOauthLinkResponse = {
    oauth_url: string;
    expiration?: number;
};

export type PaymentConfigurationDeleteRequest = {
    configuration_name: string;
};

export interface PaymentsClass {
    listPaymentConfigurations(wabaId: string): Promise<PaymentConfigurationsResponse>;
    getPaymentConfiguration(wabaId: string, configurationName: string): Promise<PaymentConfigurationsResponse>;
    createPaymentConfiguration(
        wabaId: string,
        params: PaymentConfigurationCreateRequest,
    ): Promise<PaymentConfigurationCreateResponse>;
    updatePaymentConfiguration(
        wabaId: string,
        configurationName: string,
        params: PaymentConfigurationUpdateRequest,
    ): Promise<PaymentConfigurationUpdateResponse>;
    generatePaymentConfigurationOauthLink(
        wabaId: string,
        params: PaymentConfigurationOauthLinkRequest,
    ): Promise<PaymentConfigurationOauthLinkResponse>;
    deletePaymentConfiguration(wabaId: string, params: PaymentConfigurationDeleteRequest): Promise<ResponseSuccess>;
}
