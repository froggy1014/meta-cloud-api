# Groups API

## Overview
Create groups, manage join requests, invite links, participants, and settings.

## Endpoints
- POST /{PHONE_NUMBER_ID}/groups
- GET /{PHONE_NUMBER_ID}/groups?limit&after&before
- GET /{GROUP_ID}?fields
- POST /{GROUP_ID}
- DELETE /{GROUP_ID}
- GET /{GROUP_ID}/invite_link
- POST /{GROUP_ID}/invite_link
- GET /{GROUP_ID}/join_requests
- POST /{GROUP_ID}/join_requests
- DELETE /{GROUP_ID}/join_requests
- DELETE /{GROUP_ID}/participants

## Notes
- `join_approval_mode` can be `auto_approve` or `approval_required`.
- Participant removal supports up to 8 users per request.
- Group settings updates can include a profile picture file.

## Example
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

## Example Details
- `createGroup` sets `subject`, `description`, and `join_approval_mode`.
- `getGroupInfo` uses a fields array to limit the payload size.
- `getGroupInviteLink` returns a shareable link; `removeParticipants` takes WA IDs.
- `deleteGroup` removes the group permanently.
