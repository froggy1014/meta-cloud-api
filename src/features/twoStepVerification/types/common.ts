import type { ResponseSuccess } from '@shared/types/request';

export type TwoStepVerificationRequest = {
    pin: string;
};

export interface TwoStepVerificationClass {
    setTwoStepVerificationCode(pin: string): Promise<ResponseSuccess>;
}
