import { WhatsAppConfig } from 'src/types/whatsapp';
import type { WabaConfigType } from '../types/config';
import { WabaConfigEnum } from '../types/enums';
import Logger from './logger';

const LIB_NAME = 'UTILS';
const LOG_LOCAL = false;
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true' || LOG_LOCAL);
const DEFAULT_LISTENER_PORT = 3000;
const DEFAULT_MAX_RETRIES_AFTER_WAIT = 30;
const DEFAULT_REQUEST_TIMEOUT = 20000;

const emptyConfigChecker = (config: WhatsAppConfig | undefined) => {
    if (!process.env[WabaConfigEnum.AccessToken] && !config?.accessToken) {
        LOGGER.log(`Environmental variable: CLOUD_API_ACCESS_TOKEN and/or access token argument is undefined.`);
        throw new Error('Missing WhatsApp access token.');
    }
};

export const importConfig = (inputConfig?: WhatsAppConfig) => {
    emptyConfigChecker(inputConfig);

    const wabaConfig: WabaConfigType = {
        [WabaConfigEnum.AppId]: inputConfig?.appId || process.env.M4D_APP_ID || '',
        [WabaConfigEnum.AppSecret]: inputConfig?.appSecret || process.env.M4D_APP_SECRET || '',
        [WabaConfigEnum.PhoneNumberId]: inputConfig?.phoneNumberId || Number(process.env.WA_PHONE_NUMBER_ID),
        [WabaConfigEnum.BusinessAcctId]: inputConfig?.businessAcctId || process.env.WA_BUSINESS_ACCOUNT_ID || '',
        [WabaConfigEnum.APIVersion]: inputConfig?.apiVersion || process.env.CLOUD_API_VERSION || '',
        [WabaConfigEnum.AccessToken]: inputConfig?.accessToken || process.env.CLOUD_API_ACCESS_TOKEN || '',
        [WabaConfigEnum.WebhookEndpoint]: inputConfig?.webhookEndpoint || process.env.WEBHOOK_ENDPOINT || '',
        [WabaConfigEnum.WebhookVerificationToken]:
            inputConfig?.webhookVerificationToken || process.env.WEBHOOK_VERIFICATION_TOKEN || '',
        [WabaConfigEnum.ListenerPort]:
            inputConfig?.listenerPort || parseInt(process.env.LISTENER_PORT || '') || DEFAULT_LISTENER_PORT,
        [WabaConfigEnum.MaxRetriesAfterWait]:
            inputConfig?.maxRetriesAfterWait ||
            parseInt(process.env.MAX_RETRIES_AFTER_WAIT || '') ||
            DEFAULT_MAX_RETRIES_AFTER_WAIT,
        [WabaConfigEnum.RequestTimeout]:
            inputConfig?.requestTimeout || parseInt(process.env.REQUEST_TIMEOUT || '') || DEFAULT_REQUEST_TIMEOUT,
        [WabaConfigEnum.Debug]: inputConfig?.debug || process.env.DEBUG === 'true',
        [WabaConfigEnum.PrivatePem]: inputConfig?.privatePem || process.env.FLOW_API_PRIVATE_PEM || '',
        [WabaConfigEnum.Passphrase]: inputConfig?.passphrase || process.env.FLOW_API_PASSPHRASE || '',
    };

    LOGGER.log(`Configuration loaded for App Id ${wabaConfig[WabaConfigEnum.AppId]}`);

    return wabaConfig;
};
