---
'meta-cloud-api': patch
---

Fix `media.downloadMedia()`: it parsed the media URL's response as JSON, so downloading real media (JPEG, PDF, …) failed. It now returns the bytes as a `Blob` with the response's content type; Meta error responses still throw `WhatsAppError`s.

Fix a type error in the published declarations under `skipLibCheck: false` (`Logger` did not match `LoggerInterface`; it now has a `debug()` method). `businessProfile.uploadMedia()` accepts any `Uint8Array` (a `Buffer` still works).
