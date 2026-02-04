# QR Codes API

## Overview
Create, list, update, and delete QR codes for prefilled messages.

## Endpoints
- POST /{PHONE_NUMBER_ID}/message_qrdls
- GET /{PHONE_NUMBER_ID}/message_qrdls
- GET /{PHONE_NUMBER_ID}/message_qrdls/{QR_CODE_ID}
- POST /{PHONE_NUMBER_ID}/message_qrdls
- DELETE /{PHONE_NUMBER_ID}/message_qrdls/{QR_CODE_ID}

## Notes
- `prefilled_message` is the text users see when opening the chat.
- `generate_qr_image` can be set to `PNG` for image output.

## Example
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

## Example Details
- `createQrCode` uses `prefilled_message` and `generate_qr_image` to return a code.
- `getQrCodes` lists all codes; `getQrCode` fetches one by ID.
- `updateQrCode` uses the `code` string from create, while `deleteQrCode` uses the numeric ID.
