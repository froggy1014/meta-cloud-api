// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/overview/

// Endpoints:
// - GET /{APPLICATION_ID}/connected_client_businesses
// - POST /{BUSINESS_ID}/add_phone_numbers
// - GET /{BUSINESS_ID}
// - GET /{BUSINESS_ID}/preverified_numbers
// - GET /{BUSINESS_ID}/client_whatsapp_business_accounts
// - POST /{BUSINESS_ID}/onboard_partners_to_mm_lite
// - GET /{BUSINESS_ID}/owned_whatsapp_business_accounts
// - POST /{BUSINESS_ID}/share_preverified_numbers
// - GET /{BUSINESS_ID}/extendedcredits
// - GET /{USER_ID}/assigned_whatsapp_business_accounts
// - GET /{WHATSAPP_ACCOUNT_NUMBER_ID}
// - GET /{PRE_VERIFIED_PHONE_NUMBER_ID}
// - DELETE /{PRE_VERIFIED_PHONE_NUMBER_ID}
// - GET /{PRE_VERIFIED_PHONE_NUMBER_ID}/partners
// - POST /{PRE_VERIFIED_PHONE_NUMBER_ID}/request_code
// - POST /{PRE_VERIFIED_PHONE_NUMBER_ID}/verify_code

import { BaseAPI } from '../../types/base';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import type { ResponseSuccess } from '../../types/request';
import { objectToQueryString } from '../../utils/objectToQueryString';

import type * as business from './types';

export default class BusinessApi extends BaseAPI implements business.BusinessClass {
    private toQuery(params?: business.BusinessListParams): string {
        if (!params) return '';

        const fields = Array.isArray(params.fields) ? params.fields.join(',') : params.fields;
        const filtering = Array.isArray(params.filtering) ? JSON.stringify(params.filtering) : params.filtering;

        return objectToQueryString({
            fields,
            filtering,
            sort: params.sort,
            limit: params.limit,
            after: params.after,
            before: params.before,
        });
    }

    private fieldsQuery(fields?: business.BusinessFieldsParam): string {
        const fieldsValue = Array.isArray(fields) ? fields.join(',') : fields;
        return fieldsValue ? objectToQueryString({ fields: fieldsValue }) : '';
    }

    async getConnectedClientBusinesses(
        applicationId: string = this.config[WabaConfigEnum.AppId],
        params?: business.BusinessListParams,
    ): Promise<business.BusinessGraphListResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${applicationId}/connected_client_businesses${this.toQuery(params)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async addPhoneNumbers(businessId: string, request: business.AddPhoneNumbersRequest): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${businessId}/add_phone_numbers`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(request),
        );
    }

    async getBusinessPortfolio(
        businessId: string,
        fields?: business.BusinessFieldsParam,
    ): Promise<business.BusinessGraphObject> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${businessId}${this.fieldsQuery(fields)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async getPreVerifiedPhoneNumbers(
        businessId: string,
        params?: business.BusinessListParams,
    ): Promise<business.BusinessGraphListResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${businessId}/preverified_numbers${this.toQuery(params)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async getClientWhatsAppBusinessAccounts(
        businessId: string,
        params?: business.BusinessListParams,
    ): Promise<business.BusinessGraphListResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${businessId}/client_whatsapp_business_accounts${this.toQuery(params)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async onboardPartnersToMMLite(
        businessId: string,
        request: business.OnboardPartnersToMMLiteRequest,
    ): Promise<business.BusinessGraphObject> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${businessId}/onboard_partners_to_mm_lite`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(request),
        );
    }

    async getOwnedWhatsAppBusinessAccounts(
        businessId: string,
        params?: business.BusinessListParams,
    ): Promise<business.BusinessGraphListResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${businessId}/owned_whatsapp_business_accounts${this.toQuery(params)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async sharePreVerifiedPhoneNumber(
        businessId: string,
        request: business.SharePreVerifiedPhoneNumberRequest,
    ): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${businessId}/share_preverified_numbers`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(request),
        );
    }

    async getCreditLines(businessId: string): Promise<business.BusinessGraphListResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${businessId}/extendedcredits`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async getAssignedWhatsAppBusinessAccounts(
        userId: string,
        params?: business.BusinessListParams,
    ): Promise<business.BusinessGraphListResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${userId}/assigned_whatsapp_business_accounts${this.toQuery(params)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async getWhatsAppAccountNumberDetails(
        accountNumberId: string,
        fields?: business.BusinessFieldsParam,
    ): Promise<business.BusinessGraphObject> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${accountNumberId}${this.fieldsQuery(fields)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async getPreVerifiedPhoneNumberDetails(
        preVerifiedPhoneNumberId: string,
        fields?: business.BusinessFieldsParam,
    ): Promise<business.BusinessGraphObject> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${preVerifiedPhoneNumberId}${this.fieldsQuery(fields)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async deletePreVerifiedPhoneNumber(preVerifiedPhoneNumberId: string): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Delete,
            preVerifiedPhoneNumberId,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async getPreVerifiedPhoneNumberPartners(
        preVerifiedPhoneNumberId: string,
        params?: business.BusinessListParams,
    ): Promise<business.BusinessGraphListResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${preVerifiedPhoneNumberId}/partners${this.toQuery(params)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async requestPreVerifiedPhoneNumberCode(
        preVerifiedPhoneNumberId: string,
        request: business.RequestPreVerifiedPhoneNumberCodeRequest,
    ): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${preVerifiedPhoneNumberId}/request_code`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(request),
        );
    }

    async verifyPreVerifiedPhoneNumberCode(
        preVerifiedPhoneNumberId: string,
        request: business.VerifyPreVerifiedPhoneNumberCodeRequest,
    ): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${preVerifiedPhoneNumberId}/verify_code`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(request),
        );
    }
}
