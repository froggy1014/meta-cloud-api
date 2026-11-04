---
'meta-cloud-api': patch
---

Add Direct Send one-tap autofill and zero-tap OTP buttons (`OtpButtonObject.otp` is now a union of `OtpCopyCodeParams`, `OtpOneTapParams`, and `OtpZeroTapParams` with `supported_apps`, `autofill_text`, and `zero_tap_terms_accepted`), static WebP for image messages (`ImageMediaTypesEnum.Webp`), and an optional `messaging_account_id` on every Calling API call action (`initiateCall`, `preAcceptCall`, `acceptCall`, `rejectCall`, `terminateCall`).
