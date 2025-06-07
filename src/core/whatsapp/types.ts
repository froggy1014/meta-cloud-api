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
    readonly messages: any;
    readonly templates: any;
    readonly phoneNumber: any;
    readonly qrCode: any;
    readonly encryption: any;
    readonly twoStepVerification: any;
    readonly registration: any;
    readonly media: any;
    readonly waba: any;
    readonly flow: any;
    readonly businessProfile: any;
    updateTimeout(ms: number): boolean;
    updatePhoneNumberId(phoneNumberId: number): boolean;
    updateAccessToken(accessToken: string): boolean;
    updateWabaId(wabaId: string): boolean;
}
