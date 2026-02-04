# Flows API

## Overview
Manage WhatsApp Flows: list, create, update metadata, upload JSON assets, publish, and deprecate.

## Endpoints
- GET /{WABA_ID}/flows
- POST /{WABA_ID}/flows
- GET /{FLOW_ID}?fields&date_format
- POST /{FLOW_ID}
- GET /{FLOW_ID}/assets
- POST /{FLOW_ID}/assets
- POST /{FLOW_ID}/publish
- POST /{FLOW_ID}/deprecate
- DELETE /{FLOW_ID}
- POST /{DESTINATION_WABA_ID}/migrate_flows

## Notes
- Create/list/migrate require a WABA ID.
- Flow JSON upload uses `multipart/form-data` with `file` and `asset_type`.
- Publishing requires valid flow JSON and proper webhook setup.

## Example
```ts
import WhatsApp from 'meta-cloud-api';
import { FlowCategoryEnum } from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

const flows = await client.flows.listFlows('WABA_ID');

const created = await client.flows.createFlow('WABA_ID', {
  name: 'support_flow',
  categories: [FlowCategoryEnum.Support],
  endpoint_uri: 'https://example.com/flow',
  publish: false,
});

const flow = await client.flows.getFlow(created.id);

await client.flows.updateFlowMetadata(created.id, {
  name: 'support_flow_v2',
});

await client.flows.publishFlow(created.id);
```

## Example Details
- Flow list/create calls require a WABA ID (not the phone number ID).
- `createFlow` sets `name`, `categories`, and `endpoint_uri`; `publish: false` keeps it in draft.
- `publishFlow` and `updateFlowMetadata` use the flow ID returned from creation.
