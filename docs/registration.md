# Registration API

```ts
import WhatsApp, { DataLocalizationRegionEnum } from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

await client.registration.register('123456', DataLocalizationRegionEnum.Asia);
await client.registration.deregister();
```
