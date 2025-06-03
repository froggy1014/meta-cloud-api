# WhatsApp API Example Server

This is an Express.js example server that demonstrates how to use the meta-cloud-api package to handle WhatsApp Cloud API webhooks and send messages.

## Features

This example demonstrates various WhatsApp API features:

- **Command-based responses** (`hello`, `help`, `info`, etc.)
- **Interactive button messages** with user interactions
- **Template message support** (requires approved template for your WhatsApp business account)
- **Flow integration** with customer feedback surveys
- **Multiple message types** handling (text, image, document, interactive)
- **Clean architecture** separating concerns with proper handlers

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd examples/express-example

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file based on the `env.example` file:

```bash
cp env.example .env
```

Configure the following environment variables:

```env
# Server Configuration
PORT=3000
DEBUG=true

# WhatsApp Cloud API Credentials
CLOUD_API_ACCESS_TOKEN=your_whatsapp_access_token
WA_PHONE_NUMBER_ID=your_phone_number_id
WA_BUSINESS_ACCOUNT_ID=your_business_account_id

# Webhook Configuration
WEBHOOK_VERIFICATION_TOKEN=your_webhook_verify_token
```

### 3. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Project Structure

```
src/
├── server.ts                    # Main entry point
├── instance.ts                  # WhatsApp client configuration
├── config/                      # Configuration files
├── constants/                   # Constants
├── routes/
│   └── index.ts                 # Route definitions
├── handlers/                    # Message and event handlers
│   ├── feedbackFlowHandler.ts   # Feedback flow processing
│   ├── index.ts                 # Handler registry
│   ├── interactiveMessageHandler.ts # Interactive message handling
│   ├── mediaMessageHandler.ts    # Media message handling
│   ├── preProcessMessage.ts      # Message preprocessing
│   └── textMessageHandler.ts     # Text message commands
├── middleware/                  # Express middleware
│   ├── rawBody.ts               # Raw body middleware
├── screen/                      # Flow screen logic
│   ├── feedback/                # Customer feedback flow
│   │   └── index.ts             # Feedback screen processing
└── constants/                   # Message templates and constants
```

## API Endpoints

| Method | Endpoint  | Description |
|--------|-----------|-------------|
| GET    | `/`       | Homepage - server status |
| GET    | `/webhook` | WhatsApp webhook verification |
| POST   | `/webhook` | WhatsApp webhook for receiving messages |
| POST   | `/flow` | WhatsApp Flow webhook for data exchange |

## Webhook Setup

To receive messages from WhatsApp, you need to make your webhook publicly accessible.

### For Local Development

Use ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000
```

### Configure Webhook in Meta Developer Dashboard

1. Go to [Meta Developer Console](https://developers.facebook.com/apps/)
2. Navigate to your WhatsApp Business Platform app
3. In the WhatsApp > Configuration section:
   - **Webhook URL**: `https://your-ngrok-url.ngrok.io/webhook`
   - **Verify Token**: Same as your `WEBHOOK_VERIFICATION_TOKEN`
4. Subscribe to webhook fields: `messages`, `message_deliveries`

## Available Bot Commands

Send these commands to your WhatsApp bot:

| Command | Description |
|---------|-------------|
| `hello`, `hi` | Get a greeting message |
| `help` | Show available commands |
| `info` | Get account information |
| `template` | Send a template message (requires approved template) |
| `interactive` | Send interactive buttons |
| `flow` | Start the survey flow |


## WhatsApp Flow Integration

### Customer Feedback Flow

The example includes a complete customer feedback survey with:

1. **Recommendation Screen**: Ask if user would recommend the service
2. **Rating Screen**: Rate purchase experience, delivery, and customer service  
3. **Data Collection**: Validate and store user responses
4. **Completion**: Handle survey completion

#### Flow Setup

1. **Create Flow in Meta Business Manager**:
   - Go to WhatsApp Manager > Account Tools > Flows
   - Create a new flow and upload `src/flows/feedback-flow.json`
   - Note the generated `flow_id`

2. **Update Flow ID**:
   ```typescript
   // In src/handlers/textMessageHandler.ts
   const FLOW_ID = 'your_actual_flow_id';
   ```

3. **Customize Flow Logic**:
   - Screen processing: `src/screen/feedback/index.ts`
   - Flow handler: `src/handlers/feedbackFlowHandler.ts`

### Creating Custom Flows

1. **Define Flow Structure**: Create JSON definition in `src/flows/`
2. **Implement Screen Logic**: Add processing in `src/screen/`
3. **Create Handler**: Add flow handler in `src/handlers/`
4. **Register Handler**: Update `src/handlers/index.ts`

## Development Guidelines

### Adding New Command Handlers

```typescript
// In src/handlers/textMessageHandler.ts
export async function handleTextMessage(message: TextMessage, client: WhatsAppCloudAPI) {
  const command = message.text.body.toLowerCase().trim();
  
  switch (command) {
    case 'newcommand':
      await client.sendMessage({
        to: message.from,
        type: 'text',
        text: { body: 'Response for new command' }
      });
      break;
    // ... other cases
  }
}
```

### Message Type Handlers

The example supports multiple message types:
- **Text Messages**: Command processing and responses
- **Interactive Messages**: Button and list selections
- **Flow Messages**: WhatsApp Flow interactions
- **Media Messages**: Image, document, audio handling

## Troubleshooting

### Common Issues

1. **Webhook Verification Failed**
   - Ensure `WEBHOOK_VERIFICATION_TOKEN` matches Meta configuration
   - Check that webhook URL is publicly accessible

2. **Messages Not Sending**
   - Verify `CLOUD_API_ACCESS_TOKEN` is valid and not expired
   - Check `WA_PHONE_NUMBER_ID` is correct
   - Ensure phone number is verified in Meta Business Manager

3. **Flow Not Working**
   - Confirm flow is published in Meta Business Manager
   - Verify `flow_id` in code matches the actual flow ID
   - Check flow JSON structure is valid

### Debug Mode

Enable debug logging by setting `DEBUG=true` in your `.env` file to see detailed request/response logs.

