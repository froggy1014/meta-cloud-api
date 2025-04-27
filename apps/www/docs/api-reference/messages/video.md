---
sidebar_position: 5
---

# Video Messages

Video messages allow you to send video content to your recipients through WhatsApp. You can send videos using either a URL or a previously uploaded Media ID.

## Basic Usage

```typescript
import WhatsApp from 'meta-cloud-api';

// Initialize client
const whatsapp = new WhatsApp({
  phoneNumberId: YOUR_PHONE_NUMBER_ID,
  accessToken: 'YOUR_ACCESS_TOKEN'
});

// Send video message using a URL
const response = await whatsapp.messages.video(
  { 
    link: "https://example.com/video.mp4",
    caption: "Check out this video!"
  },
  15551234567
);

console.log(`Video message sent with ID: ${response.data.messages[0].id}`);
```

## Parameters

The `video()` method accepts the following parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| message | object | The video message object |
| recipient | string or number | The recipient's phone number with country code |
| replyMessageId | string (optional) | ID of a message to reply to |

### Message Object Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| link | string | URL of the video | Required if `id` is not provided |
| id | string | Media ID of a previously uploaded video | Required if `link` is not provided |
| caption | string | Text caption for the video | Optional |

## Examples

### Sending a Video with a URL

```typescript
const response = await whatsapp.messages.video(
  { 
    link: "https://example.com/product-demo.mp4",
    caption: "Product demonstration video"
  },
  15551234567
);
```

### Sending a Video with a Media ID

If you've previously uploaded a video and have its Media ID:

```typescript
const response = await whatsapp.messages.video(
  { 
    id: "1234567890",
    caption: "Video from our media library"
  },
  15551234567
);
```

### Sending a Video without Caption

```typescript
const response = await whatsapp.messages.video(
  { 
    link: "https://example.com/explainer.mp4"
  },
  15551234567
);
```

### Replying with a Video

```typescript
const originalMessageId = "wamid.abcd1234...";

const response = await whatsapp.messages.video(
  { 
    link: "https://example.com/response-video.mp4",
    caption: "Here's the video you requested"
  },
  15551234567,
  originalMessageId
);
```

## Uploading Videos

Before sending videos with a Media ID, you need to upload them:

```typescript
// Upload a video file
const uploadResponse = await whatsapp.media.upload({
  file: "/path/to/local/video.mp4",
  type: "video/mp4"
});

// Get the media ID from the response
const mediaId = uploadResponse.data.id;

// Now send the video using the media ID
const messageResponse = await whatsapp.messages.video(
  { 
    id: mediaId,
    caption: "Video uploaded and sent"
  },
  15551234567
);
```

## Supported Formats and Limits

- **Supported formats**: MP4, 3GPP
- **Maximum file size**: 16 MB
- **Codec requirements**: H.264 video codec and AAC audio codec
- **Audio streams**: Single audio stream or no audio stream only

### Video Types

| Video Type | Extension | MIME Type |
|------------|-----------|-----------|
| MP4 | .mp4 | video/mp4 |
| 3GPP | .3gp | video/3gpp |

## Error Handling

```typescript
try {
  const response = await whatsapp.messages.video(
    { 
      link: "https://example.com/video.mp4",
      caption: "Check out this video!"
    },
    15551234567
  );
  console.log("Video message sent successfully:", response.data);
} catch (error) {
  console.error("Error sending video message:", error);
  
  // Handle specific error cases
  if (error.response && error.response.data) {
    if (error.response.data.error.code === 131053) {
      console.log("Media URL is not accessible or supported");
    } else if (error.response.data.error.code === 131052) {
      console.log("Media file size too big. Max file size: 16MB");
    } else {
      console.log("Error details:", error.response.data);
    }
  }
}
```

## Best Practices

1. **Optimize video quality and size**: Keep videos under 16 MB and optimize them for mobile viewing.

2. **Choose appropriate resolution**: Videos on mobile devices don't need extremely high resolutions - optimize for the viewing experience.

3. **Use compatible codecs**: Ensure your videos use the H.264 video codec and AAC audio codec for best compatibility.

4. **Use descriptive captions**: Add context to your videos with clear captions.

5. **Consider bandwidth limitations**: Many users may have limited data plans, so avoid unnecessarily large files.

6. **Test playback on mobile devices**: Ensure your videos play well on a variety of mobile devices.

## Related

- [Media API](../media-api.md) - For uploading and managing media
- [Image Messages](./image.md) - For sending images
- [Audio Messages](./audio.md) - For sending audio files 