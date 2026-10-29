---
'meta-cloud-api': minor
---

Add `onRequest` and `onResponse` config hooks. `onRequest` receives the method, URL, headers (`Authorization` redacted), body and attempt number before each request is sent; `onResponse` receives the same plus `statusCode`, `responseHeaders` and `durationMs` after each response, including error statuses and retried attempts. Hooks are awaited and errors they throw are ignored.
