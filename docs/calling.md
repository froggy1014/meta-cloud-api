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
