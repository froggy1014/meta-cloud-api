import { WabaConfigType } from './types/config';
import * as SDKEnums from './types/enums';
import Logger from './utils/logger';

import {
    FlowAPI,
    MediaAPI,
    PhoneNumberAPI,
    QrCodeAPI,
    RegistrationAPI,
    TemplateAPI,
    TwoStepVerificationAPI,
    WabaAPI,
} from './api';
import BusinessProfileApi from './businessProfile/BusinessProfileApi';
import { EncryptionApi } from './encryption';
import MessagesApi from './messages';
import Requester from './request';
import { WhatsAppClass, WhatsAppConfig } from './types/whatsapp';
import { importConfig } from './utils/importConfig';

const LIB_NAME = 'WHATSAPP';
const LOG_LOCAL = false;
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true' || LOG_LOCAL);

const headerPrefix = 'WA_SDK';

export default class WhatsApp implements WhatsAppClass {
    config: WabaConfigType;

    requester: Readonly<Requester>;

    readonly messages: MessagesApi;
    readonly templates: TemplateAPI;
    readonly phoneNumber: PhoneNumberAPI;
    readonly qrCode: QrCodeAPI;
    readonly encryption: EncryptionApi;
    readonly twoStepVerification: TwoStepVerificationAPI;
    readonly registration: RegistrationAPI;
    readonly media: MediaAPI;
    readonly waba: WabaAPI;
    readonly flow: FlowAPI;
    readonly businessProfile: BusinessProfileApi;
    static readonly Enums = SDKEnums;

    constructor(config?: WhatsAppConfig) {
        this.config = importConfig(config);
        this.requester = new Requester(
            this.config[SDKEnums.WabaConfigEnum.APIVersion],
            this.config[SDKEnums.WabaConfigEnum.PhoneNumberId],
            this.config[SDKEnums.WabaConfigEnum.AccessToken],
            this.config[SDKEnums.WabaConfigEnum.BusinessAcctId],
            this.userAgent(),
        );

        this.messages = new MessagesApi(this.config, this.requester);
        this.templates = new TemplateAPI(this.config, this.requester);
        this.phoneNumber = new PhoneNumberAPI(this.config, this.requester);
        this.qrCode = new QrCodeAPI(this.config, this.requester);
        this.encryption = new EncryptionApi(this.config, this.requester);
        this.twoStepVerification = new TwoStepVerificationAPI(this.config, this.requester);
        this.registration = new RegistrationAPI(this.config, this.requester);
        this.media = new MediaAPI(this.config, this.requester);
        this.waba = new WabaAPI(this.config, this.requester);
        this.flow = new FlowAPI(this.config, this.requester);
        this.businessProfile = new BusinessProfileApi(this.config, this.requester);
        LOGGER.log('WhatsApp Node.js SDK instantiated!');
    }

    private userAgent(): string {
        const userAgentString = `${headerPrefix}/${'0.0.1'} (Node.js ${process.version})`;
        return userAgentString;
    }

    updateTimeout(ms: number): boolean {
        this.config[SDKEnums.WabaConfigEnum.RequestTimeout] = ms;
        LOGGER.log(`Updated request timeout to ${ms}ms`);
        return true;
    }

    updatePhoneNumberId(phoneNumberId: number): boolean {
        this.config[SDKEnums.WabaConfigEnum.PhoneNumberId] = phoneNumberId;
        LOGGER.log(`Updated sender phone number id to ${phoneNumberId}`);
        return true;
    }

    updateAccessToken(accessToken: string): boolean {
        this.config[SDKEnums.WabaConfigEnum.AccessToken] = accessToken;
        LOGGER.log(`Updated access token`);
        return true;
    }

    updateWabaId(wabaId: string): boolean {
        this.config[SDKEnums.WabaConfigEnum.BusinessAcctId] = wabaId;
        LOGGER.log(`Updated business account id to ${wabaId}`);
        return true;
    }
}
