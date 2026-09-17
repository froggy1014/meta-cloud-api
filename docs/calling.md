# Calling API

## Overview
Configure calling, check permissions, and control call sessions.

## Endpoints
- POST /{PHONE_NUMBER_ID}/settings
- GET /{PHONE_NUMBER_ID}/settings?fields&include_sip_credentials
- GET /{PHONE_NUMBER_ID}/call_permissions?user_wa_id
- POST /{PHONE_NUMBER_ID}/calls

## Notes
- Call actions use `action` values: `connect`, `pre_accept`, `accept`, `reject`, `terminate`.
- `session` must include `sdp_type` and `sdp`.
- `biz_opaque_callback_data` is optional for tracking.
- `initiateCall` and `acceptCall` accept optional per-call `recording` and `transcription` configs (`status`, `purpose`, `announcement_language`). Results arrive via the `call_recording_available` / `call_transcription_available` webhook events on the `calls` field.
- SIP-enabled numbers receive `call_created` and `terminate` call webhooks; SIP webhooks omit the `session` object since signaling is handled via SIP.
- Calling API rate cards effective **October 1, 2026** (published September 11, 2026) span 16 currencies. Bangladesh, Iraq, Kazakhstan, Kuwait, Morocco, Nepal, Oman, Sri Lanka, and Ukraine leave their "Rest of" pricing region and become standalone entries; each keeps the rate of the region it leaves, so calling rates themselves do not change. Rate cards are billing data only — no SDK endpoint, payload, or webhook change. See Meta's [Calling pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/pricing/).

## Sharing one phone number across providers
Meta updated its Calling integration guidance and FAQ on September 16, 2026 to recommend the **new WhatsApp account model** — [Multi-Solution Conversations (MSC)](https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/multi-solution-conversations) — when a business uses one Solution Partner for messaging and another for calling on the same phone number. The older pattern of pointing two apps at one WABA is no longer the recommended path; the third-party voice provider pattern (a calling vendor behind a single partner, no Meta app of its own) remains a separate option and still forbids PSTN on any leg of the call.

- Onboarding runs through your Embedded Signup integration, outside this SDK. Meta creates a partner-specific account that is shared with you, so each partner keeps its own WhatsApp Business Account, templates, billing, and metrics for the shared number. Up to 5 partners or solutions can be enabled per end-business account.
- Construct the client with the `waba_id` and phone number ID returned to *your* partner from onboarding. `client.calling.*` (settings, call permissions, calls) works unchanged against them.
- Every partner the number is shared with currently receives the incoming webhooks. Subscribe your calling app only to the `calls` field and handle it with `processor.onCalls(...)`; the messaging partner subscribes to the message fields. Subscribe to `account_update` as well and handle it with `processor.onAccountUpdate(...)` — `AccountUpdateEvent` already carries the shared-account lifecycle events (`PARTNER_ADDED`, `PARTNER_REMOVED` with `disconnection_info`, `ACCOUNT_OFFBOARDED`, `ACCOUNT_RECONNECTED`).
- See Meta's [Calling integration patterns](https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/integration-patterns) and [Calling FAQ](https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/faq/). Guidance change only; no SDK endpoint, payload, or webhook type change.

## Example
```ts
import WhatsApp from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

await client.calling.updateCallingSettings({
  calling: {
    status: 'ENABLED',
    call_icon_visibility: 'DEFAULT',
  },
});

const permissions = await client.calling.getCallPermissions({
  userWaId: '15551234567',
});

const call = await client.calling.initiateCall({
  to: '15551234567',
  session: { sdp_type: 'offer', sdp: 'v=0' },
});

await client.calling.terminateCall({ call_id: call.calls[0].id });
```

## Example Details
- `updateCallingSettings` toggles availability and icon visibility for the number.
- `getCallPermissions` checks whether a user can be called using `userWaId`.
- `initiateCall` requires `session.sdp_type` and `session.sdp` values from your SIP stack.
- `terminateCall` uses the `call_id` returned from `initiateCall`.
