---
"meta-cloud-api": patch
---

Add missing `PhoneNumber` to `SubTypeEnum`

`SubTypeEnum` was missing `PHONE_NUMBER` even though `PhoneNumberButton` type and the template factory already use this value. This caused a type mismatch when constructing `ButtonComponentObject.sub_type` for template messages with phone number buttons.
