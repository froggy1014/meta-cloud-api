# Groups API

```ts
import WhatsApp from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

const group = await client.groups.createGroup({
  subject: 'New Group',
  description: 'Group description',
  join_approval_mode: 'auto_approve',
});

const info = await client.groups.getGroupInfo(group.id, [
  'subject',
  'description',
  'participants',
]);

const invite = await client.groups.getGroupInviteLink(group.id);

await client.groups.removeParticipants(group.id, ['15551234567']);
await client.groups.deleteGroup(group.id);
```
