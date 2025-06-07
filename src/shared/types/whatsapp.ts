import EncryptionApi from '../../features/encryption';
import FlowApi from '../../features/flow';
import MediaApi from '../../features/media';
import MessagesApi from '../../features/messages';
import PhoneNumberApi from '../../features/phone';
import BusinessProfileApi from '../../features/profile';
import QrCodeApi from '../../features/qrCode';
import RegistrationApi from '../../features/registration';
import TemplateApi from '../../features/template';
import TwoStepVerificationApi from '../../features/twoStepVerification';
import WabaApi from '../../features/waba';

export type WhatsAppConfig = {
    accessToken: string;
    appId?: string;
    appSecret?: string;
    phoneNumberId?: number;
    businessAcctId?: string;
    apiVersion?: string;
    webhookEndpoint?: string;
    webhookVerificationToken?: string;
    listenerPort?: number;
    debug?: boolean;
    maxRetriesAfterWait?: number;
    requestTimeout?: number;
    privatePem?: string;
    passphrase?: string;
};

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
