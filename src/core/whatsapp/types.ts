import {
    BusinessProfileApi,
    CallingApi,
    CommerceApi,
    EncryptionApi,
    FlowApi,
    GroupsApi,
    MarketingMessagesApi,
    MediaApi,
    MessageApi,
    PaymentsApi,
    PhoneNumberApi,
    QrCodeApi,
    RegistrationApi,
    TemplateApi,
    TwoStepVerificationApi,
    BlockUsersApi,
    WabaApi,
} from 'src/api';
import { WhatsAppConfig } from '../../types/config';
import type { EncryptionKeyPair } from '../../utils/flowEncryptionUtils';

export declare class WhatsAppClass {
    constructor(config?: WhatsAppConfig);
    readonly blockUsers: BlockUsersApi;
    readonly calling: CallingApi;
    readonly commerce: CommerceApi;
    readonly groups: GroupsApi;
    readonly marketingMessages: MarketingMessagesApi;
    readonly messages: MessageApi;
    readonly templates: TemplateApi;
    readonly phoneNumbers: PhoneNumberApi;
    readonly qrCode: QrCodeApi;
    readonly encryption: EncryptionApi;
    readonly twoStepVerification: TwoStepVerificationApi;
    readonly registration: RegistrationApi;
    readonly media: MediaApi;
    readonly waba: WabaApi;
    readonly flows: FlowApi;
    readonly businessProfile: BusinessProfileApi;
    readonly payments: PaymentsApi;
    updateTimeout(timeout: number): void;
    updateSenderNumberId(phoneNumberId: number): void;
    updateAccessToken(accessToken: string): void;
    version(): string;
    static get Enums(): typeof import('../../types/enums');
    getUserAgent(): string;
    generateEncryption(passphrase?: string): EncryptionKeyPair;
}
