---
sidebar_position: 6
---

# Document Messages

Document messages allow you to send files such as PDFs, spreadsheets, text documents, and other document types to your recipients through WhatsApp. You can send documents using either a URL or a previously uploaded Media ID.

## Basic Usage

```typescript
import WhatsApp from 'meta-cloud-api';

// Initialize client
const whatsapp = new WhatsApp({
  phoneNumberId: YOUR_PHONE_NUMBER_ID,
  accessToken: 'YOUR_ACCESS_TOKEN'
});

// Send document message using a URL
const response = await whatsapp.messages.document({
  body: { 
    link: "https://example.com/report.pdf",
    caption: "Monthly sales report",
    filename: "Sales_Report_July_2023.pdf"
  },
  to: "15551234567"
});

console.log(`Document message sent with ID: ${response.messages[0].id}`);
```

## Parameters

The `document()` method accepts the following parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| params | MessageRequestParams`DocumentMediaObject` | Object containing message parameters |

### MessageRequestParams`DocumentMediaObject` Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| body | DocumentMediaObject | The document message body | Required |
| to | string | The recipient's phone number with country code | Required |
| replyMessageId | string | ID of a message to reply to | Optional |

### DocumentMediaObject Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| link | string | URL of the document | Required if `id` is not provided |
| id | string | Media ID of a previously uploaded document | Required if `link` is not provided |
| caption | string | Text caption for the document | Optional |
| filename | string | Name of the file that will be shown to the recipient | Optional with link, but recommended |

## Examples

### Sending a Document with a URL

```typescript
const response = await whatsapp.messages.document({
  body: { 
    link: "https://example.com/contract.pdf",
    caption: "Please review and sign this contract",
    filename: "Contract_2023.pdf"
  },
  to: "15551234567"
});
```

### Sending a Document with a Media ID

If you've previously uploaded a document and have its Media ID:

```typescript
const response = await whatsapp.messages.document({
  body: { 
    id: "1234567890",
    caption: "Document from our files",
    filename: "Important_Document.pdf"
  },
  to: "15551234567"
});
```

### Sending Different Document Types

```typescript
// Sending a Word document
const wordResponse = await whatsapp.messages.document({
  body: { 
    link: "https://example.com/proposal.docx",
    caption: "Project proposal",
    filename: "Project_Proposal.docx"
  },
  to: "15551234567"
});

// Sending an Excel spreadsheet
const excelResponse = await whatsapp.messages.document({
  body: { 
    link: "https://example.com/budget.xlsx",
    caption: "Budget forecast",
    filename: "Budget_2023.xlsx"
  },
  to: "15551234567"
});

// Sending a plain text file
const textResponse = await whatsapp.messages.document({
  body: { 
    link: "https://example.com/instructions.txt",
    caption: "Installation instructions",
    filename: "Instructions.txt"
  },
  to: "15551234567"
});
```

### Replying with a Document

```typescript
const originalMessageId = "wamid.abcd1234...";

const response = await whatsapp.messages.document({
  body: { 
    link: "https://example.com/requested-file.pdf",
    caption: "Here's the document you requested",
    filename: "Requested_Document.pdf"
  },
  to: "15551234567",
  replyMessageId: originalMessageId
});
```

## Uploading Documents

Before sending documents with a Media ID, you need to upload them:

```typescript
// Upload a document file
const uploadResponse = await whatsapp.media.upload({
  file: "/path/to/local/document.pdf",
  type: "application/pdf"
});

// Get the media ID from the response
const mediaId = uploadResponse.id;

// Now send the document using the media ID
const messageResponse = await whatsapp.messages.document({
  body: { 
    id: mediaId,
    caption: "Document uploaded and sent",
    filename: "Document.pdf"
  },
  to: "15551234567"
});
```

## Supported Formats and Limits

- **Maximum file size**: 100 MB
- **Supported document types**: PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT, and more

### Document Types

| Document Type | Extension | MIME Type |
|---------------|-----------|-----------|
| PDF | .pdf | application/pdf |
| Microsoft Word | .doc | application/msword |
| Microsoft Word | .docx | application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| Microsoft Excel | .xls | application/vnd.ms-excel |
| Microsoft Excel | .xlsx | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet |
| Microsoft PowerPoint | .ppt | application/vnd.ms-powerpoint |
| Microsoft PowerPoint | .pptx | application/vnd.openxmlformats-officedocument.presentationml.presentation |
| Text | .txt | text/plain |

## Error Handling

```typescript
try {
  const response = await whatsapp.messages.document({
    body: { 
      link: "https://example.com/report.pdf",
      caption: "Monthly report",
      filename: "Report.pdf"
    },
    to: "15551234567"
  });
  console.log("Document message sent successfully:", response);
} catch (error) {
  console.error("Error sending document message:", error);
  
  // Handle specific error cases
  if (error.response && error.response.data) {
    if (error.response.data.error.code === 131053) {
      console.log("Media URL is not accessible or supported");
    } else if (error.response.data.error.code === 131052) {
      console.log("Media file size too big. Max file size: 100MB");
    } else {
      console.log("Error details:", error.response.data);
    }
  }
}
```

## Best Practices

1. **Always provide a filename**: Even though it's optional with link, it helps recipients identify the document.

2. **Use descriptive captions**: Add context to your documents with clear captions that explain what the document contains.

3. **Be mindful of file size**: While WhatsApp supports documents up to 100 MB, consider that large files may take time to download for users with slower connections.

4. **Use appropriate file formats**: Send documents in formats that are widely supported and appropriate for the content.

5. **Consider data protection**: Be cautious about sending sensitive information through document messages.

6. **Preview before sending**: Make sure your document displays correctly when opened on mobile devices.

## Related

- [Media API](../media-api.md) - For uploading and managing media
- [Image Messages](./image.md) - For sending images
- [Video Messages](./video.md) - For sending videos 