// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/onboarding-apis/

// Endpoints:
// - GET /{WABA_ID}/payment_configurations
// - GET /{WABA_ID}/payment_configuration/{CONFIGURATION_NAME}
// - POST /{WABA_ID}/payment_configuration
// - POST /{WABA_ID}/payment_configuration/{CONFIGURATION_NAME}
// - POST /{WABA_ID}/generate_payment_configuration_oauth_link
// - DELETE /{WABA_ID}/payment_configuration

import { BaseAPI } from '../../types/base';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import type { ResponseSuccess } from '../../types/request';

import type * as payments from './types';

/**
 * API for WhatsApp Payments (India payment configuration).
 *
 * Provides methods to manage payment configurations for WhatsApp Business Accounts,
 * including creating, reading, updating, and deleting payment configurations,
 * as well as generating OAuth links for payment onboarding.
 *
 * Endpoints covered:
 * - `GET /{WABA_ID}/payment_configurations` - List all payment configurations
 * - `GET /{WABA_ID}/payment_configuration/{CONFIGURATION_NAME}` - Get a specific payment configuration
 * - `POST /{WABA_ID}/payment_configuration` - Create a new payment configuration
 * - `POST /{WABA_ID}/payment_configuration/{CONFIGURATION_NAME}` - Update a payment configuration
 * - `POST /{WABA_ID}/generate_payment_configuration_oauth_link` - Generate an OAuth link
 * - `DELETE /{WABA_ID}/payment_configuration` - Delete a payment configuration
 *
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/onboarding-apis/
 */
export default class PaymentsApi extends BaseAPI implements payments.PaymentsClass {
    /**
     * List all payment configurations for a WhatsApp Business Account.
     *
     * @param wabaId - The WhatsApp Business Account ID.
     * @returns A list of all payment configurations.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/onboarding-apis/
     */
    async listPaymentConfigurations(wabaId: string): Promise<payments.PaymentConfigurationsResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `/${wabaId}/payment_configurations`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    /**
     * Get a specific payment configuration by name.
     *
     * @param wabaId - The WhatsApp Business Account ID.
     * @param configurationName - The name of the payment configuration to retrieve.
     * @returns The payment configuration details.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/onboarding-apis/
     */
    async getPaymentConfiguration(
        wabaId: string,
        configurationName: string,
    ): Promise<payments.PaymentConfigurationsResponse> {
        const encodedName = encodeURIComponent(configurationName);
        return this.sendJson(
            HttpMethodsEnum.Get,
            `/${wabaId}/payment_configuration/${encodedName}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    /**
     * Create a new payment configuration for a WhatsApp Business Account.
     *
     * @param wabaId - The WhatsApp Business Account ID.
     * @param params - The payment configuration details to create.
     * @returns The created payment configuration response.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/onboarding-apis/
     */
    async createPaymentConfiguration(
        wabaId: string,
        params: payments.PaymentConfigurationCreateRequest,
    ): Promise<payments.PaymentConfigurationCreateResponse> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `/${wabaId}/payment_configuration`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(params),
        );
    }

    /**
     * Update an existing payment configuration.
     *
     * @param wabaId - The WhatsApp Business Account ID.
     * @param configurationName - The name of the payment configuration to update.
     * @param params - The payment configuration fields to update.
     * @returns The updated payment configuration response.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/onboarding-apis/
     */
    async updatePaymentConfiguration(
        wabaId: string,
        configurationName: string,
        params: payments.PaymentConfigurationUpdateRequest,
    ): Promise<payments.PaymentConfigurationUpdateResponse> {
        const encodedName = encodeURIComponent(configurationName);
        return this.sendJson(
            HttpMethodsEnum.Post,
            `/${wabaId}/payment_configuration/${encodedName}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(params),
        );
    }

    /**
     * Generate an OAuth link for payment configuration onboarding.
     *
     * @param wabaId - The WhatsApp Business Account ID.
     * @param params - The OAuth link generation parameters.
     * @returns The generated OAuth link response.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/onboarding-apis/
     */
    async generatePaymentConfigurationOauthLink(
        wabaId: string,
        params: payments.PaymentConfigurationOauthLinkRequest,
    ): Promise<payments.PaymentConfigurationOauthLinkResponse> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `/${wabaId}/generate_payment_configuration_oauth_link`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(params),
        );
    }

    /**
     * Delete a payment configuration from a WhatsApp Business Account.
     *
     * @param wabaId - The WhatsApp Business Account ID.
     * @param params - The payment configuration deletion parameters (includes configuration name).
     * @returns A success response confirming deletion.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/onboarding-apis/
     */
    async deletePaymentConfiguration(
        wabaId: string,
        params: payments.PaymentConfigurationDeleteRequest,
    ): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Delete,
            `/${wabaId}/payment_configuration`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(params),
        );
    }
}
