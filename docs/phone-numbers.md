# Phone Numbers API

## Overview
Retrieve phone number details, request verification codes, configure conversational automation, and check throughput.

## Endpoints
- GET /{PHONE_NUMBER_ID}?fields
- GET /{WABA_ID}/phone_numbers
- POST /{PHONE_NUMBER_ID}/request_code
- POST /{PHONE_NUMBER_ID}/verify_code
- POST /{PHONE_NUMBER_ID}/conversational_automation
- GET /{PHONE_NUMBER_ID}?fields=conversational_automation
- GET /{PHONE_NUMBER_ID}?fields=throughput

## Notes
- Fields can be a comma-separated string or string array.
- Verification `code_method` is `SMS` or `VOICE`.
- Conversational automation supports welcome messages, prompts, and commands.

## Example
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

## Example Details
- `getPhoneNumbers` lists numbers for the configured WABA.
- `getPhoneNumberById` accepts a fields array like `display_phone_number` and `verified_name`.
- `requestVerificationCode` uses `code_method` and `language` to deliver the code.
- `setConversationalAutomation` toggles `enable_welcome_message` and sets user-facing `prompts`.
- `getThroughput` reads throughput info for the phone number.
