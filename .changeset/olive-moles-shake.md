---
'meta-cloud-api': minor
---

Apply July 2026 Cloud API changelog entries (#421, #422)

- **Direct Send** (`messages`): new optional `category` (`'utility' | 'authentication' | 'service'`) and `directSendConfig` (`direct_send_config.template_name`) parameters on every send method, letting you send business-initiated messages without a pre-approved template. Adds `MessageCategoryEnum` / `MessageCategory` and the `DirectSendCategory`, `DirectSendConfig`, and `DirectSendOptions` types.
- **Call on WhatsApp button**: new `messages.interactiveVoiceCall` method and `voice_call` interactive type (`display_text`, `ttl_minutes`), plus `InteractiveTypesEnum.VoiceCall` / `InteractiveTypes.VoiceCall`. The method defaults `category` to `'utility'`, as required by Direct Send.
- **Status webhooks**: new optional `template_id` field on `StatusWebhook`, identifying the template used for a Direct Send message.
