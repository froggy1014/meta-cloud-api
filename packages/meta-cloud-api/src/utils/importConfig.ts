import type { WabaConfigType } from '../types/config';
import { WabaConfigEnum, WabaRequiredConfigEnum } from '../types/enums';
import Logger from '../logger';

const LIB_NAME = 'UTILS';
const LOG_LOCAL = false;
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true' || LOG_LOCAL);
const DEFAULT_BASE_URL = 'graph.facebook.com';
const DEFAULT_LISTENER_PORT = 3000;
const DEFAULT_MAX_RETRIES_AFTER_WAIT = 30;
const DEFAULT_REQUEST_TIMEOUT = 20000;

const emptyConfigChecker = (senderNumberId?: number) => {
    if (
        (process.env.WA_PHONE_NUMBER_ID === undefined || process.env.WA_PHONE_NUMBER_ID === '') &&
        senderNumberId == undefined
    ) {
        LOGGER.log(`Environmental variable: WA_PHONE_NUMBER_ID and/or sender phone number id arguement is undefined.`);
        throw new Error('Missing WhatsApp sender phone number Id.');
    }

    for (const value of Object.values(WabaRequiredConfigEnum)) {
        LOGGER.log(value + ' ---- ' + process.env[`${value}`]);
        if (process.env[`${value}`] === undefined || process.env[`${value}`] === '') {
            LOGGER.log(`Environmental variable: ${value} is undefined`);
            throw new Error('Invalid configuration.');
        }
    }
};

export const importConfig = (senderNumberId?: number) => {
    emptyConfigChecker(senderNumberId);

    const config: WabaConfigType = {
        [WabaConfigEnum.BaseURL]: process.env.WA_BASE_URL || DEFAULT_BASE_URL,
        [WabaConfigEnum.AppId]: process.env.M4D_APP_ID || '',
        [WabaConfigEnum.AppSecret]: process.env.M4D_APP_SECRET || '',
        [WabaConfigEnum.PhoneNumberId]: senderNumberId || parseInt(process.env.WA_PHONE_NUMBER_ID || ''),
        [WabaConfigEnum.BusinessAcctId]: process.env.WA_BUSINESS_ACCOUNT_ID || '',
        [WabaConfigEnum.APIVersion]: process.env.CLOUD_API_VERSION || '',
        [WabaConfigEnum.AccessToken]: process.env.CLOUD_API_ACCESS_TOKEN || '',
        [WabaConfigEnum.WebhookEndpoint]: process.env.WEBHOOK_ENDPOINT || '',
        [WabaConfigEnum.WebhookVerificationToken]: process.env.WEBHOOK_VERIFICATION_TOKEN || '',
        [WabaConfigEnum.ListenerPort]: parseInt(process.env.LISTENER_PORT || '') || DEFAULT_LISTENER_PORT,
        [WabaConfigEnum.MaxRetriesAfterWait]:
            parseInt(process.env.MAX_RETRIES_AFTER_WAIT || '') || DEFAULT_MAX_RETRIES_AFTER_WAIT,
        [WabaConfigEnum.RequestTimeout]: parseInt(process.env.REQUEST_TIMEOUT || '') || DEFAULT_REQUEST_TIMEOUT,
        [WabaConfigEnum.Debug]: process.env.DEBUG === 'true',
    };

    LOGGER.log(`Configuration loaded for App Id ${config[WabaConfigEnum.AppId]}`);

    return config;
};
