# Phone Numbers API

```ts
import WhatsApp from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

const allNumbers = await client.phoneNumbers.getPhoneNumbers();

const phoneInfo = await client.phoneNumbers.getPhoneNumberById([
  'display_phone_number',
  'verified_name',
]);

await client.phoneNumbers.requestVerificationCode({
  code_method: 'SMS',
  language: 'en_US',
});

await client.phoneNumbers.setConversationalAutomation({
  enable_welcome_message: true,
  prompts: ['Book a flight', 'Talk to support'],
});

const throughput = await client.phoneNumbers.getThroughput();
```
