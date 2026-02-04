// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/onboarding-apis/

// Endpoints:
// - GET /{WABA_ID}/payment_configurations
// - GET /{WABA_ID}/payment_configuration/{CONFIGURATION_NAME}
// - POST /{WABA_ID}/payment_configuration
// - POST /{WABA_ID}/payment_configuration/{CONFIGURATION_NAME}
// - POST /{WABA_ID}/generate_payment_configuration_oauth_link
// - DELETE /{WABA_ID}/payment_configuration

import { BaseAPI } from '../../types/base';
import type { WabaConfigType } from '../../types/config';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import type { RequesterClass, ResponseSuccess } from '../../types/request';

import type * as payments from './types';

/**
 * API for WhatsApp Payments (India payment configuration).
 */
export default class PaymentsApi extends BaseAPI implements payments.PaymentsClass {
    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    async listPaymentConfigurations(wabaId: string): Promise<payments.PaymentConfigurationsResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `/${wabaId}/payment_configurations`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

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
