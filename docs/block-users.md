# Block Users API

## Overview
Block or unblock users and list blocked users with pagination.

## Endpoints
- POST /{PHONE_NUMBER_ID}/block_users
- DELETE /{PHONE_NUMBER_ID}/block_users
- GET /{PHONE_NUMBER_ID}/block_users?limit&after&before

## Notes
- Only users who messaged in the last 24 hours can be blocked.
- `block_users` accepts an array of phone numbers or WA IDs.
- List responses include paging cursors.

## Example
```ts
import WhatsApp from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

await client.blockUsers.block(['15551234567']);
await client.blockUsers.unblock(['15551234567']);

const list = await client.blockUsers.listBlockedUsers({ limit: 10 });
```

## Example Details
- `block` and `unblock` accept arrays of E.164 numbers or WA IDs.
- `listBlockedUsers` supports `limit`, `after`, and `before` for pagination.
- All requests use the phone number ID configured in the client.
