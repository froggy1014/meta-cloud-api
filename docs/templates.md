# Templates API

## Overview
Create, update, list, and delete message templates on your WABA. Templates must be approved before use.

## Endpoints
- GET /{WABA_ID}/message_templates?...
- POST /{WABA_ID}/message_templates
- GET /{TEMPLATE_ID}
- POST /{TEMPLATE_ID}
- DELETE /{WABA_ID}/message_templates?...

## Notes
- Template requests use the WABA business account ID.
- Components define the template body, header, footer, and buttons.
- Updates are partial; pass only fields to change.

## Automatic category updates after a category review
Meta clarified on September 15, 2026 that a template whose category was **confirmed by a category review** stays subject to automatic category updates: if the messages the template actually sends do not meet the [template category guidelines](https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-categorization), Meta can still act on the template. A passed review is not a permanent exemption.

Handle that through the webhooks the SDK already exposes: `onTemplateCorrectCategoryDetection` (`template_correct_category_detection`, the advance notice — `current_category` plus `suggested_category`) and `onTemplateCategoryUpdate` (`template_category_update`, the change itself — `previous_category` plus `new_category`). Treat a template's category as server-owned state: read it back with `client.templates.getTemplate(templateId)` rather than caching the category you sent at create time.

## Payment request CTA templates (Brazil, October 5, 2026)
Brazilian merchants can add up to three `PAYMENT_REQUEST` buttons to a `UTILITY` or `MARKETING` template, each with its own method: Pix dynamic code, Boleto, Payment Link, or, since October 5, 2026, **one-click payment** (`offsite_card_pay`). The SDK types the button as `PaymentRequestButton` on `client.templates.createTemplate` and the send-time parameter as `PaymentRequestActionParametersObject` on `client.messages.template` (`sub_type: SubTypeEnum.PaymentRequest`, parameter `type: ParametersTypesEnum.Action`).

- Template creation: one-click payment is the only type with no sample value. Send `payment_setting: { type: 'offsite_card_pay' }` with button text `Review payment`. The other types carry a sample (`pix_dynamic_code.code`, `boleto.digitable_line`, `payment_link.uri`) with the fixed texts `Copy Pix code`, `Copy Boleto code`, `Open payment link`. A template supports three buttons in total.
- Sending: `payment_request.payment_setting.offsite_card_pay` takes `last_four_digits` (shown to the user for confirmation) and an optional `credential_id`, which Meta echoes in the payment confirmation webhook.
- `currency` (`'BRL'`) and `total_amount` (`{ value, offset }`, with `offset: 100`, so 12.34 BRL is `value: 1234`) sit **beside** `payment_setting` inside `payment_request`. Both are required for one-click payment, optional for Pix (the amount is shown to the user), and not used for Boleto or Payment Link. `PaymentRequestObject` enforces these combinations.
- WhatsApp does not disable a payment button when the underlying code or link expires; manage expiry yourself.
- See Meta's [Payment request CTA templates (Brazil)](https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/payment-request-cta/) and [One-click payments](https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/one-click-payments/).

## Example
```ts
import WhatsApp from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

const templates = await client.templates.getTemplates({
  name: 'order_update',
  limit: 10,
});

const created = await client.templates.createTemplate({
  name: 'welcome_message',
  category: 'MARKETING',
  language: 'en_US',
  components: [
    { type: 'BODY', text: 'Hi {{1}}, welcome aboard!' },
  ],
});

await client.templates.updateTemplate(created.id, {
  components: [
    { type: 'BODY', text: 'Hi {{1}}, thanks for joining!' },
  ],
});
```

## Example Details
- `getTemplates` can filter by `name` and `limit` to page results.
- `createTemplate` requires `name`, `category`, `language`, and `components` to match the template format.
- `updateTemplate` uses the template ID and only the fields you want to change.
