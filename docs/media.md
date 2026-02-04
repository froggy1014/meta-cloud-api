# Media API

## Overview
Upload media once and reuse the returned media ID in messages. You can also query metadata and delete media.

## Endpoints
- POST /{PHONE_NUMBER_ID}/media
- GET /{MEDIA_ID}
- DELETE /{MEDIA_ID}
- GET {MEDIA_URL}

## Notes
- Uploads use `multipart/form-data` with `file`, `type`, and `messaging_product`.
- Download uses the `url` from `getMediaById`.
- Delete requires the media ID, not the URL.

## Example
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

## Example Details
- `uploadMedia` expects a `File` with a MIME type; the response `id` is used in messages.
- `getMediaById` returns metadata and a temporary `url` for downloads.
- `downloadMedia` uses the `url` from `getMediaById`, and `deleteMedia` removes the media by ID.
