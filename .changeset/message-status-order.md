---
'meta-cloud-api': minor
---

Add `resolveMessageStatus`, `compareMessageStatus` and `isMessageStatusAdvance` so status webhook handlers never move a stored message status backwards. Meta does not guarantee webhook order, and a `delivered` that arrives after `read` used to turn blue ticks grey again.
