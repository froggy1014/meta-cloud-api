# Media API

```ts
import WhatsApp from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

const file = new File([Buffer.from('hello')], 'note.txt', { type: 'text/plain' });
const upload = await client.media.uploadMedia(file);

const mediaInfo = await client.media.getMediaById(upload.id);
const blob = await client.media.downloadMedia(mediaInfo.url);

await client.media.deleteMedia(upload.id);
```
