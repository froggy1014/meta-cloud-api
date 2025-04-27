---
sidebar_position: 1
---

# Tutorial: Sending Messages

This tutorial demonstrates how to send various types of messages using the `meta-cloud-api` wrapper.

## Prerequisites

- You have installed and configured the `meta-cloud-api` wrapper as shown in the [Getting Started](./../get-started.md) guide.
- You have a recipient phone number (including country code, without `+` or `00`) that has opted-in to receive messages from your business number.

```typescript
import WhatsApp from 'meta-cloud-api';

// Assuming configuration via constructor or .env file
const whatsapp = new WhatsApp({
  phoneNumberId: 'YOUR_PHONE_NUMBER_ID',
  accessToken: 'YOUR_ACCESS_TOKEN'
});

const recipientNumber: string = '15551234567'; // Replace with a valid recipient number
```

## Sending Text Messages

This is the simplest message type.

```typescript
import { TextMessageRequest } from 'meta-cloud-api/dist/types/messages'; // Adjust path based on your project structure

async function sendSimpleText() {
  try {
    const textPayload: TextMessageRequest = {
      body: "Hello from the tutorial! 👋 This is a simple text message."
    };
    
    console.log(`Sending text message to ${recipientNumber}...`);
    const response = await whatsapp.messages.text(textPayload, recipientNumber);
    
    // Response is direct JSON
    console.log('Text message sent successfully!');
    console.log('Message ID:', response.messages[0].id);
    console.log('Full Response:', response);

  } catch (error) {
    console.error('Error sending text message:', error);
  }
}

sendSimpleText();
```

## Sending Media Messages

You can send images, videos, audio, and documents using either a public URL or a previously uploaded Media ID.

### Image Message (using URL)

```typescript
import { ImageMessageRequest } from 'meta-cloud-api/dist/types/messages'; // Adjust path

async function sendImageByURL() {
  try {
    const imagePayload: ImageMessageRequest = {
      link: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png", // Replace with a valid public image URL
      caption: "Here is the Google logo!"
    };
    
    console.log(`Sending image message to ${recipientNumber}...`);
    const response = await whatsapp.messages.image(imagePayload, recipientNumber);
    
    console.log('Image message sent successfully!');
    console.log('Message ID:', response.messages[0].id);

  } catch (error) {
    console.error('Error sending image message:', error);
  }
}

sendImageByURL();
```

### Document Message (using Media ID)

First, you would typically upload the document using the [Media API](./../media-api.md) to get an ID.

```typescript
import { DocumentMessageRequest } from 'meta-cloud-api/dist/types/messages'; // Adjust path

async function sendDocumentByID(mediaId: string) {
  try {
    const documentPayload: DocumentMessageRequest = {
      id: mediaId, // ID obtained from media upload
      filename: "example-document.pdf",
      caption: "Please review the attached document."
    };
    
    console.log(`Sending document message to ${recipientNumber}...`);
    const response = await whatsapp.messages.document(documentPayload, recipientNumber);
    
    console.log('Document message sent successfully!');
    console.log('Message ID:', response.messages[0].id);

  } catch (error) {
    console.error('Error sending document message:', error);
  }
}

// Example usage (replace with a real media ID after uploading)
// const uploadedMediaId = 'YOUR_UPLOADED_MEDIA_ID'; 
// sendDocumentByID(uploadedMediaId);
```

## Sending Interactive Messages

Interactive messages allow users to respond easily using buttons or lists.

### Interactive List Message

```typescript
import { InteractiveListMessageRequest } from 'meta-cloud-api/dist/types/messages'; // Adjust path

async function sendInteractiveList() {
  try {
    const listPayload: InteractiveListMessageRequest = {
      header: {
        type: "text",
        text: "Choose an Option"
      },
      body: {
        text: "Please select one of the following options:"
      },
      footer: {
        text: "Powered by Meta Cloud API Wrapper"
      },
      action: {
        button: "View Options",
        sections: [
          {
            title: "Section 1",
            rows: [
              { id: "option_1", title: "Option One", description: "Description for option one" },
              { id: "option_2", title: "Option Two" }
            ]
          },
          {
            title: "Section 2",
            rows: [
              { id: "option_3", title: "Option Three" }
            ]
          }
        ]
      }
    };

    console.log(`Sending interactive list message to ${recipientNumber}...`);
    const response = await whatsapp.messages.interactiveList(listPayload, recipientNumber);

    console.log('Interactive list message sent successfully!');
    console.log('Message ID:', response.messages[0].id);

  } catch (error) {
    console.error('Error sending interactive list message:', error);
  }
}

sendInteractiveList();
```

### Interactive Button Message (Quick Replies)

```typescript
import { InteractiveButtonMessageRequest } from 'meta-cloud-api/dist/types/messages'; // Adjust path

async function sendInteractiveButtons() {
  try {
    const buttonsPayload: InteractiveButtonMessageRequest = {
      body: {
        text: "Would you like to subscribe to our newsletter?"
      },
      action: {
        buttons: [
          { type: "reply", reply: { id: "subscribe_yes", title: "Yes, please!" } },
          { type: "reply", reply: { id: "subscribe_no", title: "No, thanks" } }
        ]
      }
    };

    console.log(`Sending interactive button message to ${recipientNumber}...`);
    const response = await whatsapp.messages.interactiveButtons(buttonsPayload, recipientNumber);

    console.log('Interactive button message sent successfully!');
    console.log('Message ID:', response.messages[0].id);

  } catch (error) {
    console.error('Error sending interactive button message:', error);
  }
}

sendInteractiveButtons();
```

## Sending Template Messages

Template messages require prior approval from Meta. See the [Template API](./../template-api.md) reference for more details.

```typescript
import { TemplateMessageRequest } from 'meta-cloud-api/dist/types/messages'; // Adjust path

async function sendTemplate() {
  try {
    const templatePayload: TemplateMessageRequest = {
      name: "hello_world", // Use an approved template name
      language: {
        code: "en_US"
      }
      // Add components if your template has variables, headers, or buttons
      /*
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: "Customer Name" }
          ]
        }
      ]
      */
    };

    console.log(`Sending template message to ${recipientNumber}...`);
    const response = await whatsapp.messages.template(templatePayload, recipientNumber);

    console.log('Template message sent successfully!');
    console.log('Message ID:', response.messages[0].id);

  } catch (error) {
    console.error('Error sending template message:', error);
  }
}

sendTemplate();
```

This tutorial covers the basics of sending different message types. Explore the [API Reference](./../template-api.md) for more advanced options and other message types like location, contacts, and stickers.
