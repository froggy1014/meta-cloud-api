export const config = {
    accessToken: process.env.CLOUD_API_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WA_PHONE_NUMBER_ID ? Number(process.env.WA_PHONE_NUMBER_ID) : undefined,
    businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID || '',
    webhookVerificationToken: process.env.WEBHOOK_VERIFICATION_TOKEN || '',
    privatePem: process.env.FLOW_API_PRIVATE_PEM as string,
    passphrase: process.env.FLOW_API_PASSPHRASE as string,
    appSecret: process.env.M4D_APP_SECRET || '',
};
