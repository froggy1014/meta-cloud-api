# Calling API

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
