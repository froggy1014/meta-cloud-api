# Payments API

## Overview
Manage payment configurations for WhatsApp Payments (India).

## Endpoints
- GET /{WABA_ID}/payment_configurations
- GET /{WABA_ID}/payment_configuration/{CONFIGURATION_NAME}
- POST /{WABA_ID}/payment_configuration
- POST /{WABA_ID}/payment_configuration/{CONFIGURATION_NAME}
- POST /{WABA_ID}/generate_payment_configuration_oauth_link
- DELETE /{WABA_ID}/payment_configuration

## Notes
- `provider_name` values: `upi_vpa`, `razorpay`, `payu`, `zaakpay`.
- `configuration_name` must be unique within a WABA.
- OAuth link generation is required for gateway providers.

## Example
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

## Example Details
- `listPaymentConfigurations` pulls all configs for the WABA.
- `createPaymentConfiguration` needs `configuration_name`, `provider_name`, and `redirect_url`.
- `generatePaymentConfigurationOauthLink` issues an OAuth link for the configuration.
- `deletePaymentConfiguration` uses the `configuration_name` to remove the config.
