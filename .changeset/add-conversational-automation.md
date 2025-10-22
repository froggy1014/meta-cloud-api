---
"meta-cloud-api": minor
---

Add Conversational Automation API support for WhatsApp Business Phone Numbers

This release adds support for configuring conversational components on WhatsApp Business phone numbers:

- **Welcome Messages**: Configure automatic welcome messages for first-time users
- **Ice Breakers (Prompts)**: Set up to 4 tappable prompts (max 80 characters each) to help users start conversations
- **Commands**: Define up to 30 slash commands (max 32 chars name, 256 chars description) for easy user interactions

New API methods:
- `phoneNumber.setConversationalAutomation()` - Configure conversational components (POST)
- `phoneNumber.getConversationalAutomation()` - Retrieve current configuration (GET)

New TypeScript types:
- `ConversationalAutomationRequest` - Request payload for configuration
- `ConversationalAutomationResponse` - Response with current settings
- `ConversationalCommand` - Command configuration object
- `ConversationalPrompt` - Ice breaker prompt string

For more details, see: https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers/conversational-components
