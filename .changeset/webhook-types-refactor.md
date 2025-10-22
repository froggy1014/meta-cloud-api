---
"meta-cloud-api": patch
---

Improve webhook types based on WhatsApp official documentation

**Changes:**
- Added discriminated union types for webhook values (MessageWebhookValue, StatusWebhookValue, ErrorWebhookValue)
- Added specific message type interfaces for all WhatsApp message types (Text, Image, Video, Audio, Document, Sticker, Interactive, Button, Location, Contacts, Reaction, Order, System, Unsupported)
- Added context types for forwarded messages, product inquiries, and interactive replies (ForwardedContext, ProductContext, ReplyContext)
- Added Click to WhatsApp ad referral tracking support (ReferralInfo)
- Added support for group messages with group_id field
- Added Unsupported message type to MessageTypesEnum
- Interactive messages now properly discriminated between list_reply and button_reply

**Migration:**
No changes required - existing code continues to work as before. The new types provide better IntelliSense and type checking internally.
