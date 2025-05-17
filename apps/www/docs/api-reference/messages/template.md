---
sidebar_position: 10
---

# Template Messages

Template messages are pre-approved message formats that allow businesses to send notifications to customers according to WhatsApp's policy guidelines. They're essential for proactive, non-conversational messages and help ensure your communications comply with WhatsApp's Business Messaging policies.

## Basic Usage

```typescript
import WhatsApp from 'meta-cloud-api';

// Initialize client
const whatsapp = new WhatsApp({
  phoneNumberId: YOUR_PHONE_NUMBER_ID,
  accessToken: 'YOUR_ACCESS_TOKEN'
});

// Send template message
const response = await whatsapp.messages.template({
  body: {
    name: "hello_world",
    language: {
      code: "en_US",
      policy: "deterministic"
    },
    components: [
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: "John"
          }
        ]
      }
    ]
  },
  to: "15551234567"
});

console.log(`Template message sent with ID: ${response.messages[0].id}`);
```

## Parameters

The `template()` method accepts an object with the following parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| body | MessageTemplateObject | Contains template configuration including name, language, and components |
| to | string | The recipient's phone number with country code |
| replyMessageId | string (optional) | ID of a message to reply to |

### MessageTemplateObject

The template body object contains the template configuration:

| Property | Type | Description |
|----------|------|-------------|
| name | string | Name of the template |
| language | object | Language configuration with code and policy |
| components | array | Array of component objects for personalizing the template |

### Language Object

```typescript
{
  language: {
    code: "en_US",  // Language code
    policy: "deterministic"
  }
}
```

### Components Array

The components array contains objects for header, body, footer, and buttons:

```typescript
{
  components: [
    {
      type: "body",
      parameters: [
        {
          type: "text",
          text: "John"
        },
        {
          type: "currency",
          currency: {
            code: "USD",
            amount: 100
          }
        }
      ]
    },
    {
      type: "header",
      parameters: [
        {
          type: "image",
          image: {
            link: "https://example.com/image.jpg"
          }
        }
      ]
    },
    {
      type: "button",
      sub_type: "url",
      index: 0,
      parameters: [
        {
          type: "text",
          text: "View Details"
        }
      ]
    }
  ]
}
```

### Parameter Types

| Type | Description | Example |
|------|-------------|---------|
| text | Text parameter | `{ type: "text", text: "John" }` |
| currency | Currency with code and amount | `{ type: "currency", currency: { code: "USD", amount: 100 } }` |
| date_time | Date/time value | `{ type: "date_time", date_time: { fallback_value: "May 6, 2023" } }` |
| image | Image URL | `{ type: "image", image: { link: "https://example.com/image.jpg" } }` |
| document | Document URL | `{ type: "document", document: { link: "https://example.com/doc.pdf" } }` |
| video | Video URL | `{ type: "video", video: { link: "https://example.com/video.mp4" } }` |

## Template Components

Templates can have several component types:

| Component Type | Description |
|----------------|-------------|
| header | The top section of the template (optional) |
| body | The main content of the template (required) |
| footer | The bottom section of the template (optional) |
| buttons | Interactive buttons (optional) |

## Examples

### Text-Only Template

```typescript
const response = await whatsapp.messages.template({
  body: {
    name: "appointment_reminder",
    language: {
      code: "en_US",
      policy: "deterministic"
    },
    components: [
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: "John"
          },
          {
            type: "text",
            text: "May 15, 2023"
          },
          {
            type: "text",
            text: "2:30 PM"
          }
        ]
      }
    ]
  },
  to: "15551234567"
});
```

### Template with Header Image

```typescript
const response = await whatsapp.messages.template({
  body: {
    name: "order_confirmation",
    language: {
      code: "en_US",
      policy: "deterministic"
    },
    components: [
      {
        type: "header",
        parameters: [
          {
            type: "image",
            image: {
              link: "https://example.com/order_confirmed.jpg"
            }
          }
        ]
      },
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: "John"
          },
          {
            type: "text",
            text: "123456"
          }
        ]
      }
    ]
  },
  to: "15551234567"
});
```

### Template with Dynamic URL Button

```typescript
const response = await whatsapp.messages.template({
  body: {
    name: "shipping_update",
    language: {
      code: "en_US",
      policy: "deterministic"
    },
    components: [
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: "123456"
          },
          {
            type: "text",
            text: "May 15, 2023"
          }
        ]
      },
      {
        type: "button",
        sub_type: "url",
        index: 0,
        parameters: [
          {
            type: "text",
            text: "123456"
          }
        ]
      }
    ]
  },
  to: "15551234567"
});
```

### Template with Currency and Date Parameters

```typescript
const response = await whatsapp.messages.template({
  body: {
    name: "payment_receipt",
    language: {
      code: "en_US",
      policy: "deterministic"
    },
    components: [
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: "T12345"
          },
          {
            type: "currency",
            currency: {
              code: "USD",
              amount: 100.50
            }
          },
          {
            type: "date_time",
            date_time: {
              fallback_value: "May 6, 2023"
            }
          }
        ]
      }
    ]
  },
  to: "15551234567"
});
```

### Replying with a Template

```typescript
const originalMessageId = "wamid.abcd1234...";

const response = await whatsapp.messages.template({
  body: {
    name: "support_response",
    language: {
      code: "en_US",
      policy: "deterministic"
    },
    components: [
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: "John"
          },
          {
            type: "text",
            text: "123456"
          }
        ]
      }
    ]
  },
  to: "15551234567",
  replyMessageId: originalMessageId
});
```

## Creating and Managing Templates

Templates must be created and approved through Meta's WhatsApp Business Platform before they can be used. This is done through the Facebook Business Manager or Meta Developer Dashboard.

1. **Create a template** - Design your template with header, body, footer, and buttons
2. **Submit for approval** - Templates are reviewed against WhatsApp's guidelines
3. **Use approved templates** - Once approved, you can send the template via the API

Template approvals typically take 1-2 business days.

## Template Categories

WhatsApp templates fall into different categories based on their purpose:

| Category | Description | Examples |
|----------|-------------|----------|
| UTILITY | Service updates, reminders | Appointment reminders, shipping notifications |
| MARKETING | Promotional content | Sales, special offers, new product launches |
| AUTHENTICATION | Verification codes | Two-factor authentication codes |

## Error Handling

```typescript
try {
  const response = await whatsapp.messages.template({
    body: {
      name: "appointment_reminder",
      language: {
        code: "en_US",
        policy: "deterministic"
      },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: "John"
            },
            {
              type: "text",
              text: "May 15, 2023"
            }
          ]
        }
      ]
    },
    to: "15551234567"
  });
  console.log("Template message sent successfully:", response);
} catch (error) {
  console.error("Error sending template message:", error);
  
  // Handle specific error cases
  if (error.response && error.response.data) {
    console.log("Error details:", error.response.data);
    
    // Handle template not found
    if (error.response.data.error && error.response.data.error.code === 132000) {
      console.log("Template not found or not approved");
    }
    
    // Handle template parameter mismatch
    if (error.response.data.error && error.response.data.error.code === 132001) {
      console.log("Template parameter count mismatch");
    }
  }
}
```

## Common Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| 132000 | Template not found | Verify template name and that it's approved |
| 132001 | Component parameter mismatch | Ensure parameter count matches template |
| 132002 | Template language not supported | Use a supported language code |
| 132003 | Template components invalid | Check component structure |

## Best Practices

1. **Use templates appropriately**: Use templates for notifications and non-conversational messages.

2. **Keep templates concise**: Design clear, focused templates that deliver value.

3. **Variable management**: Ensure all variables in your template have appropriate values.

4. **Test thoroughly**: Test your templates with various parameter values before production use.

5. **Monitor performance**: Track delivery rates and user engagement with your templates.

6. **Follow approval guidelines**: Adhere to WhatsApp's guidelines to increase approval chances.

7. **Update templates periodically**: Review and update your templates to improve effectiveness.

8. **Localize templates**: Create templates in multiple languages for international customers.

## Related

- [Interactive Messages](./interactive.md) - For creating interactive elements
- [Text Messages](./text.md) - For sending text-based information
- [Image Messages](./image.md) - For sending images
