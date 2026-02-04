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
