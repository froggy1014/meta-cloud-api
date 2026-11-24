---
'meta-cloud-api': minor
---

Apply Cloud API changelog entries #502, #507, #508, and #509: add `call_permission_mode` to calling settings (`CallPermissionMode`), add the `calling_quality_rating` phone number field and the `CALLING_QUALITY_UPDATE` account update event with `calling_quality_info`, add the `free_tier` pricing subtype on status webhooks, and map errors `138039` (calling opt-in not eligible) and `131066` (marketing message not delivered for template quality or price) to `WhatsAppCallingError` and `WhatsAppSendMessageError`.
