# Commerce Settings API

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
