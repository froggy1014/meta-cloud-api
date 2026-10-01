---
'meta-cloud-api': minor
---

Add production helpers. All of them are opt-in and additive.

- **Customer service window:** `getCustomerServiceWindow`, `canSendFreeformMessage` and `getFreeEntryPointWindow` (exported from the root and `meta-cloud-api/utils`). They return `{ isOpen, expiresAt, remainingMs }` for the 24-hour window that opens on the user's last inbound message, and for the free entry point window (72 hours by default, up to 7 days for click-to-WhatsApp ads). They accept webhook Unix-seconds strings, numbers, `Date` or ISO strings.
- **Rate limit awareness:** the SDK parses `X-App-Usage`, `X-Business-Use-Case-Usage` and `Retry-After` on every response. Read them with `whatsapp.getLastRateLimitInfo()`, a new `onRateLimitInfo` config callback, `error.rateLimit` on API errors, or `parseRateLimitHeaders()`.
- **Server-paced retries:** throttling retries now wait as long as Meta asks (`Retry-After` or `estimated_time_to_regain_access`) when that is longer than the backoff delay, capped by the new `retry.maxServerDelayMs` (default 30 s). The number of attempts is unchanged. Set `retry.respectServerDelay: false` to keep the backoff delay only.
- **Media uploads:** `media.uploadMedia` also accepts `Blob`, `Uint8Array`, `ArrayBuffer` and web `ReadableStream` input with `{ type, filename, messagingProduct }` options, on every runtime. Streams are buffered into memory before the upload because Meta's endpoint needs a multipart body. `uploadMedia(file, messagingProduct)` still works.
