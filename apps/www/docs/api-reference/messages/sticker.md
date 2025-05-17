---
sidebar_position: 7
---

# Sticker Messages

Sticker messages allow you to send static or animated stickers to your recipients through WhatsApp. Stickers are WebP images that can be static or animated and are a fun, visual way to engage with users.

## Basic Usage

```typescript
import WhatsApp from 'meta-cloud-api';

// Initialize client
const whatsapp = new WhatsApp({
  phoneNumberId: YOUR_PHONE_NUMBER_ID,
  accessToken: 'YOUR_ACCESS_TOKEN'
});

// Send sticker message using a URL
const response = await whatsapp.messages.sticker({
  body: { 
    link: "https://example.com/sticker.webp"
  },
  to: "15551234567"
});

console.log(`Sticker message sent with ID: ${response.messages[0].id}`);
```

## Parameters

The `sticker()` method accepts the following parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| params | MessageRequestParams`StickerMediaObject` | Object containing message parameters |

### MessageRequestParams`StickerMediaObject` Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| body | StickerMediaObject | The sticker message body | Required |
| to | string | The recipient's phone number with country code | Required |
| replyMessageId | string | ID of a message to reply to | Optional |

### StickerMediaObject Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| link | string | URL of the sticker file (WebP format) | Required if `id` is not provided |
| id | string | Media ID of a previously uploaded sticker | Required if `link` is not provided |

## Examples

### Sending a Static Sticker with a URL

```typescript
const response = await whatsapp.messages.sticker({
  body: { 
    link: "https://example.com/static-sticker.webp"
  },
  to: "15551234567"
});
```

### Sending an Animated Sticker with a URL

```typescript
const response = await whatsapp.messages.sticker({
  body: { 
    link: "https://example.com/animated-sticker.webp"
  },
  to: "15551234567"
});
```

### Sending a Sticker with a Media ID

If you've previously uploaded a sticker and have its Media ID:

```typescript
const response = await whatsapp.messages.sticker({
  body: { 
    id: "1234567890"
  },
  to: "15551234567"
});
```

### Replying with a Sticker

```typescript
const originalMessageId = "wamid.abcd1234...";

const response = await whatsapp.messages.sticker({
  body: { 
    link: "https://example.com/response-sticker.webp"
  },
  to: "15551234567",
  replyMessageId: originalMessageId
});
```

## Uploading Stickers

Before sending stickers with a Media ID, you need to upload them:

```typescript
// Upload a static sticker file
const uploadResponse = await whatsapp.media.upload({
  file: "/path/to/local/sticker.webp",
  type: "image/webp"
});

// Get the media ID from the response
const mediaId = uploadResponse.id;

// Now send the sticker using the media ID
const messageResponse = await whatsapp.messages.sticker({
  body: { 
    id: mediaId
  },
  to: "15551234567"
});
```

## Sticker Requirements

WhatsApp has specific requirements for stickers:

### Static Stickers
- **Format**: WebP
- **Maximum file size**: 100 KB
- **Dimensions**: 512x512 pixels recommended

### Animated Stickers
- **Format**: WebP (animated)
- **Maximum file size**: 500 KB
- **Dimensions**: 512x512 pixels recommended
- **Animation duration**: 3 seconds or less

## Creating Stickers

You can create WebP stickers using various tools:

1. **Converting from PNG/JPG**: You can use tools like cwebp (from the libwebp package) to convert static images:
   ```bash
   cwebp -q 80 input.png -o output.webp
   ```

2. **Creating animated WebP files**: Use tools like gif2webp to convert animated GIFs:
   ```bash
   gif2webp -lossy input.gif -o output.webp
   ```

3. **Online converters**: Various online services can convert images to WebP format suitable for WhatsApp stickers.

## Error Handling

```typescript
try {
  const response = await whatsapp.messages.sticker({
    body: { 
      link: "https://example.com/sticker.webp"
    },
    to: "15551234567"
  });
  console.log("Sticker message sent successfully:", response);
} catch (error) {
  console.error("Error sending sticker message:", error);
  
  // Handle specific error cases
  if (error.response && error.response.data) {
    if (error.response.data.error.code === 131053) {
      console.log("Media URL is not accessible or supported");
    } else if (error.response.data.error.code === 131052) {
      console.log("Media file size too big. Check size limits for stickers");
    } else {
      console.log("Error details:", error.response.data);
    }
  }
}
```

## Best Practices

1. **Optimize sticker size**: Keep static stickers under 100 KB and animated stickers under 500 KB.

2. **Use transparent backgrounds**: Stickers with transparent backgrounds look better and more professional.

3. **Keep designs simple**: Stickers with simple, bold designs are more effective than complex imagery.

4. **Create themed sticker packs**: If sending multiple stickers, consider creating thematically related sets.

5. **Use animation effectively**: For animated stickers, keep the animation smooth, simple, and meaningful.

6. **Test on mobile devices**: Ensure your stickers display well on a variety of mobile screens.

## Related

- [Media API](../media-api.md) - For uploading and managing media
- [Image Messages](./image.md) - For sending regular images
- [Interactive Messages](./interactive.md) - For creating interactive elements 