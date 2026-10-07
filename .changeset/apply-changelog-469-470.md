---
'meta-cloud-api': minor
---

Apply Cloud API changelog entries #469-#470: type payment request CTA templates for Brazil, including one-click payment (`offsite_card_pay`) with the conditional `currency` and `total_amount` fields (`PaymentRequestButton`, `PaymentRequestObject`, `PaymentRequestActionParametersObject`, `SubTypeEnum.PaymentRequest`); let template button components carry non-text parameters; recognize error `131065` (max price unavailable in the recipient's country) as a send-message error and `138038` (call action from a responder other than the Conversation Routing Call primary) as a calling error; document the Call entry point rename.
