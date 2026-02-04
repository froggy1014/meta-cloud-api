// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/two-step-verification/

// Endpoints:
// - POST /{PHONE_NUMBER_ID}

import { BaseAPI } from '../../types/base';
import type { WabaConfigType } from '../../types/config';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import type { RequesterClass, ResponseSuccess } from '../../types/request';

import type * as twoStepVerification from './types';

/**
 * API for managing WhatsApp Two-Step Verification.
 *
 * This API allows you to:
 * - Set a two-step verification PIN code
 * - Manage two-step verification settings
 */
export default class TwoStepVerificationApi extends BaseAPI implements twoStepVerification.TwoStepVerificationClass {
    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    /**
     * Set a two-step verification PIN code.
     *
     * @param pin The PIN code to set for two-step verification (6-digit numeric string)
     * @returns Response indicating success or failure
     *
     * @example
     * await whatsappClient.twoStepVerification.setTwoStepVerificationCode('123456');
     */
    async setTwoStepVerificationCode(pin: string): Promise<ResponseSuccess> {
        const body = {
            pin,
        };

        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }
}
