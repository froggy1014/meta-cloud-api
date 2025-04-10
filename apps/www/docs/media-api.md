---
sidebar_position: 8
---

# Media API

The Media API allows you to upload, retrieve, download, and delete media files for use with WhatsApp messaging. This API enables you to work with various media types including images, audio, documents, videos, and stickers.

## Prerequisites

Before using the Media API, you need:
- A WhatsApp Business Account (WABA)
- A verified business phone number
- Access token with the appropriate permissions (`whatsapp_business_messaging` for developers or `whatsapp_business_management` for Solution Partners)

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

## Media ID

To complete many Media API operations, you need a media ID. There are two ways to get this ID:

1. **From API Calls**: When you successfully upload media files, the media ID is included in the response.
2. **From Webhooks**: When your business account receives a media message, WhatsApp automatically downloads the media and uploads it to the Cloud API, triggering webhooks that include the media ID.

## Upload Media

To upload media to WhatsApp Cloud API:

```typescript
// Upload an image file from your local system
const uploadResponse = await whatsapp.media.upload({
  file: "/path/to/your/image.jpg",  // Local file path
  type: "image/jpeg"                // MIME type of the media
});

console.log("Media uploaded successfully. Media ID:", uploadResponse.data.id);
```

All media files sent through this endpoint are encrypted and persist for 30 days, unless deleted earlier.

### Supported Parameters

| Parameter | Description |
|-----------|-------------|
| file | **Required.** Path to the file stored in your local system. |
| type | **Required.** MIME type of the media file being uploaded. See Supported Media Types section. |

## Retrieve Media URL

To get the URL for a specific media file:

```typescript
// Retrieve a URL for a specific media ID
const mediaResponse = await whatsapp.media.getUrl("MEDIA_ID");

console.log("Media URL:", mediaResponse.data.url);
// The URL is only valid for 5 minutes
```

## Download Media

After retrieving the media URL, you can download the file:

```typescript
// Download a media file
const mediaContent = await whatsapp.media.download(mediaResponse.data.url);

// Use the binary data as needed (e.g., save to file)
// Note: In actual implementation, you would handle the binary data appropriately
```

## Delete Media

To delete a media file:

```typescript
// Delete a specific media file
const deleteResponse = await whatsapp.media.delete("MEDIA_ID");

console.log("Media deleted successfully:", deleteResponse.data.success);
```

## Supported Media Types

### Audio Files (Max 16 MB)

| Audio Type | Extension | MIME Type |
|------------|-----------|-----------|
| AAC | .aac | audio/aac |
| AMR | .amr | audio/amr |
| MP3 | .mp3 | audio/mpeg |
| MP4 Audio | .m4a | audio/mp4 |
| OGG Audio | .ogg | audio/ogg (OPUS codecs only) |

### Document Files (Max 100 MB)

| Document Type | Extension | MIME Type |
|---------------|-----------|-----------|
| Text | .txt | text/plain |
| Microsoft Excel | .xls | application/vnd.ms-excel |
| Microsoft Excel | .xlsx | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet |
| Microsoft Word | .doc | application/msword |
| Microsoft Word | .docx | application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| Microsoft PowerPoint | .ppt | application/vnd.ms-powerpoint |
| Microsoft PowerPoint | .pptx | application/vnd.openxmlformats-officedocument.presentationml.presentation |
| PDF | .pdf | application/pdf |

### Image Files (Max 5 MB)

Images must be 8-bit, RGB or RGBA.

| Image Type | Extension | MIME Type |
|------------|-----------|-----------|
| JPEG | .jpeg | image/jpeg |
| PNG | .png | image/png |

### Sticker Files

| Sticker Type | Extension | MIME Type | Max Size |
|--------------|-----------|-----------|----------|
| Animated sticker | .webp | image/webp | 500 KB |
| Static sticker | .webp | image/webp | 100 KB |

### Video Files (Max 16 MB)

Only H.264 video codec and AAC audio codec supported. Single audio stream or no audio stream only.

| Video Type | Extension | MIME Type |
|------------|-----------|-----------|
| 3GPP | .3gp | video/3gpp |
| MP4 Video | .mp4 | video/mp4 |

## Error Handling

```typescript
try {
  const uploadResponse = await whatsapp.media.upload({
    file: "/path/to/your/image.jpg",
    type: "image/jpeg"
  });
  
  console.log("Media uploaded successfully. Media ID:", uploadResponse.data.id);
} catch (error) {
  console.error("Error uploading media:", error);
  
  // Handle specific error scenarios
  switch (error.code) {
    case 100:
      console.log("Parameter missing or invalid");
      break;
    case 131052:
      console.log("Media file size too big. Max file size supported: 100MB");
      break;
    default:
      console.log("Unknown error occurred");
  }
}
```

## Media Download Constraints

The maximum supported file size for media messages on Cloud API is 100MB. If a customer sends a file larger than 100MB, you will receive a webhook with error code 131052 and title:

_"Media file size too big. Max file size we currently support: 100MB. Please communicate with your customer to send a media file that is smaller than 100MB"_

We recommend sending customers a warning message when their media file exceeds the maximum file size.

## Complete Media Upload and Send Workflow

Here's an example of a workflow for uploading and sending a media file:

```typescript
const uploadAndSendMedia = async () => {
  try {
    // Step 1: Upload media file
    console.log("Uploading media file...");
    const uploadResponse = await whatsapp.media.upload({
      file: "/path/to/your/image.jpg",
      type: "image/jpeg"
    });
    
    if (uploadResponse.data.id) {
      // Step 2: Send media message using the media ID
      console.log("Media uploaded. Sending media message...");
      const mediaId = uploadResponse.data.id;
      
      const messageResponse = await whatsapp.messages.image(
        {
          id: mediaId,
          caption: "Check out this image!"
        },
        RECIPIENT_PHONE_NUMBER
      );
      
      console.log("Media message sent successfully:", messageResponse.data);
    }
  } catch (error) {
    console.error("Media upload and send process failed:", error);
  }
};

uploadAndSendMedia();
```

## Additional Resources

For more detailed information about working with media on the WhatsApp Cloud API, please refer to the [official WhatsApp Cloud API documentation on Media](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media/). 