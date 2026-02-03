# Business Profile API

```ts
import WhatsApp, { BusinessVerticalEnum } from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

const profile = await client.businessProfile.getBusinessProfile([
  'about',
  'email',
  'websites',
]);

await client.businessProfile.updateBusinessProfile({
  messaging_product: 'whatsapp',
  about: 'We provide fast support',
  email: 'support@example.com',
  websites: ['https://example.com'],
  vertical: BusinessVerticalEnum.RETAIL,
});
```
