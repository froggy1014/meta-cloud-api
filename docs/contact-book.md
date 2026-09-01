# Contact Book

## Overview
The contact book pairs a WhatsApp user's phone number with their business-scoped user ID (BSUID). Meta hosts and populates it — no integration work is needed. Any message or call between a business phone number in your portfolio and a user stores that pairing, which is why webhooks keep including the phone number even after the user adopts a username.

It is scoped to the business portfolio, not to a single phone number, and only captures interactions from early April 2026 onward — there is no historical backfill.

## Endpoints
- DELETE /{PHONE_NUMBER_ID}/contact_book

## Notes
- `bsuid` must use the standard BSUID format (e.g. `US.13491208655302741918`).
- After a delete, the user's phone number and BSUID stop appearing in webhook payloads for every business phone number in the portfolio — unless the number is still in the 30-day cache, or a new interaction recreates the entry.
- Deleting is idempotent: since August 25, 2026 an unknown, malformed, or other-portfolio BSUID resolves with `deleted: false` instead of raising an API error. Read `result.deleted` to tell a real removal from a no-op.
- A read-only membership check (confirming a phone number is stored for a BSUID without retrieving it) was announced on August 24, 2026 but is not yet published in the public reference, so the SDK does not expose it.

## Example
```ts
import WhatsApp from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

const result = await client.contactBook.deleteEntry({
  bsuid: 'US.13491208655302741918',
});

console.log(result.deleted);
```

## Example Details
- `deleteEntry` sends `messaging_product=whatsapp` and `bsuid` as query parameters and throws a `WhatsAppValidationError` when `bsuid` is missing.
- The response is `{ messaging_product, success, deleted }`; `deleted` is `false` when no entry matched the BSUID.
