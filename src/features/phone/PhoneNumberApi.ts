import { BaseAPI } from '../../shared/types/base';
import type { WabaConfigType } from '../../shared/types/config';
import { HttpMethodsEnum, WabaConfigEnum } from '../../shared/types/enums';
import type { RequesterClass, ResponseSuccess } from '../../shared/types/request';
import { objectToQueryString } from '../../shared/utils/objectToQueryString';

import type * as phoneNumber from './types';

/**
 * API for managing WhatsApp Phone Numbers.
 *
 * This API allows you to:
 * - Get phone number information by ID
 * - Get all phone numbers for a business account
 * - Request verification codes for phone numbers
 * - Verify phone numbers with codes
 */
export default class PhoneNumberApi extends BaseAPI implements phoneNumber.PhoneNumberClass {
    private readonly endpoint = 'phone_numbers';

    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    /**
     * Get phone number information by ID.
     *
     * @param fields Optional comma-separated list of fields to include in the response
     * @returns Phone number information including verification status, quality rating, etc.
     *
     * @example
     * const phoneNumber = await whatsappClient.phoneNumber.getPhoneNumberById();
     * const phoneNumberWithFields = await whatsappClient.phoneNumber.getPhoneNumberById('display_phone_number,verified_name');
     */
    async getPhoneNumberById(fields?: string): Promise<phoneNumber.PhoneNumberResponse> {
        const queryParams = fields ? objectToQueryString({ fields }) : '';
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.PhoneNumberId]}${queryParams}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    /**
     * Get all phone numbers for the business account.
     *
     * @returns List of phone numbers associated with the business account
     *
     * @example
     * const phoneNumbers = await whatsappClient.phoneNumber.getPhoneNumbers();
     */
    async getPhoneNumbers(): Promise<phoneNumber.PhoneNumbersResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    /**
     * Request a verification code for the phone number.
     *
     * @param request Verification code request containing method and language
     * @returns Response indicating success or failure
     *
     * @example
     * await whatsappClient.phoneNumber.requestVerificationCode({
     *   code_method: 'SMS',
     *   language: 'en_US'
     * });
     */
    async requestVerificationCode(request: phoneNumber.RequestVerificationCodeRequest): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/request_code`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(request),
        );
    }

    /**
     * Verify the phone number with the received code.
     *
     * @param request Verification request containing the code
     * @returns Response indicating success or failure
     *
     * @example
     * await whatsappClient.phoneNumber.verifyCode({
     *   code: '123456'
     * });
     */
    async verifyCode(request: phoneNumber.VerifyCodeRequest): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/verify_code`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(request),
        );
    }
}
