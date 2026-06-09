// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/overview/

import type { Paging, ResponseSuccess } from '../../../types/request';

export type BusinessGraphObject = Record<string, unknown>;

export type BusinessFieldsParam = string[] | string;

export type CursorPaginationParams = {
    limit?: number;
    after?: string;
    before?: string;
};

export type BusinessGraphListResponse<T = BusinessGraphObject> = {
    data: T[];
    paging?: Paging;
    summary?: BusinessGraphObject;
};

export type BusinessListParams = CursorPaginationParams & {
    fields?: BusinessFieldsParam;
    filtering?: BusinessGraphObject[] | string;
    sort?: string;
};

export type AddPhoneNumbersRequest = {
    phone_number: string;
    verified_name?: string;
    [key: string]: unknown;
};

export type SharePreVerifiedPhoneNumberRequest = {
    preverified_phone_number_id: string;
    partner_business_id: string;
    [key: string]: unknown;
};

export type OnboardPartnersToMMLiteRequest = {
    solution_id?: string;
    [key: string]: unknown;
};

export type RequestPreVerifiedPhoneNumberCodeRequest = {
    code_method: 'SMS' | 'VOICE';
    language?: string;
    [key: string]: unknown;
};

export type VerifyPreVerifiedPhoneNumberCodeRequest = {
    code: string;
    [key: string]: unknown;
};

export interface BusinessClass {
    getConnectedClientBusinesses(
        applicationId?: string,
        params?: BusinessListParams,
    ): Promise<BusinessGraphListResponse>;
    addPhoneNumbers(businessId: string, request: AddPhoneNumbersRequest): Promise<ResponseSuccess>;
    getBusinessPortfolio(businessId: string, fields?: BusinessFieldsParam): Promise<BusinessGraphObject>;
    getPreVerifiedPhoneNumbers(businessId: string, params?: BusinessListParams): Promise<BusinessGraphListResponse>;
    getClientWhatsAppBusinessAccounts(
        businessId: string,
        params?: BusinessListParams,
    ): Promise<BusinessGraphListResponse>;
    onboardPartnersToMMLite(businessId: string, request: OnboardPartnersToMMLiteRequest): Promise<BusinessGraphObject>;
    getOwnedWhatsAppBusinessAccounts(
        businessId: string,
        params?: BusinessListParams,
    ): Promise<BusinessGraphListResponse>;
    sharePreVerifiedPhoneNumber(
        businessId: string,
        request: SharePreVerifiedPhoneNumberRequest,
    ): Promise<ResponseSuccess>;
    getCreditLines(businessId: string): Promise<BusinessGraphListResponse>;
    getAssignedWhatsAppBusinessAccounts(
        userId: string,
        params?: BusinessListParams,
    ): Promise<BusinessGraphListResponse>;
    getWhatsAppAccountNumberDetails(
        accountNumberId: string,
        fields?: BusinessFieldsParam,
    ): Promise<BusinessGraphObject>;
    getPreVerifiedPhoneNumberDetails(
        preVerifiedPhoneNumberId: string,
        fields?: BusinessFieldsParam,
    ): Promise<BusinessGraphObject>;
    deletePreVerifiedPhoneNumber(preVerifiedPhoneNumberId: string): Promise<ResponseSuccess>;
    getPreVerifiedPhoneNumberPartners(
        preVerifiedPhoneNumberId: string,
        params?: BusinessListParams,
    ): Promise<BusinessGraphListResponse>;
    requestPreVerifiedPhoneNumberCode(
        preVerifiedPhoneNumberId: string,
        request: RequestPreVerifiedPhoneNumberCodeRequest,
    ): Promise<ResponseSuccess>;
    verifyPreVerifiedPhoneNumberCode(
        preVerifiedPhoneNumberId: string,
        request: VerifyPreVerifiedPhoneNumberCodeRequest,
    ): Promise<ResponseSuccess>;
}
