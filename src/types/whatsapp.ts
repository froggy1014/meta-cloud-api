import { BusinessProfileClass } from 'src/businessProfile';
import { EncryptionClass } from 'src/encryption';
import { MediaClass } from '../media';
import { TemplateClass } from '../template';
import { FlowClass } from './flow';
import { MessagesClass } from './messages';
import { PhoneNumberClass } from './phoneNumber';
import { QrCodeClass } from './qrCode';
import { RegistrationClass } from './registration';
import { TwoStepVerificationClass } from './twoStepVerification';
import { WABAClass } from './waba';

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
    readonly messages: MessagesClass;
    readonly templates: TemplateClass;
    readonly phoneNumber: PhoneNumberClass;
    readonly qrCode: QrCodeClass;
    readonly encryption: EncryptionClass;
    readonly twoStepVerification: TwoStepVerificationClass;
    readonly registration: RegistrationClass;
    readonly media: MediaClass;
    readonly waba: WABAClass;
    readonly flow: FlowClass;
    readonly businessProfile: BusinessProfileClass;
    updateTimeout(ms: number): boolean;
    updatePhoneNumberId(phoneNumberId: number): boolean;
    updateAccessToken(accessToken: string): boolean;
    updateWabaId(wabaId: string): boolean;
}
