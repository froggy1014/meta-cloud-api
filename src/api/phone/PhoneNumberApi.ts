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
 * API for managing WhatsApp Business phone numbers.
 *
 * This API provides methods for phone number management, verification,
 * and conversational automation configuration within the WhatsApp Business Platform.
 *
 * Covered endpoints:
 * - Get phone number info by ID (`GET /{PHONE_NUMBER_ID}`)
 * - List all phone numbers for a WABA (`GET /{WABA_ID}/phone_numbers`)
 * - Request a verification code (`POST /{PHONE_NUMBER_ID}/request_code`)
 * - Verify a phone number with a code (`POST /{PHONE_NUMBER_ID}/verify_code`)
 * - Set conversational automation config (`POST /{PHONE_NUMBER_ID}/conversational_automation`)
 * - Get conversational automation config (`GET /{PHONE_NUMBER_ID}?fields=conversational_automation`)
 * - Get throughput info (`GET /{PHONE_NUMBER_ID}?fields=throughput`)
 *
 * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers | Phone Numbers API Reference}
 * @see {@link https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers/ | Phone Numbers Documentation}
 */
export default class PhoneNumberApi extends BaseAPI implements phoneNumber.PhoneNumberClass {
    private readonly endpoint = 'phone_numbers';

    /**
     * Get phone number information by ID.
     *
     * Retrieves details about the configured phone number, including display phone number,
     * verified name, quality rating, platform type, and more. Use the `fields` parameter
     * to request only specific fields.
     *
     * @param fields - Optional fields to include in the response. Can be a comma-separated
     *   string (e.g., `'display_phone_number,verified_name'`) or an array of field names.
     * @returns A promise that resolves with the phone number information.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers#get-single | Get Phone Number}
     *
     * @example
     * ```ts
     * // Get all available fields
     * const phoneNumber = await whatsappClient.phoneNumber.getPhoneNumberById();
     *
     * // Get specific fields as a comma-separated string
     * const phoneNumber = await whatsappClient.phoneNumber.getPhoneNumberById(
     *     'display_phone_number,verified_name,quality_rating'
     * );
     *
     * // Get specific fields as an array
     * const phoneNumber = await whatsappClient.phoneNumber.getPhoneNumberById(
     *     ['display_phone_number', 'verified_name']
     * );
     * ```
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
     * Get all phone numbers associated with the WhatsApp Business Account.
     *
     * Returns a list of all phone numbers registered under the configured WABA,
     * including their verification status, quality rating, and display information.
     *
     * @returns A promise that resolves with the list of phone numbers.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers#get-all | List Phone Numbers}
     *
     * @example
     * ```ts
     * const response = await whatsappClient.phoneNumber.getPhoneNumbers();
     * for (const number of response.data) {
     *     console.log(number.display_phone_number, number.verified_name);
     * }
     * ```
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
     * Sends a verification code to the configured phone number via SMS or voice call.
     * This is the first step of the phone number verification process.
     *
     * @param request - The verification code request parameters.
     * @param request.code_method - The delivery method for the code: `'SMS'` or `'VOICE'`.
     * @param request.language - The language code for the verification message (e.g., `'en_US'`).
     * @returns A promise that resolves with a success indicator.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers#request-verification-code | Request Verification Code}
     *
     * @example
     * ```ts
     * await whatsappClient.phoneNumber.requestVerificationCode({
     *     code_method: 'SMS',
     *     language: 'en_US',
     * });
     * ```
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
     * Verify the phone number with a received verification code.
     *
     * Completes the phone number verification process by submitting the code
     * received via SMS or voice call from {@link requestVerificationCode}.
     *
     * @param request - The verification request parameters.
     * @param request.code - The 6-digit verification code received via SMS or voice call.
     * @returns A promise that resolves with a success indicator.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers#verify-code | Verify Code}
     *
     * @example
     * ```ts
     * await whatsappClient.phoneNumber.verifyCode({
     *     code: '123456',
     * });
     * ```
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
     * Configure conversational automation features for the phone number.
     *
     * Sets up welcome messages, ice breakers (prompts), and commands that users
     * see when they open a conversation with the business phone number.
     *
     * @param request - The conversational automation configuration.
     * @param request.enable_welcome_message - Optional. Enable or disable the welcome message.
     * @param request.commands - Optional. Array of command objects with `command_name` and `command_description`.
     * @param request.prompts - Optional. Array of ice breaker prompt strings shown to users.
     * @returns A promise that resolves with a success indicator.
     *
     * @see {@link https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers/ | Conversational Automation}
     *
     * @example
     * ```ts
     * // Enable welcome message
     * await whatsappClient.phoneNumber.setConversationalAutomation({
     *     enable_welcome_message: true,
     * });
     *
     * // Configure commands and ice breakers
     * await whatsappClient.phoneNumber.setConversationalAutomation({
     *     enable_welcome_message: true,
     *     commands: [
     *         { command_name: 'tickets', command_description: 'Book flight tickets' },
     *         { command_name: 'hotel', command_description: 'Book a hotel room' },
     *     ],
     *     prompts: ['Book a flight', 'Plan a vacation'],
     * });
     * ```
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
     * Get the current conversational automation configuration for the phone number.
     *
     * Retrieves the current settings for welcome messages, ice breakers (prompts),
     * and commands configured on the phone number.
     *
     * @returns A promise that resolves with the current conversational automation settings,
     *   including welcome message status, commands, and prompts.
     *
     * @see {@link https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers/ | Conversational Automation}
     *
     * @example
     * ```ts
     * const config = await whatsappClient.phoneNumber.getConversationalAutomation();
     * console.log(config.enable_welcome_message); // true or false
     * console.log(config.commands);               // Array of command objects
     * console.log(config.prompts);                // Array of ice breaker strings
     * ```
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
     * Throughput represents the maximum messages per second (MPS) that can be
     * sent or received on this phone number.
     *
     * Throughput levels:
     * - **STANDARD**: 80 MPS (default for most numbers)
     * - **HIGH**: 1,000 MPS (automatic upgrade for eligible numbers)
     * - **NOT_APPLICABLE**: Fixed at 5 MPS (WhatsApp Business app coexistence numbers)
     *
     * @returns A promise that resolves with the current throughput information,
     *   including the throughput level.
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers | Phone Numbers - Throughput}
     *
     * @example
     * ```ts
     * const throughput = await whatsappClient.phoneNumber.getThroughput();
     * console.log(throughput.throughput.level); // 'STANDARD' | 'HIGH' | 'NOT_APPLICABLE'
     * ```
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
