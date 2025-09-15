import { importConfig } from '../../config/importConfig';
import { WabaConfigType, WhatsAppConfig } from '../../types/config';
import * as SDKEnums from '../../types/enums';
import { formatConfigTable } from '../../utils/configTable';
import Requester from '../../utils/http/request';
import Logger from '../../utils/logger';
import { getUserAgent, getVersion } from '../../utils/version';

import {
    BusinessProfileApi,
    EncryptionApi,
    FlowApi,
    MediaApi,
    MessageApi,
    PhoneNumberApi,
    QrCodeApi,
    RegistrationApi,
    TemplateApi,
    TwoStepVerificationApi,
    WabaApi,
} from '../../api';
import { printLogo } from '../../utils/logoConsole';

const LIB_NAME = 'WHATSAPP';
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true');

/**
 * WhatsApp SDK Main Class following official patterns
 * Provides unified access to WhatsApp Cloud API and Flows API
 */
export default class WhatsApp {
    config: WabaConfigType;
    requester: Readonly<Requester>;
    messages: MessageApi;
    media: MediaApi;
    phoneNumbers: PhoneNumberApi;
    twoStepVerification: TwoStepVerificationApi;
    flows: FlowApi;
    businessProfile: BusinessProfileApi;
    templates: TemplateApi;
    encryption: EncryptionApi;
    qrCode: QrCodeApi;
    registration: RegistrationApi;
    waba: WabaApi;

    constructor(config?: WhatsAppConfig) {
        printLogo();
        this.config = importConfig(config);

        this.requester = new Requester(
            this.config[SDKEnums.WabaConfigEnum.APIVersion],
            this.config[SDKEnums.WabaConfigEnum.PhoneNumberId],
            this.config[SDKEnums.WabaConfigEnum.AccessToken],
            this.config[SDKEnums.WabaConfigEnum.BusinessAcctId],
            this.getUserAgent(),
        );

        this.messages = new MessageApi(this.config, this.requester);
        this.media = new MediaApi(this.config, this.requester);
        this.phoneNumbers = new PhoneNumberApi(this.config, this.requester);
        this.twoStepVerification = new TwoStepVerificationApi(this.config, this.requester);
        this.flows = new FlowApi(this.config, this.requester);
        this.businessProfile = new BusinessProfileApi(this.config, this.requester);
        this.templates = new TemplateApi(this.config, this.requester);
        this.encryption = new EncryptionApi(this.config, this.requester);
        this.qrCode = new QrCodeApi(this.config, this.requester);
        this.registration = new RegistrationApi(this.config, this.requester);
        this.waba = new WabaApi(this.config, this.requester);

        LOGGER.log('\n' + formatConfigTable(this.config));
    }

    /**
     * Runtime configuration updates following official patterns
     */
    updateTimeout(timeout: number): void {
        this.config[SDKEnums.WabaConfigEnum.RequestTimeout] = timeout;
        if ('updateTimeout' in this.requester) {
            (this.requester as any).updateTimeout(timeout);
        }
        LOGGER.log(`Timeout updated to ${timeout}ms`);
    }

    updateSenderNumberId(phoneNumberId: number): void {
        this.config[SDKEnums.WabaConfigEnum.PhoneNumberId] = phoneNumberId;
        LOGGER.log(`Sender number ID updated to ${phoneNumberId}`);
    }

    updateAccessToken(accessToken: string): void {
        this.config[SDKEnums.WabaConfigEnum.AccessToken] = accessToken;
        if ('updateAccessToken' in this.requester) {
            (this.requester as any).updateAccessToken(accessToken);
        }
        LOGGER.log('Access token updated');
    }

    /**
     * Get SDK version
     */
    version(): string {
        return getVersion();
    }

    /**
     * Static enums access
     */
    static get Enums() {
        return SDKEnums;
    }

    /**
     * Get User-Agent string
     */
    getUserAgent(): string {
        return getUserAgent();
    }
}
