# Flows API

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
