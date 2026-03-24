import { WhatsApp } from 'meta-cloud-api';

let instance: WhatsApp | null = null;

export function getSDK(): WhatsApp {
    if (!instance) {
        instance = new WhatsApp({
            accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
            phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
            businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
        });
    }
    return instance;
}
