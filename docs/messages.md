# Messages API

```ts
import WhatsApp from 'meta-cloud-api';
import { ComponentTypesEnum, LanguagesEnum, ParametersTypesEnum } from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

await client.messages.text({
  to: '15551234567',
  body: 'Hello from Messages API',
});

await client.messages.template({
  to: '15551234567',
  body: {
    name: 'order_update',
    language: { code: LanguagesEnum.English_US },
    components: [
      {
        type: ComponentTypesEnum.Body,
        parameters: [
          { type: ParametersTypesEnum.Text, text: 'Jane' },
          { type: ParametersTypesEnum.Text, text: 'A123' },
        ],
      },
    ],
  },
});
```
