# Payments API

```ts
import WhatsApp from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

const configs = await client.payments.listPaymentConfigurations('WABA_ID');

await client.payments.createPaymentConfiguration('WABA_ID', {
  configuration_name: 'test-config',
  provider_name: 'razorpay',
  redirect_url: 'https://example.com/redirect',
});

await client.payments.generatePaymentConfigurationOauthLink('WABA_ID', {
  configuration_name: 'test-config',
  redirect_url: 'https://example.com/redirect',
});

await client.payments.deletePaymentConfiguration('WABA_ID', {
  configuration_name: 'test-config',
});
```
