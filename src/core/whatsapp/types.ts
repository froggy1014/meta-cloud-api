import {
    BusinessProfileApi,
    EncryptionApi,
    FlowApi,
    MediaApi,
    MessagesApi,
    PhoneNumberApi,
    QrCodeApi,
    RegistrationApi,
    TemplateApi,
    TwoStepVerificationApi,
    WabaApi,
} from 'src/api';
import { WhatsAppConfig } from '../../types/config';

export declare class WhatsAppClass {
    constructor(config?: WhatsAppConfig);
    readonly messages: MessagesApi;
    readonly templates: TemplateApi;
    readonly phoneNumber: PhoneNumberApi;
    readonly qrCode: QrCodeApi;
    readonly encryption: EncryptionApi;
    readonly twoStepVerification: TwoStepVerificationApi;
    readonly registration: RegistrationApi;
    readonly media: MediaApi;
    readonly waba: WabaApi;
    readonly flow: FlowApi;
    readonly businessProfile: BusinessProfileApi;
    updateTimeout(ms: number): boolean;
    updatePhoneNumberId(phoneNumberId: number): boolean;
    updateAccessToken(accessToken: string): boolean;
    updateWabaId(wabaId: string): boolean;
}
