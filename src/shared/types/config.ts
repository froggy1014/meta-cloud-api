import { WabaConfigEnum } from './enums';

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

export type WabaConfigType = {
    /**
     * The Meta for Developers business application Id for this registered application.
     */
    [WabaConfigEnum.AppId]: string;

    /**
     * The Meta for Developers business application secret for this registered application.
     */
    [WabaConfigEnum.AppSecret]: string;

    /**
     * The Meta for Developers phone number id used by the registered business.
     */
    [WabaConfigEnum.PhoneNumberId]: number;

    /**
     * The Meta for Developers business id for the registered business.
     */
    [WabaConfigEnum.BusinessAcctId]: string;
    /**
     * The version of the Cloud API being used. Starts with a "v" and follows the major number.
     */
    [WabaConfigEnum.APIVersion]: string;

    /**
     * The access token to make calls on behalf of the signed in Meta for Developers account or business.
     */
    [WabaConfigEnum.AccessToken]: string;

    /**
     * The endpoint path (e.g. if the value here is webhook, the webhook URL would look like http/https://{host}/webhook).
     */
    [WabaConfigEnum.WebhookEndpoint]: string;

    /**
     * The verification token that needs to match what is sent by the Cloud API webhook in order to subscribe.
     */
    [WabaConfigEnum.WebhookVerificationToken]: string;

    /**
     * The listener port for the webhook web server.
     */
    [WabaConfigEnum.ListenerPort]: number;

    /**
     * To turn on global debugging of the logger to print verbose output across the APIs.
     */
    [WabaConfigEnum.Debug]: boolean;

    /**
     * The total number of times a request should be retried after the wait period if it fails.
     */
    [WabaConfigEnum.MaxRetriesAfterWait]: number;

    /**
     * The timeout period for a request to quit and destroy the attempt in ms.
     */
    [WabaConfigEnum.RequestTimeout]: number;

    /**
     * The private key for the Meta for Developers business.
     */
    [WabaConfigEnum.PrivatePem]: string;

    /**
     * The passphrase for the Meta for Developers business.
     */
    [WabaConfigEnum.Passphrase]: string;
};
