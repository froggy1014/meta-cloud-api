---
'meta-cloud-api': patch
---

Add Direct Send authentication OTP copy code buttons (`OtpButtonObject` on interactive `action.buttons`, plus `client.messages.interactiveOtp` which defaults `category` to `'authentication'`), and type `bid_country_multiplier_overrides` on `TemplateOptimizationSpec` for per-country max price multipliers (up to 240 entries).
