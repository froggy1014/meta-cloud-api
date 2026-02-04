# Commerce Settings API

## Overview
Read and update commerce settings for a phone number.

## Endpoints
- GET /{PHONE_NUMBER_ID}/whatsapp_commerce_settings
- POST /{PHONE_NUMBER_ID}/whatsapp_commerce_settings?is_cart_enabled&is_catalog_visible

## Notes
- Updates are sent via query params, not JSON bodies.
- Fields include `is_cart_enabled` and `is_catalog_visible`.

## Example
```ts
import WhatsApp from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

const settings = await client.commerce.getCommerceSettings();

await client.commerce.updateCommerceSettings({
  is_cart_enabled: true,
  is_catalog_visible: false,
});
```

## Example Details
- `getCommerceSettings` reads the current `is_cart_enabled` and `is_catalog_visible` values.
- `updateCommerceSettings` sends these as query params, not a JSON body.
