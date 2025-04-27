---
sidebar_position: 4
---


# Messaging Guide

This guide covers essential WhatsApp messaging concepts and common operations for managing messages effectively.

## Replying to Messages

When responding to a specific message from a user, you can use the reply functionality to create a threaded conversation. This helps maintain context and makes it clear which message you're responding to.

### Basic Reply Usage

```typescript
import WhatsApp from 'meta-cloud-api';

// Initialize client
const whatsapp = new WhatsApp({
  phoneNumberId: YOUR_PHONE_NUMBER_ID,
  accessToken: 'YOUR_ACCESS_TOKEN'
});

// Reply to a specific message
const response = await whatsapp.messages.text(
  "This is my reply to your question!",
  15551234567,
  "wamid.HBgLMTY1MDUwNzY1MjAVAgARGBI5QTNDQTVCM0Q0Q0Q2RTY3RTcA" // message ID to reply to
);

console.log(`Reply sent with ID: ${response.data.messages[0].id}`);
```

### Reply Methods

Nearly all message types support replies by providing a `replyMessageId` parameter:

```typescript
// Reply with a text message
await whatsapp.messages.text("Here's your answer", recipient, messageId);

// Reply with an image
await whatsapp.messages.image({ link: "https://example.com/image.jpg" }, recipient, messageId);

// Reply with a document
await whatsapp.messages.document(
  { link: "https://example.com/doc.pdf", caption: "The document you requested" },
  recipient,
  messageId
);

// Reply with a template
await whatsapp.messages.template("my_template", "en_US", components, recipient, messageId);
```

### Getting Message IDs

When you receive a message via a webhook, the message ID is included in the webhook payload:

```typescript
// Example webhook handler
app.post('/webhook', (req, res) => {
  const data = req.body;
  
  // Process messages
  if (data.entry && data.entry[0].changes && data.entry[0].changes[0].value.messages) {
    const messages = data.entry[0].changes[0].value.messages;
    
    messages.forEach(msg => {
      const messageId = msg.id; // This is the ID you can use to reply
      const from = msg.from; // The sender's phone number
      
      // Now you can reply to this message
      whatsapp.messages.text("Thanks for your message!", from, messageId);
    });
  }
  
  res.status(200).send('OK');
});
```

### Best Practices for Replies

1. **Maintain context**: Ensure your reply is relevant to the original message.
2. **Reply promptly**: Respond to messages in a timely manner for better user experience.
3. **Use for specific responses**: Only use replies when directly addressing a specific message.
4. **Add value**: Make sure your reply adds context or value to the conversation.

## Marking Messages as Read

To improve user experience, you can mark messages as read to indicate to customers that you've seen their messages. This is especially important for business applications where timely acknowledgment is expected.

### Basic Mark as Read Usage

```typescript
import WhatsApp from 'meta-cloud-api';

// Initialize client
const whatsapp = new WhatsApp({
  phoneNumberId: YOUR_PHONE_NUMBER_ID,
  accessToken: 'YOUR_ACCESS_TOKEN'
});

// Mark a message as read
const response = await whatsapp.messages.markAsRead(
  "wamid.HBgLMTY1MDUwNzY1MjAVAgARGBI5QTNDQTVCM0Q0Q0Q2RTY3RTcA" // message ID to mark as read
);

console.log("Message marked as read:", response.data);
```

### When to Mark Messages as Read

Consider marking messages as read in these scenarios:

1. **Upon receipt**: When your system has received and processed a user's message.
2. **When an agent views**: If using a CRM or agent dashboard, mark as read when an agent views the message.
3. **After automated processing**: If your system has processed and understood a user's message.

### Practical Implementation

Typically, you'd mark messages as read within your webhook handler:

```typescript
app.post('/webhook', async (req, res) => {
  const data = req.body;
  
  // Process messages
  if (data.entry && data.entry[0].changes && data.entry[0].changes[0].value.messages) {
    const messages = data.entry[0].changes[0].value.messages;
    
    for (const msg of messages) {
      const messageId = msg.id;
      
      try {
        // Mark the message as read
        await whatsapp.messages.markAsRead(messageId);
        
        // Process the message content
        // ...
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  }
  
  res.status(200).send('OK');
});
```

### Benefits of Marking Messages as Read

- Provides clear feedback to customers that their message has been received
- Improves customer experience by setting expectations for a response
- Reduces repeated messages from customers wondering if their message was delivered
- Mimics the experience of person-to-person WhatsApp conversations

## Error Handling

Proper error handling is essential when working with the WhatsApp API to ensure your application remains robust and can recover from common issues.

### Common Error Types

1. **Authentication errors**: Issues with your access token or permissions
2. **Rate limit errors**: Exceeding WhatsApp's messaging or API call limits
3. **Validation errors**: Incorrect message format or invalid parameters
4. **Recipient errors**: Issues with the recipient's phone number or WhatsApp status
5. **Media errors**: Problems with media files being too large or unsupported formats
6. **Template errors**: Issues with template formatting or approval status

### Basic Error Handling Pattern

```typescript
try {
  const response = await whatsapp.messages.text("Hello, world!", 15551234567);
  console.log("Message sent successfully:", response.data);
} catch (error) {
  console.error("Error sending message:", error);
  
  // Handle specific error cases
  if (error.response && error.response.data) {
    const errorCode = error.response.data.error?.code;
    const errorMessage = error.response.data.error?.message;
    
    console.log(`Error code: ${errorCode}, Message: ${errorMessage}`);
    
    // Handle specific error codes
    switch (errorCode) {
      case 130429: // Rate limit
        console.log("Rate limit reached. Implement backoff strategy.");
        // Implement exponential backoff or queuing
        break;
      case 131047: // Recipient issue
        console.log("Recipient is not a valid WhatsApp user.");
        // Mark the user as unavailable in your system
        break;
      case 131051: // Message not found
        console.log("Referenced message not found.");
        // Handle message reference error
        break;
      // Add more specific error handlers as needed
      default:
        console.log("Unhandled error code.");
    }
  } else {
    console.log("Network or client-side error:", error.message);
  }
}
```

### Common Error Codes

| Error Code | Description | Recommended Action |
|------------|-------------|-------------------|
| 130429 | Rate limit reached | Implement backoff strategy, queue messages |
| 131047 | Recipient not on WhatsApp | Update user status in your database |
| 131051 | Message not found | Check message ID validity |
| 131052 | Media file too large | Compress/resize media or use a different file |
| 131053 | Media URL not accessible | Check URL accessibility and permissions |
| 132000 | Template not found | Verify template name and approval status |
| 132001 | Template parameters mismatch | Check parameter count and format |
| 100 | Invalid parameter | Check request format and parameters |
| 190 | Invalid/expired access token | Refresh token or check authentication |

### Implementing Retry Logic

For transient errors like rate limits, implementing a retry mechanism with exponential backoff is recommended:

```typescript
async function sendMessageWithRetry(message, recipient, maxRetries = 3, initialDelay = 1000) {
  let retries = 0;
  let delay = initialDelay;
  
  while (retries < maxRetries) {
    try {
      const response = await whatsapp.messages.text(message, recipient);
      return response;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error?.code === 130429) {
        // Rate limit error, wait and retry
        retries++;
        console.log(`Rate limit hit, retry ${retries}/${maxRetries} after ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        // Exponential backoff
        delay *= 2;
      } else {
        // For other errors, don't retry
        throw error;
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} retries`);
}
```

### Error Monitoring and Logging

For production applications, implement comprehensive error monitoring:

1. **Structured logging**: Log errors with context (user ID, message type, timestamp)
2. **Error aggregation**: Use tools like Sentry, Rollbar, or CloudWatch to track error patterns
3. **Alerting**: Set up alerts for critical or frequent errors
4. **Dashboard**: Create a dashboard to monitor error rates and types

### Best Practices for Error Handling

1. **Graceful degradation**: If a feature fails, ensure the rest of your app continues working
2. **User feedback**: Communicate errors to users in a friendly, actionable way
3. **Fallback options**: Provide alternative communication methods if WhatsApp messaging fails
4. **Proactive monitoring**: Watch for error patterns to address issues before they affect many users
5. **Regular testing**: Test your error handling code with simulated failures

By implementing robust error handling, you'll create a more reliable application and a better experience for your users. 