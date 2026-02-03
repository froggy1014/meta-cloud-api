# Templates API

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
