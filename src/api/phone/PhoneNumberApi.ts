// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers/

// Endpoints:
// - GET /{PHONE_NUMBER_ID}?fields
// - GET /{WABA_ID}/phone_numbers
// - POST /{PHONE_NUMBER_ID}/request_code
// - POST /{PHONE_NUMBER_ID}/verify_code
// - POST /{PHONE_NUMBER_ID}/conversational_automation
// - GET /{PHONE_NUMBER_ID}?fields=conversational_automation
// - GET /{PHONE_NUMBER_ID}?fields=throughput

import { BaseAPI } from '../../types/base';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import type { ResponseSuccess } from '../../types/request';
import { objectToQueryString } from '../../utils/objectToQueryString';

import type * as phoneNumber from './types';

/**
 * API for managing WhatsApp Phone Numb ers.
 *
 * This API allows you to:
 * - Get phone number information by ID
 * - Get all phone numbers for a business account
 * - Request verification codes for phone numbers
 * - Verify phone numbers with codes
 */
export default class PhoneNumberApi extends BaseAPI implements phoneNumber.PhoneNumberClass {
    private readonly endpoint = 'phone_numbers';

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
    async getPhoneNumberById(fields?: phoneNumber.PhoneNumberFieldsParam): Promise<phoneNumber.PhoneNumberResponse> {
        const fieldValue = Array.isArray(fields) ? fields.join(',') : fields;
        const queryParams = fieldValue ? objectToQueryString({ fields: fieldValue }) : '';
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

    /**
     * Configure conversational automation features (Welcome Messages, Ice Breakers, Commands).
     *
     * @param request Configuration for conversational components
     * @returns Response indicating success or failure
     *
     * @example
     * // Enable welcome message
     * await whatsappClient.phoneNumber.setConversationalAutomation({
     *   enable_welcome_message: true
     * });
     *
     * @example
     * // Configure commands
     * await whatsappClient.phoneNumber.setConversationalAutomation({
     *   commands: [
     *     { command_name: 'tickets', command_description: 'Book flight tickets' },
     *     { command_name: 'hotel', command_description: 'Book hotel' }
     *   ]
     * });
     *
     * @example
     * // Configure ice breakers (prompts)
     * await whatsappClient.phoneNumber.setConversationalAutomation({
     *   prompts: ['Book a flight', 'Plan a vacation']
     * });
     *
     * @example
     * // Configure all features
     * await whatsappClient.phoneNumber.setConversationalAutomation({
     *   enable_welcome_message: true,
     *   commands: [
     *     { command_name: 'tickets', command_description: 'Book flight tickets' }
     *   ],
     *   prompts: ['Book a flight']
     * });
     */
    async setConversationalAutomation(request: phoneNumber.ConversationalAutomationRequest): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/conversational_automation`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(request),
        );
    }

    /**
     * Get the current configuration of conversational automation features.
     *
     * @returns Current configuration including welcome message status, commands, and prompts
     *
     * @example
     * const config = await whatsappClient.phoneNumber.getConversationalAutomation();
     * console.log(config.enable_welcome_message); // true/false
     * console.log(config.commands); // Array of commands
     * console.log(config.prompts); // Array of ice breakers
     */
    async getConversationalAutomation(): Promise<phoneNumber.ConversationalAutomationResponse> {
        const queryParams = objectToQueryString({ fields: 'conversational_automation' });
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.PhoneNumberId]}${queryParams}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    /**
     * Get the current throughput level for the phone number.
     *
     * Throughput represents the maximum messages per second (mps) that can be sent/received.
     * - Default: 80 mps
     * - Automatic upgrade to 1,000 mps available for eligible numbers
     * - WhatsApp Business app coexistence numbers: fixed at 5 mps
     *
     * @returns Current throughput information including the level (STANDARD, HIGH, or NOT_APPLICABLE)
     *
     * @example
     * const throughput = await whatsappClient.phoneNumber.getThroughput();
     * console.log(throughput.throughput.level); // 'STANDARD' | 'HIGH' | 'NOT_APPLICABLE'
     */
    async getThroughput(): Promise<phoneNumber.ThroughputResponse> {
        const queryParams = objectToQueryString({ fields: 'throughput' });
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.PhoneNumberId]}${queryParams}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }
}
