import { RequesterResponseInterface, ResponseSuccess } from './request';

export type TwoStepVerificationRequest = {
    pin: string;
};

export interface TwoStepVerificationClass {
    setTwoStepVerificationCode(pin: string): Promise<RequesterResponseInterface<ResponseSuccess>>;
}
