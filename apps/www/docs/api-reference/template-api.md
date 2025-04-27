---
sidebar_position: 2
---

# Template API

WhatsApp message templates are specific message formats that businesses use to send out notifications or customer care messages to people that have opted in to notifications. Messages can include appointment reminders, shipping information, issue resolution or payment updates.

## Prerequisites

Before sending template messages, you need to create and get approval for your templates in the WhatsApp Business Platform. See the [official documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates/) for more details on creating templates.

## Basic Usage

First, initialize the WhatsApp client:

```typescript
import WhatsApp from 'meta-cloud-api';

// Initialize with configuration object
const whatsapp = new WhatsApp({
  phoneNumberId: YOUR_PHONE_NUMBER_ID,
  accessToken: 'YOUR_ACCESS_TOKEN'
});
```

## Template Types

The WhatsApp Business Platform supports the following template types:

- Text-based message templates
- Media-based message templates
- Interactive message templates
- Location-based message templates
- Authentication templates with one-time password buttons
- Multi-Product Message templates

## Sending Templates

### Text-Based Templates

```typescript
const recipientNumber = 15551234567;

// Send a simple text-based template
const response = await whatsapp.messages.template(
  {
    name: "sample_purchase_feedback", // Your approved template name
    language: {
      code: "en_US"
    },
    components: [
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: "John Doe"
          },
          {
            type: "text",
            text: "12345678"
          }
        ]
      }
    ]
  },
  recipientNumber
);

console.log(`Template message sent with ID: ${response.messages[0].id}`);
```

### Media-Based Templates

```typescript
// Send a template with an image header
const mediaResponse = await whatsapp.messages.template(
  {
    name: "sample_shipping_confirmation",
    language: {
      code: "en_US"
    },
    components: [
      {
        type: "header",
        parameters: [
          {
            type: "image",
            image: {
              link: "https://example.com/shipping-confirmation.jpg"
              // Alternatively, use 'id' if you've already uploaded the media
              // id: "media-id-from-previous-upload"
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
            text: "XYZ12345"
          }
        ]
      }
    ]
  },
  recipientNumber
);
```

### Interactive Templates

You can send templates with interactive buttons, including call-to-action buttons (for calling a phone number or visiting a website) and quick reply buttons.

#### Template with Quick Reply Buttons

```typescript
const interactiveResponse = await whatsapp.messages.template(
  {
    name: "sample_issue_resolution",
    language: {
      code: "en_US"
    },
    components: [
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: "Your order #12345"
          }
        ]
      },
      {
        type: "button",
        sub_type: "quick_reply",
        index: "0",
        parameters: [
          {
            type: "payload",
            payload: "ISSUE_RESOLVED"
          }
        ]
      },
      {
        type: "button",
        sub_type: "quick_reply",
        index: "1",
        parameters: [
          {
            type: "payload",
            payload: "STILL_HAVING_ISSUE"
          }
        ]
      }
    ]
  },
  recipientNumber
);
```

#### Template with Call-to-Action Buttons

```typescript
const ctaResponse = await whatsapp.messages.template(
  {
    name: "sample_appointment_confirmation",
    language: {
      code: "en_US"
    },
    components: [
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: "Your appointment is confirmed for July 21 at 3:00 PM"
          }
        ]
      },
      {
        type: "button",
        sub_type: "url",
        index: "0",
        parameters: [
          {
            type: "text",
            text: "View Details"
          }
        ]
      },
      {
        type: "button",
        sub_type: "phone_number",
        index: "1",
        parameters: [
          {
            type: "text",
            text: "+1 (555) 123-4567"
          }
        ]
      }
    ]
  },
  recipientNumber
);
```

### Location-Based Templates

```typescript
const locationResponse = await whatsapp.messages.template(
  {
    name: "sample_store_location",
    language: {
      code: "en_US"
    },
    components: [
      {
        type: "header",
        parameters: [
          {
            type: "location",
            location: {
              latitude: "37.483307",
              longitude: "-122.148981",
              name: "Meta Headquarters",
              address: "1 Hacker Way, Menlo Park, CA 94025"
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
          }
        ]
      }
    ]
  },
  recipientNumber
);
```

### Currency and DateTime Parameters

Templates can include formatted currency and date/time parameters:

```typescript
const orderResponse = await whatsapp.messages.template(
  {
    name: "sample_order_update",
    language: {
      code: "en_US"
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
            type: "currency",
            currency: {
              fallback_value: "$100.50",
              code: "USD",
              amount_1000: 100500 // Amount in thousandths (100.50 USD)
            }
          },
          {
            type: "date_time",
            date_time: {
              fallback_value: "January 1, 2023",
              day_of_week: 1,
              year: 2023,
              month: 1,
              day_of_month: 1,
              hour: 12,
              minute: 30
            }
          }
        ]
      }
    ]
  },
  recipientNumber
);
```

## Template Component Types

Templates consist of different components:

1. **Header** - Can contain text, image, document, video, or location
2. **Body** - The main text content with parameters
3. **Footer** - Static text at the bottom
4. **Buttons** - Quick reply or call-to-action buttons

## Important Considerations

### Template Pacing

Newly created or unpaused marketing templates are subject to template pacing. This means there are limits to how quickly you can ramp up sending volumes for new marketing templates.

### Per-User Marketing Template Message Limits

WhatsApp may limit the number of marketing template messages a person receives from any business in a given period of time. This is determined based on various factors, including a user's recent marketing message read rate and inbox activity.

Starting April 1, 2025, WhatsApp will temporarily pause delivery of all marketing template messages to WhatsApp users who have a United States phone number.

If a marketing template message is not sent due to per-user marketing template limit enforcement, you'll receive an error code `131049` (for Cloud API).

### Authentication Templates

For authentication purposes, WhatsApp recommends using authentication templates with one-time password buttons. Attempting to send legacy authentication templates may result in errors if variable values exceed 15 characters or contain links or emojis.

### Message Delivery Sequence

When sending multiple messages, the order of delivery is not guaranteed to match the order of your API requests. To ensure proper sequence, wait for a `delivered` status in messages webhook before sending the next message.

## User Preferences for Marketing Messages

Starting November 22, 2024, users will have the ability to stop or resume delivery of marketing template messages from your business, or to indicate their interest level in these types of messages.

## Error Handling

```typescript
try {
  const response = await whatsapp.messages.template(
    {
      name: "sample_template",
      language: {
        code: "en_US"
      },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: "John Doe"
            }
          ]
        }
      ]
    },
    recipientNumber
  );
  console.log("Template message sent successfully:", response);
} catch (error) {
  console.error("Error sending template message:", error);
  
  // Handle specific error codes
  if (error.code === 131049) {
    console.log("Message not sent due to per-user marketing template limit");
  } else if (error.code === 131050) {
    console.log("User has opted out of marketing messages");
  }
}
```

## Additional Resources

For more detailed information about WhatsApp templates, please refer to the [official WhatsApp Cloud API documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates/). 