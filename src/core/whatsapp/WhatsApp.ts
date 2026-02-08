import {
    BlockUsersApi,
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
    WabaApi,
} from '../../api';
import { importConfig } from '../../config/importConfig';
import type { WabaConfigType, WhatsAppConfig } from '../../types/config';
import * as SDKEnums from '../../types/enums';
import { formatConfigTable } from '../../utils/configTable';
import { type EncryptionKeyPair, generateEncryption } from '../../utils/flowEncryptionUtils';
import Requester from '../../utils/http/request';
import Logger from '../../utils/logger';
import { printLogo } from '../../utils/logoConsole';
import { getUserAgent, getVersion } from '../../utils/version';

const LIB_NAME = 'WHATSAPP';
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true');

/**
 * WhatsApp SDK Main Class following official patterns
 * Provides unified access to WhatsApp Cloud API and Flows API
 */
export default class WhatsApp {
    config: WabaConfigType;
    requester: Readonly<Requester>;
    blockUsers: BlockUsersApi;
    calling: CallingApi;
    commerce: CommerceApi;
    groups: GroupsApi;
    marketingMessages: MarketingMessagesApi;
    messages: MessageApi;
    media: MediaApi;
    payments: PaymentsApi;
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

        this.blockUsers = new BlockUsersApi(this.config, this.requester);
        this.calling = new CallingApi(this.config, this.requester);
        this.commerce = new CommerceApi(this.config, this.requester);
        this.groups = new GroupsApi(this.config, this.requester);
        this.marketingMessages = new MarketingMessagesApi(this.config, this.requester);
        this.messages = new MessageApi(this.config, this.requester);
        this.media = new MediaApi(this.config, this.requester);
        this.payments = new PaymentsApi(this.config, this.requester);
        this.phoneNumbers = new PhoneNumberApi(this.config, this.requester);
        this.twoStepVerification = new TwoStepVerificationApi(this.config, this.requester);
        this.flows = new FlowApi(this.config, this.requester);
        this.businessProfile = new BusinessProfileApi(this.config, this.requester);
        this.templates = new TemplateApi(this.config, this.requester);
        this.encryption = new EncryptionApi(this.config, this.requester);
        this.qrCode = new QrCodeApi(this.config, this.requester);
        this.registration = new RegistrationApi(this.config, this.requester);
        this.waba = new WabaApi(this.config, this.requester);

        LOGGER.log(`\n${formatConfigTable(this.config)}`);
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

    /**
     * Generate RSA encryption key pair for WhatsApp Business Flow API
     *
     * This method generates a 2048-bit RSA key pair with:
     * - Public key in SPKI format (PEM)
     * - Private key in PKCS#8 format (PEM) encrypted with AES-256-CBC
     *
     * @param passphrase - Optional passphrase to encrypt the private key. If not provided, uses FLOW_API_PASSPHRASE from config
     * @returns Object containing passphrase, privateKey, and publicKey
     * @throws {Error} If passphrase is empty or key generation fails
     * @throws {Error} If not running in Node.js environment
     *
     * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/whatsapp-business-encryption/
     *
     * @example
     * ```typescript
     * const wa = new WhatsApp();
     *
     * // Uses FLOW_API_PASSPHRASE from environment/config
     * const keys = wa.generateEncryption();
     *
     * // Or provide custom passphrase
     * const customKeys = wa.generateEncryption('my-secret-passphrase');
     *
     * console.log('Public Key:', keys.publicKey);
     * console.log('Private Key:', keys.privateKey);
     * ```
     */
    generateEncryption(passphrase?: string): EncryptionKeyPair {
        // If no passphrase provided, try to use from config
        const effectivePassphrase = passphrase || this.config[SDKEnums.WabaConfigEnum.Passphrase];
        return generateEncryption(effectivePassphrase);
    }
}
