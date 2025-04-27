---
sidebar_position: 2
---

# Tutorial: Handling Incoming Webhooks

WhatsApp Cloud API uses webhooks to notify your application about events in real-time, such as incoming messages, message status updates, and account changes. This tutorial shows a basic setup for receiving and processing these webhooks using the `meta-cloud-api` wrapper, assuming integration with a web framework like Express.js (Node.js).

## Prerequisites

- You have installed and configured the `meta-cloud-api` wrapper.
- You have a web server (e.g., using Express.js) set up and publicly accessible via HTTPS.
- You have configured your Webhook URL and Verify Token in the Meta App Dashboard (WhatsApp > Configuration).

## Webhook Verification Request

When you configure your webhook URL in the Meta App Dashboard, Meta will send a `GET` request to verify the endpoint. Your server needs to handle this.

```typescript
// Example using Express.js
import express, { Request, Response } from 'express';
import WhatsApp from 'meta-cloud-api';

const app = express();
const port = process.env.PORT || 3000;

// Initialize WhatsApp wrapper (assuming env vars are set)
const whatsapp = new WhatsApp(); 

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || "YOUR_VERY_SECRET_VERIFY_TOKEN"; // Use the same token set in the App Dashboard

// Middleware to parse JSON request bodies
app.use(express.json());

// Endpoint for Webhook Verification
app.get('/webhook', (req: Request, res: Response) => {
  console.log('Received webhook verification request:', req.query);

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Check if mode and token are in the query string of the request
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      console.log('Webhook verified successfully!');
      res.status(200).send(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      console.error('Webhook verification failed: Invalid verify token.');
      res.sendStatus(403);
    }
  } else {
    // Respond with '400 Bad Request' if mode or token is missing
    console.error('Webhook verification failed: Missing mode or token.');
    res.sendStatus(400);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
```

## Handling Incoming Notifications

Once verified, Meta will send `POST` requests with event notifications to your webhook URL. You need to parse the payload and handle different event types.

```typescript
// Example using Express.js (Continuing from above)

// Endpoint for Receiving Webhook Notifications
app.post('/webhook', (req: Request, res: Response) => {
  console.log('Received webhook notification:');
  // Log the raw body for debugging
  // console.log(JSON.stringify(req.body, null, 2)); 

  const body = req.body;

  // Check if this is an event from a page subscription (should be 'whatsapp_business_account')
  if (body.object === 'whatsapp_business_account') {
    // Iterate over each entry - there may be multiple if batched
    body.entry?.forEach((entry: any) => {
      // Iterate over each change
      entry.changes?.forEach((change: any) => {
        console.log('Change detected:', JSON.stringify(change.field));

        // Check the type of change
        if (change.field === 'messages') {
          const value = change.value;

          // Handle Message Status Updates
          if (value.statuses) {
            value.statuses.forEach((status: any) => {
              console.log(`Message ${status.id} status updated to: ${status.status}`);
              // Add logic here: update database, notify user, etc.
              if (status.errors) {
                 console.error('Message failed:', status.errors);
              }
            });
          }
          
          // Handle Incoming Messages
          else if (value.messages) {
            value.messages.forEach((message: any) => {
              console.log(`Incoming message from ${message.from}:`);
              console.log(JSON.stringify(message, null, 2));

              const senderWaId = message.from; // WhatsApp ID of the sender
              const messageType = message.type;

              // Example: Auto-reply to text messages
              if (messageType === 'text') {
                const incomingText = message.text.body;
                console.log(`Received text: "${incomingText}"`);
                
                // Simple echo reply
                whatsapp.messages.text({ body: `You said: "${incomingText}"` }, senderWaId)
                  .then(replyResponse => {
                    console.log(`Replied with message ID: ${replyResponse.messages[0].id}`);
                  })
                  .catch(err => {
                    console.error('Error sending reply:', err);
                  });
              }
              
              // Add logic for other message types (image, audio, interactive replies, etc.)
              else if (messageType === 'interactive') {
                 if (message.interactive.type === 'button_reply') {
                    console.log(`Received button reply ID: ${message.interactive.button_reply.id}`);
                 } else if (message.interactive.type === 'list_reply') {
                    console.log(`Received list reply ID: ${message.interactive.list_reply.id}`);
                 }
              }
              
              // Mark message as read (optional)
              whatsapp.messages.markAsRead(message.id)
                 .then(readResponse => console.log(`Marked message ${message.id} as read: ${readResponse.success}`))
                 .catch(err => console.error('Error marking message as read:', err));

            });
          }
          
          // Handle other change types if needed (e.g., account updates)
        } else {
          console.log(`Unhandled change field: ${change.field}`);
        }
      });
    });

    // Respond with '200 OK' to acknowledge receipt
    res.sendStatus(200);

  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API subscription
    console.warn(`Received webhook for unknown object: ${body.object}`);
    res.sendStatus(404);
  }
});

// Remember to start the server:
// app.listen(port, () => { console.log(`Server listening on port ${port}`); });
```

## Important Considerations

- **Security:** Always validate the `X-Hub-Signature-256` header to ensure the request genuinely comes from Meta. This involves calculating an HMAC SHA256 hash of the request body using your App Secret and comparing it to the signature provided in the header. (This example omits signature validation for brevity, but it's crucial for production.)
- **Asynchronous Processing:** For complex logic, process webhook events asynchronously (e.g., using a message queue) to avoid timing out the webhook request. Your endpoint should respond quickly with a `200 OK`.
- **Error Handling:** Implement robust error handling for both webhook processing and any subsequent API calls made in response.
- **Idempotency:** Webhooks might occasionally be delivered more than once. Design your handlers to be idempotent (processing the same event multiple times doesn't cause unintended side effects).
- **Subscribed Fields:** Ensure you have subscribed to the specific webhook fields (e.g., `messages`) you need in the Meta App Dashboard.

This tutorial provides a basic framework. You'll need to adapt and expand upon it based on your specific application requirements.
