# Payments API — Brazil

Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/overview/

Brazil payments use **interactive messages** (`order_details` / `order_status`) and optional **order details templates**. Meta does not reconcile Pix/boleto/link payments — your PSP handles that using the `reference_id`.

## Prerequisites

- Brazilian WABA and Brazilian customer phone numbers
- Meta product catalog linked to the WABA (catalog checkout flows)
- PSP integration for payment confirmation (Pix dynamic code, payment link, boleto, or one-click)

## Send order_details (Pix)

```ts
import WhatsApp from 'meta-cloud-api';

const client = new WhatsApp({ /* ... */ });

await client.messages.interactiveOrderDetailsBrPix({
    to: '5511999999999',
    body: 'Complete your Pix payment within 15 minutes.',
    pix: {
        code: '00020101021226700014br.gov.bcb.pix2548pix.example.com...',
        merchant_name: 'My Store',
        key: '39580525000189',
        key_type: 'CNPJ',
    },
    orderDetails: {
        reference_id: 'order-001',
        type: 'digital-goods',
        total_amount: { value: 50000, offset: 100 },
        order: {
            status: 'pending',
            items: [{
                retailer_id: '1234567',
                name: 'Cake',
                amount: { value: 50000, offset: 100 },
                quantity: 1,
            }],
            subtotal: { value: 50000, offset: 100 },
            tax: { value: 0, offset: 100 },
        },
    },
});
```

## Update order status after PSP confirms payment

```ts
await client.messages.interactiveOrderStatusBr({
    to: '5511999999999',
    body: 'Payment received. Your order is being processed.',
    orderStatus: {
        reference_id: 'order-001',
        order: { status: 'processing' },
        payment: { status: 'captured', timestamp: Math.floor(Date.now() / 1000) },
    },
});
```

## Order details template

Create:

```ts
import { createOrderDetailsTemplate } from 'meta-cloud-api';
import { CategoryEnum, LanguagesEnum } from 'meta-cloud-api/enums';

await client.templates.createTemplate(
    createOrderDetailsTemplate({
        name: 'order_details_cart',
        language: LanguagesEnum.Portuguese_BR,
        category: CategoryEnum.Utility,
        body: { text: 'Your total is {{1}}' },
        order_details_button: { text: 'Copy Pix code' },
    }),
);
```

Send:

```ts
await client.messages.templateOrderDetailsBrPix({
    to: '5511999999999',
    template: {
        name: 'order_details_cart',
        language: { policy: 'deterministic', code: 'pt_BR' },
    },
    pix: { /* ... */ },
    orderDetails: { /* reference_id, total_amount, order */ },
});
```

## Order status template

Use outside the customer service window to notify shipment, completion, or cancellation. Same API for Brazil and India.

Create:

```ts
import { createOrderStatusTemplate } from 'meta-cloud-api';
import { CategoryEnum, LanguagesEnum } from 'meta-cloud-api/enums';

await client.templates.createTemplate(
    createOrderStatusTemplate({
        name: 'order_status_shipped',
        language: LanguagesEnum.Portuguese_BR,
        body: { text: 'Your order {{1}} has shipped.' },
        footer: { text: 'Questions? Reply to this message.' },
    }),
);
```

Send:

```ts
await client.messages.templateOrderStatus({
    region: 'br',
    to: '5511999999999',
    template: {
        name: 'order_status_shipped',
        language: { policy: 'deterministic', code: 'pt_BR' },
    },
    orderStatus: {
        reference_id: 'order-001',
        order: { status: 'shipped', description: 'Expected delivery in 2 days' },
    },
});
```

Use `region: 'in'` for India order status templates.

## Payment Request CTA templates

Simpler payment requests without full order_details integration. Supports Pix, Boleto, and Payment Link buttons (up to 3 per template).

Create:

```ts
import { createPaymentRequestTemplate } from 'meta-cloud-api';
import { LanguagesEnum } from 'meta-cloud-api/enums';

await client.templates.createTemplate(
    createPaymentRequestTemplate({
        name: 'payment_request_pix',
        language: LanguagesEnum.Portuguese_BR,
        body: { text: 'Your payment is ready' },
        payment_request_buttons: [
            {
                text: 'Copy Pix code',
                payment_setting: {
                    type: 'pix_dynamic_code',
                    pix_dynamic_code: {
                        code: '00020101021226700014br.gov.bcb.pix2548pix.example.com...',
                    },
                },
            },
        ],
    }),
);
```

Send:

```ts
await client.messages.templatePaymentRequestBr({
    to: '5511999999999',
    template: {
        name: 'payment_request_pix',
        language: { code: 'pt_BR' },
    },
    paymentRequests: [
        {
            paymentSetting: {
                type: 'pix_dynamic_code',
                pix_dynamic_code: {
                    code: '00020101021226700014br.gov.bcb.pix2548pix.example.com...',
                },
            },
        },
    ],
});
```

Note: Payment Request CTA uses a simpler Pix shape (`{ code }` only) than order_details messages.

Invalid status transitions return webhook error `2046`. Canceling a paid order returns error `2047`.

## Webhooks

| Event | Handler | Notes |
|-------|---------|-------|
| One-click payment intent | `webhook.onPaymentMethod()` | `interactive.type: payment_method` with `reference_id`, `credential_id` |
| Order details template tap | `webhook.onButton()` + `isOrderDetailsButtonClick()` | `payload: ORDER_DETAILS_CLICKED` |
| Payment config changes | `webhook.onPaymentConfigurationUpdate()` | Shared with India |
| India PG payment status | `webhook.onPaymentStatus()` | `statuses[].type: payment` (India gateway flows) |

```ts
import { WebhookProcessor, isOrderDetailsButtonClick, getPaymentMethodSelection } from 'meta-cloud-api';

const webhook = new WebhookProcessor({ /* ... */ });

webhook.onPaymentMethod((_client, event) => {
    const selection = getPaymentMethodSelection(event.message);
    // charge via PSP using selection.referenceId + selection.credentialId
});

webhook.onButton((_client, event) => {
    if (isOrderDetailsButtonClick(event.message)) {
        // user opened order details from template
    }
});
```

## Webhook helpers

Exported from `meta-cloud-api` (parsers, not payload builders):

- `getPaymentMethodSelection`, `isPaymentMethodMessage` — Brazil one-click
- `isOrderDetailsButtonClick`, `ORDER_DETAILS_CLICKED_PAYLOAD` — order details template taps
- `getPaymentTransactionInfo`, `isPaymentTransactionStatus` — India PG payment status

Use `MessagesApi` methods (`interactiveOrderDetailsBr`, `templatePaymentRequestBr`, etc.) to send messages — builders are internal.

## Related docs

- [Orders](https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/orders/)
- [Order details templates](https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/orderdetailstemplate/)
- [Payments India](./payments.md) — WABA payment configuration API
