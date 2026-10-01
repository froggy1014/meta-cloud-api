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
- `uploadMedia` accepts a `File`, `Blob`, `Uint8Array` (including `Buffer`), `ArrayBuffer`, or web `ReadableStream<Uint8Array>` on every runtime. Pass `{ type, filename? }` unless the input is a `Blob`/`File` with a type. `uploadMedia(file, 'whatsapp')` still works.
- A `ReadableStream` is read fully into memory first: Meta needs a multipart body and `fetch` only takes `Blob` parts in `FormData`. Peak memory can exceed the file size because buffering and multipart encoding may allocate copies.
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
- `uploadMedia` needs a MIME type (from the `File`/`Blob` or `options.type`); the response `id` is used in messages.
- Bytes or streams: `await client.media.uploadMedia(res.body!, { type: 'application/pdf', filename: 'report.pdf' })`.
- `getMediaById` returns metadata and a temporary `url` for downloads.
- `downloadMedia` uses the `url` from `getMediaById`, and `deleteMedia` removes the media by ID.
