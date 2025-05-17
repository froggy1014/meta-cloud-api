---
sidebar_position: 4
---

# Audio Messages

Audio messages allow you to send voice notes, music, and other audio content to your recipients through WhatsApp. You can send audio files using either a URL or a previously uploaded Media ID.

## Basic Usage

```typescript
import WhatsApp from 'meta-cloud-api';

// Initialize client
const whatsapp = new WhatsApp({
  phoneNumberId: YOUR_PHONE_NUMBER_ID,
  accessToken: 'YOUR_ACCESS_TOKEN'
});

// Send audio message using a URL
const response = await whatsapp.messages.audio({
  body: { 
    link: "https://example.com/audio-file.mp3" 
  },
  to: "15551234567"
});

console.log(`Audio message sent with ID: ${response.messages[0].id}`);
```

## Parameters

The `audio()` method accepts the following parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| params | MessageRequestParams`AudioMediaObject` | Object containing message parameters |

### MessageRequestParams`AudioMediaObject` Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| body | AudioMediaObject | The audio message body | Required |
| to | string | The recipient's phone number with country code | Required |
| replyMessageId | string | ID of a message to reply to | Optional |

### AudioMediaObject Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| link | string | URL of the audio file | Required if `id` is not provided |
| id | string | Media ID of a previously uploaded audio file | Required if `link` is not provided |

## Examples

### Sending an Audio File with a URL

```typescript
const response = await whatsapp.messages.audio({
  body: { 
    link: "https://example.com/voice-message.mp3" 
  },
  to: "15551234567"
});
```

### Sending an Audio File with a Media ID

If you've previously uploaded an audio file and have its Media ID:

```typescript
const response = await whatsapp.messages.audio({
  body: { 
    id: "1234567890" 
  },
  to: "15551234567"
});
```

### Replying with an Audio Message

```typescript
const originalMessageId = "wamid.abcd1234...";

const response = await whatsapp.messages.audio({
  body: { 
    link: "https://example.com/response-audio.mp3" 
  },
  to: "15551234567",
  replyMessageId: originalMessageId
});
```

## Uploading Audio Files

Before sending audio files with a Media ID, you need to upload them:

```typescript
// Upload an audio file
const uploadResponse = await whatsapp.media.upload({
  file: "/path/to/local/audio.mp3",
  type: "audio/mpeg"
});

// Get the media ID from the response
const mediaId = uploadResponse.id;

// Now send the audio using the media ID
const messageResponse = await whatsapp.messages.audio({
  body: { 
    id: mediaId 
  },
  to: "15551234567"
});
```

## Supported Formats and Limits

- **Supported formats**: AAC, MP3, M4A, AMR, OGG (with OPUS codecs only)
- **Maximum file size**: 16 MB

### Audio Types

| Audio Type | Extension | MIME Type |
|------------|-----------|-----------|
| AAC | .aac | audio/aac |
| MP3 | .mp3 | audio/mpeg |
| MP4 Audio | .m4a | audio/mp4 |
| AMR | .amr | audio/amr |
| OGG | .ogg | audio/ogg (OPUS codecs only) |

## Error Handling

```typescript
try {
  const response = await whatsapp.messages.audio({
    body: { 
      link: "https://example.com/audio-file.mp3" 
    },
    to: "15551234567"
  });
  console.log("Audio message sent successfully:", response);
} catch (error) {
  console.error("Error sending audio message:", error);
  
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

1. **Optimize audio quality and size**: Keep audio files under 16 MB and optimize them for mobile playback.

2. **Consider file format compatibility**: Use widely supported formats like MP3 for best compatibility.

3. **Be mindful of audio length**: Keep audio messages concise when possible - shorter messages tend to have better engagement.

4. **Consider bandwidth limitations**: Many users may have limited data plans, so avoid unnecessarily large files.

5. **Test playback on mobile devices**: Ensure your audio files play well on a variety of mobile devices.

## Related

- [Media API](../media-api.md) - For uploading and managing media
- [Video Messages](./video.md) - For sending videos
- [Sticker Messages](./sticker.md) - For sending stickers
