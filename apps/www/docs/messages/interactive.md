---
sidebar_position: 10
---

# Interactive Messages

Interactive messages allow you to create rich, interactive experiences within WhatsApp conversations. They include buttons, lists, and product messages that users can interact with directly, making your conversations more engaging and efficient.

## Basic Usage

```typescript
import WhatsApp from 'meta-cloud-api';

// Initialize client
const whatsapp = new WhatsApp({
  phoneNumberId: YOUR_PHONE_NUMBER_ID,
  accessToken: 'YOUR_ACCESS_TOKEN'
});

// Send an interactive message with buttons
const response = await whatsapp.messages.interactive(
  {
    type: "button",
    body: {
      text: "Would you like to proceed with your order?"
    },
    action: {
      buttons: [
        {
          type: "reply",
          reply: {
            id: "confirm-btn",
            title: "Confirm Order"
          }
        },
        {
          type: "reply",
          reply: {
            id: "cancel-btn",
            title: "Cancel Order"
          }
        }
      ]
    }
  },
  15551234567
);

console.log(`Interactive message sent with ID: ${response.data.messages[0].id}`);
```

## Interactive Message Types

WhatsApp supports four types of interactive messages:

1. **Button Messages**: Include up to 3 buttons for simple selection
2. **List Messages**: Present a menu of options (up to 10 sections with 10 options each)
3. **Product Messages**: Showcase a single product from your catalog
4. **Product List Messages**: Display multiple products from your catalog

## Button Interactive Messages

Button messages are ideal for simple choices or confirmations.

```typescript
const buttonResponse = await whatsapp.messages.interactive(
  {
    type: "button",
    header: {  // Optional header
      type: "text",
      text: "Order Confirmation"
    },
    body: {
      text: "Your order #12345 is ready for pickup. Would you like to confirm?"
    },
    footer: {  // Optional footer
      text: "Reply anytime to get help"
    },
    action: {
      buttons: [
        {
          type: "reply",
          reply: {
            id: "yes-pickup",
            title: "Yes, I'll pick up"
          }
        },
        {
          type: "reply",
          reply: {
            id: "reschedule",
            title: "Reschedule"
          }
        },
        {
          type: "reply",
          reply: {
            id: "cancel",
            title: "Cancel Order"
          }
        }
      ]
    }
  },
  15551234567
);
```

### Button Message Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| type | string | Must be "button" | Yes |
| header | object | Message header (text, image, document, or video) | No |
| body | object | Main message content | Yes |
| footer | object | Message footer | No |
| action | object | Contains the buttons array | Yes |

Each button must have:
- A unique ID (max 256 characters)
- A title (max 20 characters)
- The type "reply"

## List Interactive Messages

List messages allow you to present multiple options organized in sections.

```typescript
const listResponse = await whatsapp.messages.interactive(
  {
    type: "list",
    header: {
      type: "text",
      text: "Product Categories"
    },
    body: {
      text: "Please select a category to browse products"
    },
    footer: {
      text: "Tap a category to see options"
    },
    action: {
      button: "Browse Categories", // Text on the main button
      sections: [
        {
          title: "Bestsellers",
          rows: [
            {
              id: "bestseller-electronics",
              title: "Electronics",
              description: "Phones, laptops, and more" // Optional
            },
            {
              id: "bestseller-clothing",
              title: "Clothing",
              description: "Shirts, pants, and accessories"
            }
          ]
        },
        {
          title: "New Arrivals",
          rows: [
            {
              id: "new-furniture",
              title: "Furniture",
              description: "Home and office furniture"
            },
            {
              id: "new-kitchen",
              title: "Kitchen",
              description: "Cookware and appliances"
            }
          ]
        }
      ]
    }
  },
  15551234567
);
```

### List Message Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| type | string | Must be "list" | Yes |
| header | object | Message header (text, image, document, or video) | No |
| body | object | Main message content | Yes |
| footer | object | Message footer | No |
| action | object | Contains the button text and sections array | Yes |

The action object must include:
- button (string): Text for the main list button (max 20 characters)
- sections (array): Up to 10 sections, each with a title and rows

Each row must have:
- A unique ID (max 256 characters)
- A title (max 24 characters)
- An optional description (max 72 characters)

## Product Interactive Messages

To use product messages, you must have a WhatsApp Commerce account with a product catalog. These messages showcase products directly in the chat.

```typescript
const productResponse = await whatsapp.messages.interactive(
  {
    type: "product",
    body: {
      text: "Check out this product"
    },
    action: {
      catalog_id: "123456789",
      product_retailer_id: "SKU12345"
    }
  },
  15551234567
);
```

## Product List Interactive Messages

Product list messages allow you to showcase multiple products from your catalog.

```typescript
const productListResponse = await whatsapp.messages.interactive(
  {
    type: "product_list",
    header: {
      type: "text",
      text: "Summer Collection"
    },
    body: {
      text: "Our latest summer products"
    },
    footer: {
      text: "Tap to browse"
    },
    action: {
      catalog_id: "123456789",
      sections: [
        {
          title: "Summer Shirts",
          product_items: [
            { product_retailer_id: "SKU123" },
            { product_retailer_id: "SKU124" }
          ]
        },
        {
          title: "Summer Pants",
          product_items: [
            { product_retailer_id: "SKU789" },
            { product_retailer_id: "SKU790" }
          ]
        }
      ]
    }
  },
  15551234567
);
```

## Header Options

Interactive messages can include different types of headers:

### Text Header

```typescript
header: {
  type: "text",
  text: "Order Status"
}
```

### Image Header

```typescript
header: {
  type: "image",
  image: {
    link: "https://example.com/header-image.jpg"
  }
}
```

### Document Header

```typescript
header: {
  type: "document",
  document: {
    link: "https://example.com/order-details.pdf",
    filename: "Order_Details.pdf"
  }
}
```

### Video Header

```typescript
header: {
  type: "video",
  video: {
    link: "https://example.com/product-video.mp4"
  }
}
```

## Handling Responses

When users interact with your interactive messages, you'll receive webhooks with their selections. The data will be in the webhook payload:

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "PHONE_NUMBER",
          "phone_number_id": "PHONE_NUMBER_ID"
        },
        "contacts": [{
          "profile": {
            "name": "CONTACT_NAME"
          },
          "wa_id": "CONTACT_PHONE_NUMBER"
        }],
        "messages": [{
          "context": {
            "from": "PHONE_NUMBER_ID",
            "id": "wamid.ID"
          },
          "from": "CONTACT_PHONE_NUMBER",
          "id": "wamid.ID",
          "timestamp": "TIMESTAMP",
          "type": "interactive",
          "interactive": {
            "type": "button_reply",
            "button_reply": {
              "id": "confirm-btn",
              "title": "Confirm Order"
            }
          }
        }]
      }
    }]
  }]
}
```

## Error Handling

```typescript
try {
  const response = await whatsapp.messages.interactive(
    {
      type: "button",
      body: {
        text: "Would you like to proceed with your order?"
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: "confirm-btn",
              title: "Confirm Order"
            }
          },
          {
            type: "reply",
            reply: {
              id: "cancel-btn",
              title: "Cancel Order"
            }
          }
        ]
      }
    },
    15551234567
  );
  console.log("Interactive message sent successfully:", response.data);
} catch (error) {
  console.error("Error sending interactive message:", error);
  
  if (error.response && error.response.data) {
    console.log("Error details:", error.response.data);
  }
}
```

## Best Practices

1. **Keep it simple**: Use the simplest interactive message type that meets your needs.

2. **Use clear labels**: Button and list titles should be concise and descriptive.

3. **Provide context**: Include clear text in the body to explain what choices users are making.

4. **Test on mobile**: Ensure your interactive messages display well on mobile screens.

5. **Prepare for responses**: Have proper handling in place for all possible user selections.

6. **Stay within limits**: Respect the character limits for titles, descriptions, and other fields.

## Related

- [Template Messages](./template.md) - Templates can also include interactive elements
- [Webhooks](../webhooks.md) - Learn more about handling interactive message responses 