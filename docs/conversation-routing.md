# Conversation Routing & Thread Control

## Overview
Conversation Routing (documented September 23, 2026) decides which responder receives each inbound message when more than one responder — several partners, or a partner alongside Meta Business Agent — shares a WhatsApp account. Each thread (a business phone number plus a WhatsApp user) has exactly one owner, or none (idle). Thread control lets a responder pass, release, or take that ownership.

Routing is not enabled through the API: it becomes active once the account has more than one responder and the business has a routing configuration in Meta Business Suite. The account must be enrolled for thread control before the endpoint accepts requests.

## Prepare existing integrations before changing routing

Before assigning another partner, check Conversation Routing in Meta Business Suite. If the account has no configuration, the assignment can create one and change inbound delivery for existing integrations. An existing configuration is preserved; agency-only access does not change routing. Review every integration across the account's phone numbers, including direct integrations, and confirm readiness before creating the initial configuration. Account defaults apply unless a phone-number-specific configuration overrides them. Existing owned threads are not immediately transferred: changes take effect when a thread becomes idle or is routed again. Review primary responders, standby visibility, and escalation roles afterward. See [Prepare before assigning another partner](https://developers.facebook.com/documentation/business-messaging/whatsapp/conversation-routing/prepare-before-assigning-a-partner/).

Enabling Meta Business Agent for live conversations changes routing even when a configuration already exists. The agent becomes primary for new messaging conversations; previous primary responders move to standby and receive `standby` instead of `messages` when they do not own the thread. Incoming-call routing is preserved. Agent setup and the Agent Test API do not change live routing. Check account-default versus phone-number-specific scope, confirm every affected integration supports the required webhook fields and ownership changes, then test delivery and handoffs after enablement. See [Prepare before enabling Meta Business Agent](https://developers.facebook.com/documentation/business-messaging/whatsapp/conversation-routing/prepare-before-enabling-meta-business-agent/).

The SDK already exposes `onStandby`, `onMessagingHandovers`, and `threadControl`. These September 29–30, 2026 updates clarify operational readiness; they introduce no new endpoint or payload fields. Standby handlers must not automatically reply to traffic they do not own.

## Endpoints
- POST /{PHONE_NUMBER_ID}/thread_control

## Notes
- Identify the WhatsApp user with exactly one of `to` (phone number or wa_id) or `recipient` (BSUID, preferred). Both or neither is rejected; the SDK throws a `WhatsAppValidationError` before sending.
- `pass` — the current owner hands the thread to another responder. Without `control_pass` it goes to the escalation partner; with `control_pass.target_role` it goes to `ai_agent`, `ctwa`, `customer_service`, `escalation`, `marketing`, or `utility`. `ai_agent` exists only where Meta Business Agent is enabled.
- `release` — the owner returns the thread to idle; the next inbound message is re-routed by entry point. Releasing an idle thread succeeds. No webhook fires.
- `take` — only the escalation partner may call it (other callers get error `2494191`). The escalation partner also takes a thread implicitly by sending a Service message.
- `metadata` (optional, max 2,000 characters) is forwarded verbatim on the resulting `messaging_handovers` event.
- Every successful action returns `{ messaging_product, request_id }`. Since September 25, 2026 `request_id` is included so you can quote it when contacting support about a specific call; failed requests still carry `fbtrace_id` on the error.
- There is no endpoint that reports the current owner. Track ownership locally from inbound messages, `messaging_handovers` events, standby events, and rejected Service sends, and reconcile after 24 hours of user inactivity, when the thread returns to idle on its own.

### Webhooks
- `processor.onMessagingHandovers(...)` — `value.type` is `control_passed` (delivered to the new owner, `value.control_passed`) or `control_taken` (delivered to the previous owner, `value.control_taken`). Both carry `previous_owner_role`, `new_owner_role`, and `metadata`; `control_passed` can also carry `conversation_context`.
- `conversation_context` (`{ type: 'summary', summary: { text } }`) is an AI-generated recap of the conversation. It also arrives on the `messages` field alongside the `messages` array; the SDK surfaces it as `processed.conversationContext` in message handlers. It is sent only when you are not receiving standby events and the business is eligible, so treat it as optional and do not parse `summary.text`.
- `processor.onStandby(...)` — standby partners receive copies of threads they do not own and must not reply.
- Calls route separately through the Incoming Call entry point: call webhooks go to that entry point's primary on `calls`, while call permission replies arrive on `messages` as `interactive.type: 'call_permission_reply'`, so subscribe to both. Calls never create, transfer, or clear thread ownership, and thread control does not apply to calls.

## Example
```ts
import WhatsApp from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

// Hand the thread to the customer service responder
const { request_id } = await client.threadControl.pass({
  recipient: 'US.13491208655302741918',
  metadata: 'WhatsApp user requested human agent',
  control_pass: { target_role: 'customer_service' },
});

// Return the thread to idle
await client.threadControl.release({ to: '15551234567' });

// Escalation partner only
await client.threadControl.take({ to: '15551234567', metadata: 'Human agent stepping in' });
```

```ts
Whatsapp.processor.onMessagingHandovers(async (wa, { value }) => {
  if (value.type === 'control_passed') {
    console.log('Now owner as', value.control_passed?.new_owner_role);
    console.log(value.control_passed?.conversation_context?.summary.text);
  } else if (value.type === 'control_taken') {
    console.log('Lost thread to', value.control_taken?.new_owner_role);
  }
});

Whatsapp.processor.onText(async (wa, processed) => {
  console.log(processed.conversationContext?.summary.text);
});
```

## Example Details
- All three methods send `messaging_product: 'whatsapp'` and `action` to `POST /{PHONE_NUMBER_ID}/thread_control`.
- The SDK rejects `control_pass` on `release`/`take` and `metadata` longer than 2,000 characters before sending.
- See Meta's [Conversation Routing overview](https://developers.facebook.com/documentation/business-messaging/whatsapp/conversation-routing/overview/) and [Thread control](https://developers.facebook.com/documentation/business-messaging/whatsapp/conversation-routing/thread-control/).
