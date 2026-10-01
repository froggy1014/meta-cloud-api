import type { WabaConfigType, WhatsAppConfig } from '../types/config';
import { WabaConfigEnum } from '../types/enums';
import Logger from '../utils/logger';
import { isDebugEnv, readEnv } from '../utils/runtime';
import {
    DEFAULT_CLOUD_API_VERSION,
    DEFAULT_LISTENER_PORT,
    DEFAULT_MAX_RETRIES_AFTER_WAIT,
    DEFAULT_REQUEST_TIMEOUT,
} from './defaults';

const LIB_NAME = 'UTILS';
const LOG_LOCAL = false;
const LOGGER = new Logger(LIB_NAME, isDebugEnv() || LOG_LOCAL);

const emptyConfigChecker = (config: WhatsAppConfig | undefined) => {
    if (!readEnv(WabaConfigEnum.AccessToken) && !config?.accessToken) {
        LOGGER.log('Environmental variable: CLOUD_API_ACCESS_TOKEN and/or access token argument is undefined.');
        throw new Error('Missing WhatsApp access token.');
    }
};

export const importConfig = (inputConfig?: WhatsAppConfig) => {
    emptyConfigChecker(inputConfig);

    const wabaConfig: WabaConfigType = {
        [WabaConfigEnum.AppId]: inputConfig?.appId || readEnv('M4D_APP_ID') || '',
        [WabaConfigEnum.AppSecret]: inputConfig?.appSecret || readEnv('M4D_APP_SECRET') || '',
        [WabaConfigEnum.PhoneNumberId]:
            inputConfig?.phoneNumberId || (readEnv('WA_PHONE_NUMBER_ID') ? Number(readEnv('WA_PHONE_NUMBER_ID')) : 0),
        [WabaConfigEnum.BusinessAcctId]: inputConfig?.businessAcctId || readEnv('WA_BUSINESS_ACCOUNT_ID') || '',
        [WabaConfigEnum.APIVersion]:
            inputConfig?.apiVersion || readEnv('CLOUD_API_VERSION') || DEFAULT_CLOUD_API_VERSION,
        [WabaConfigEnum.AccessToken]: inputConfig?.accessToken || readEnv('CLOUD_API_ACCESS_TOKEN') || '',
        [WabaConfigEnum.WebhookEndpoint]: inputConfig?.webhookEndpoint || readEnv('WEBHOOK_ENDPOINT') || '',
        [WabaConfigEnum.WebhookVerificationToken]:
            inputConfig?.webhookVerificationToken || readEnv('WEBHOOK_VERIFICATION_TOKEN') || '',
        [WabaConfigEnum.ListenerPort]:
            inputConfig?.listenerPort || parseInt(readEnv('LISTENER_PORT') || '', 10) || DEFAULT_LISTENER_PORT,
        [WabaConfigEnum.MaxRetriesAfterWait]:
            inputConfig?.maxRetriesAfterWait ||
            parseInt(readEnv('MAX_RETRIES_AFTER_WAIT') || '', 10) ||
            DEFAULT_MAX_RETRIES_AFTER_WAIT,
        [WabaConfigEnum.RequestTimeout]:
            inputConfig?.requestTimeout || parseInt(readEnv('REQUEST_TIMEOUT') || '', 10) || DEFAULT_REQUEST_TIMEOUT,
        [WabaConfigEnum.Debug]: inputConfig?.debug || isDebugEnv(),
        [WabaConfigEnum.PrivatePem]: inputConfig?.privatePem || readEnv('FLOW_API_PRIVATE_PEM') || '',
        [WabaConfigEnum.Passphrase]: inputConfig?.passphrase || readEnv('FLOW_API_PASSPHRASE') || '',
        retry: inputConfig?.retry,
        onRateLimitInfo: inputConfig?.onRateLimitInfo,
    };

    return wabaConfig;
};
