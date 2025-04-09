---
sidebar_position: 1
---

# Messages API

The Messages API allows you to send various types of WhatsApp messages to your users, including text, media, interactive components, and more.

## Installation

```bash
npm install meta-cloud-api
```

## Basic Usage

First, initialize the WhatsApp client:

```typescript
import WhatsApp from 'meta-cloud-api';

// Initialize with configuration object
const whatsapp = new WhatsApp({
  phoneNumberId: YOUR_PHONE_NUMBER_ID, // e.g., 123456789
  accessToken: 'YOUR_ACCESS_TOKEN',
});
```

You can also use environment variables for configuration:

```typescript
// Create a .env file with the following variables:
// WA_PHONE_NUMBER_ID=123456789
// CLOUD_API_ACCESS_TOKEN=your_access_token
// WA_BUSINESS_ACCOUNT_ID=your_business_account_id
// CLOUD_API_VERSION=v22.0

// Then initialize without parameters - it will use env vars
const whatsapp = new WhatsApp();
```

## Sending Messages

### Text Messages

Send a simple text message:

```typescript
// Phone number must include country code (e.g., 15551234567)
const recipientNumber = 15551234567;

// Create a text message
const textResponse = await whatsapp.messages.text(
  { body: "Hello from Meta Cloud API!" },
  recipientNumber
);

console.log(`Message sent with ID: ${textResponse.data.messages[0].id}`);
```

### Media Messages

#### Sending an Image

You can send an image either by providing a hosted URL or a previously uploaded Media ID:

```typescript
// Using a hosted URL
const imageResponse = await whatsapp.messages.image(
  { 
    link: "https://example.com/image.jpg",
    caption: "Check out this image!"
  },
  recipientNumber
);

// Using a Media ID (if you've already uploaded the media)
const imageWithIdResponse = await whatsapp.messages.image(
  { 
    id: "media-id-from-previous-upload",
    caption: "Check out this image!"
  },
  recipientNumber
);
```

#### Sending a Document

```typescript
const documentResponse = await whatsapp.messages.document(
  {
    link: "https://example.com/document.pdf",
    caption: "Here's the document you requested",
    filename: "important_document.pdf"
  },
  recipientNumber
);
```

#### Sending a Video

```typescript
const videoResponse = await whatsapp.messages.video(
  {
    link: "https://example.com/video.mp4",
    caption: "Watch this video tutorial"
  },
  recipientNumber
);
```

### Interactive Messages

#### Button-based Interactive Message

```typescript
const buttonInteractiveResponse = await whatsapp.messages.interactive(
  {
    type: "button", // Can be "button", "list", "product", or "product_list"
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
  recipientNumber
);
```

#### List-based Interactive Message

```typescript
const listInteractiveResponse = await whatsapp.messages.interactive(
  {
    type: "list",
    body: {
      text: "Please select a product category"
    },
    action: {
      button: "View Categories",
      sections: [
        {
          title: "Categories",
          rows: [
            {
              id: "electronics",
              title: "Electronics",
              description: "Phones, laptops, and more"
            },
            {
              id: "clothing",
              title: "Clothing",
              description: "Shirts, pants, and accessories"
            }
          ]
        }
      ]
    }
  },
  recipientNumber
);
```

### Template Messages

Send a message using a pre-approved template:

```typescript
const templateResponse = await whatsapp.messages.template(
  {
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
            text: "John Doe"
          },
          {
            type: "text",
            text: "Tomorrow at 2:00 PM"
          }
        ]
      }
    ]
  },
  recipientNumber
);
```

### Location Messages

```typescript
const locationResponse = await whatsapp.messages.location(
  {
    latitude: 37.483872,
    longitude: -122.148358,
    name: "Meta Headquarters",
    address: "1 Hacker Way, Menlo Park, CA 94025"
  },
  recipientNumber
);
```

### Contact Messages

```typescript
const contactResponse = await whatsapp.messages.contacts(
  [
    {
      name: {
        formatted_name: "John Doe",
        first_name: "John",
        last_name: "Doe"
      },
      phones: [
        {
          phone: "15551234567",
          type: "CELL"
        }
      ],
      emails: [
        {
          email: "john.doe@example.com",
          type: "WORK"
        }
      ]
    }
  ],
  recipientNumber
);
```

## Replying to Messages

You can reply to a specific message by providing the original message ID:

```typescript
const originalMessageId = "wamid.abcd1234...";

const replyResponse = await whatsapp.messages.text(
  { body: "This is a reply to your previous message" },
  recipientNumber,
  originalMessageId
);
```

## Marking Messages as Read

```typescript
const readStatusResponse = await whatsapp.messages.status({
  status: "read",
  message_id: "wamid.abcd1234..."
});
```

## Error Handling

```typescript
try {
  const response = await whatsapp.messages.text(
    { body: "Hello from Meta Cloud API!" },
    recipientNumber
  );
  console.log("Message sent successfully:", response.data);
} catch (error) {
  console.error("Error sending message:", error);
}
```

## Additional Configuration

You can update various configurations of your WhatsApp client:

```typescript
// Update request timeout (in milliseconds)
whatsapp.updateTimeout(10000);

// Update phone number ID
whatsapp.updatePhoneNumberId(NEW_PHONE_NUMBER_ID);

// Update access token
whatsapp.updateAccessToken(NEW_ACCESS_TOKEN);

// Update WhatsApp Business Account ID
whatsapp.updateWabaId(NEW_WABA_ID);
``` 