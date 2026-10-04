---
'meta-cloud-api': patch
---

Apply Cloud API changelog entry #468: document the `account_update` webhook `phone_number` field (business display phone number, sent only for events about a single business phone number such as `ACCOUNT_VIOLATION` and calling-related `ACCOUNT_RESTRICTION`), and add the documented `RestrictionType` values for calling and utility-template restrictions plus the correct `RESTRICTED_ADD_PHONE_NUMBER_ACTION` spelling (the old spelling stays as deprecated).
