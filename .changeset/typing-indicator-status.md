---
'meta-cloud-api': patch
---

Fix `messages.showTypingIndicator`: send `status: 'read'` with `typing_indicator` instead of `status: 'typing'`, which the Cloud API rejects (enum `["read", null]`). Showing the indicator also marks the message read. `StatusObject['status']` is now `'read'` only, and the mock Cloud API no longer accepts `'typing'`.
