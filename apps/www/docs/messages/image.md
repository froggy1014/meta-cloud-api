---
sidebar_position: 3
---

# Image Messages

Image messages allow you to send images to your recipients through WhatsApp. You can send images using either a URL or a previously uploaded Media ID.

## Basic Usage

```typescript
import WhatsApp from 'meta-cloud-api';

// Initialize client
const whatsapp = new WhatsApp({
  phoneNumberId: YOUR_PHONE_NUMBER_ID,
  accessToken: 'YOUR_ACCESS_TOKEN'
});

// Send image message using a URL
const response = await whatsapp.messages.image(
  { 
    link: "https://example.com/image.jpg",
    caption: "Check out this image!"
  },
  15551234567
);

console.log(`Image message sent with ID: ${response.data.messages[0].id}`);
```

## Parameters

The `image()` method accepts the following parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| message | object | The image message object |
| recipient | string or number | The recipient's phone number with country code |
| replyMessageId | string (optional) | ID of a message to reply to |

### Message Object Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| link | string | URL of the image | Required if `id` is not provided |
| id | string | Media ID of a previously uploaded image | Required if `link` is not provided |
| caption | string | Text caption for the image | Optional |

## Examples

### Sending an Image with a URL

```typescript
const response = await whatsapp.messages.image(
  { 
    link: "https://example.com/product.jpg",
    caption: "Our new product"
  },
  15551234567
);
```

### Sending an Image with a Media ID

If you've previously uploaded an image and have its Media ID:

```typescript
const response = await whatsapp.messages.image(
  { 
    id: "1234567890",
    caption: "Image from our media library"
  },
  15551234567
);
```

### Sending an Image without Caption

```typescript
const response = await whatsapp.messages.image(
  { 
    link: "https://example.com/infographic.jpg"
  },
  15551234567
);
```

### Replying with an Image

```typescript
const originalMessageId = "wamid.abcd1234...";

const response = await whatsapp.messages.image(
  { 
    link: "https://example.com/response-image.jpg",
    caption: "Here's the image you requested"
  },
  15551234567,
  originalMessageId
);
```

## Uploading Images

Before sending images with a Media ID, you need to upload them:

```typescript
// Upload an image file
const uploadResponse = await whatsapp.media.upload({
  file: "/path/to/local/image.jpg",
  type: "image/jpeg"
});

// Get the media ID from the response
const mediaId = uploadResponse.data.id;

// Now send the image using the media ID
const messageResponse = await whatsapp.messages.image(
  { 
    id: mediaId,
    caption: "Image uploaded and sent"
  },
  15551234567
);
```

## Supported Formats and Limits

- **Supported formats**: JPEG, PNG
- **Maximum file size**: 5 MB
- **Image requirements**: 8-bit, RGB or RGBA

## Error Handling

```typescript
try {
  const response = await whatsapp.messages.image(
    { 
      link: "https://example.com/image.jpg",
      caption: "Check out this image!"
    },
    15551234567
  );
  console.log("Image message sent successfully:", response.data);
} catch (error) {
  console.error("Error sending image message:", error);
  
  // Handle specific error cases
  if (error.response && error.response.data) {
    if (error.response.data.error.code === 131053) {
      console.log("Media URL is not accessible or supported");
    } else {
      console.log("Error details:", error.response.data);
    }
  }
}
```

## Best Practices

1. **Optimize image size**: Keep images under 5 MB and optimize them for mobile viewing.

2. **Use descriptive captions**: Add context to your images with clear captions.

3. **Host images reliably**: Ensure your image URLs are from reliable, high-uptime hosts.

4. **Consider bandwidth**: Be mindful of users who may have limited data plans.

5. **Accessibility**: When possible, include descriptive captions that explain the image content for visually impaired users.

## Related

- [Media API](../media-api.md) - For uploading and managing media
- [Document Messages](./document.md) - For sending documents
- [Video Messages](./video.md) - For sending videos 