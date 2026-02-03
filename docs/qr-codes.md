# QR Codes API

```ts
import WhatsApp from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

const created = await client.qrCode.createQrCode({
  prefilled_message: 'Hello from QR',
  generate_qr_image: 'PNG',
});

const list = await client.qrCode.getQrCodes();
const detail = await client.qrCode.getQrCode(created.id);

await client.qrCode.updateQrCode({
  code: created.code,
  prefilled_message: 'Updated message',
});

await client.qrCode.deleteQrCode(created.id);
```
