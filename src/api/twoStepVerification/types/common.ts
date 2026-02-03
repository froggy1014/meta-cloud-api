// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/two-step-verification/

import type { ResponseSuccess } from '../../../types/request';

export type TwoStepVerificationRequest = {
    pin: string;
};

export interface TwoStepVerificationClass {
    setTwoStepVerificationCode(pin: string): Promise<ResponseSuccess>;
}
