---
sidebar_position: 6
---

# Two-Step Verification API

Two-step verification provides an extra layer of security to your WhatsApp Business Account. This API allows you to set up and manage PIN-based verification for your WhatsApp business phone numbers.

## Prerequisites

Before using the Two-Step Verification API, you need:
- A WhatsApp Business Account (WABA)
- A registered phone number
- Access token with the `whatsapp_business_messaging` permission (for developers) or `whatsapp_business_management` permission (for Solution Partners)

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

## Setting Up Two-Step Verification

You are required to set up two-step verification for your phone number. To do this, you need to create a 6-digit PIN:

```typescript
// Set up a 6-digit PIN for two-step verification
const setupResponse = await whatsapp.twoStepVerification.setup({
  pin: "123456" // Your 6-digit PIN
});

console.log("Setup successful:", setupResponse.data.success);
```

Important notes:
- The PIN must be exactly 6 digits
- Choose a PIN that you can remember but is not easy to guess
- There is no way to disable two-step verification once it's set up
- Store your PIN securely - it will be required when registering your phone number on new devices

## Updating Your PIN

If you need to update your existing PIN, you can do so with the update method:

```typescript
// Update your existing PIN to a new one
const updateResponse = await whatsapp.twoStepVerification.update({
  pin: "654321" // Your new 6-digit PIN
});

console.log("PIN update successful:", updateResponse.data.success);
```

## PIN Recovery Options

While the API doesn't provide direct recovery options, you can add an email address to your account through the WhatsApp Manager to help with PIN recovery:

```typescript
// Add recovery email (This is a pseudo-code example as the API doesn't directly support this)
// This would need to be done through the WhatsApp Manager interface
console.log("Add a recovery email through WhatsApp Manager for PIN recovery");
```

## Best Practices for PIN Security

1. **Use Unique PINs**: Avoid using the same PIN that you use for other services
2. **Avoid Predictable Patterns**: Don't use sequences like "123456" or repeating numbers
3. **Keep It Confidential**: Never share your PIN with anyone
4. **Regular Updates**: Change your PIN periodically for enhanced security
5. **Document Securely**: Keep a secure record of your PIN in case you forget it

## Forgot Your PIN?

If you've forgotten your PIN, you can update it by following these steps in WhatsApp Manager:

1. Go to settings and log into your Facebook Business
2. Click the business you use to manage your WABA
3. Click **WhatsApp Accounts** and find your WABA
4. In the WABA info panel, click **Settings**
5. In the new tab, click **WhatsApp Manager**
6. Find your phone number and click **Settings**
7. Click **Two-step verification**
8. Click **Change PIN**
9. Enter a new PIN and confirm it

## Error Handling

```typescript
try {
  const setupResponse = await whatsapp.twoStepVerification.setup({
    pin: "123456"
  });
  console.log("Two-step verification set up successfully:", setupResponse.data.success);
} catch (error) {
  console.error("Error setting up two-step verification:", error);
  
  // Handle specific error scenarios
  if (error.code === 100) {
    console.log("Parameter missing or invalid - PIN must be exactly 6 digits");
  } else if (error.code === 10) {
    console.log("Permission issue - check access token permissions");
  }
}
```

## Integration with Other APIs

Two-step verification is a prerequisite for using many other WhatsApp APIs. Make sure to set it up before attempting to:

- Register new phone numbers
- Use the Messages API
- Set up WhatsApp Business Profile
- Create message templates

```typescript
// Example workflow: Set up two-step verification before using other APIs
const setupTwoStep = async () => {
  try {
    // First set up two-step verification
    const verificationResponse = await whatsapp.twoStepVerification.setup({
      pin: "123456"
    });
    
    if (verificationResponse.data.success) {
      // Now you can proceed with other API calls
      console.log("Two-step verification set up, proceeding with other operations");
      
      // For example, now send a message
      const messageResponse = await whatsapp.messages.text(
        { body: "Hello from Meta Cloud API!" },
        15551234567
      );
      
      console.log("Message sent successfully:", messageResponse.data);
    }
  } catch (error) {
    console.error("Setup process failed:", error);
  }
};

setupTwoStep();
```

## Additional Resources

For more detailed information about Two-Step Verification in WhatsApp Business, please refer to the [official WhatsApp Cloud API documentation on Two-Step Verification](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/two-step-verification/). 