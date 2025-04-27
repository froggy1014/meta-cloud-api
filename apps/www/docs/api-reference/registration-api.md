---
sidebar_position: 7
---

# Registration API

The Registration API allows you to register and deregister your business phone numbers with the WhatsApp Cloud API. Registration is required before you can use your phone number to send messages through the platform.

## Prerequisites

Before using the Registration API, you need:
- A WhatsApp Business Account (WABA)
- A verified business phone number
- Two-step verification set up for your phone number
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

## When to Register Your Phone Number

You need to register your business phone number in the following scenarios:

1. **Account Creation**: When you first implement the Cloud API and want to use a phone number to send messages
2. **Name Change**: If you've changed your display name in WhatsApp Manager and it's been approved
3. **API Migration**: When migrating your number from On-Premises API to Cloud API (requires additional steps)

## Registering a Phone Number

To register your business phone number with the WhatsApp Cloud API:

```typescript
// Register a phone number with your 6-digit PIN
const registrationResponse = await whatsapp.registration.register({
  pin: "123456" // Your 6-digit two-step verification PIN
});

console.log("Registration successful:", registrationResponse.data.success);
```

### With Data Localization

You can optionally enable local storage for your phone number during registration by specifying a data localization region:

```typescript
// Register with data localization enabled
const registrationResponse = await whatsapp.registration.register({
  pin: "123456",
  dataLocalizationRegion: "DE" // 2-letter ISO country code for Germany (EU)
});

console.log("Registration with local storage successful:", registrationResponse.data.success);
```

### Supported Data Localization Regions

The following regions are supported for data localization:

**APAC (Asia-Pacific)**
- Australia (AU)
- Indonesia (ID)
- India (IN)
- Japan (JP)
- Singapore (SG)
- South Korea (KR)

**Europe**
- EU/Germany (DE)
- Switzerland (CH)
- United Kingdom (GB)

**LATAM (Latin America)**
- Brazil (BR)

**MEA (Middle East & Africa)**
- Bahrain (BH)
- South Africa (ZA)
- United Arab Emirates (AE)

**NORAM (North America)**
- Canada (CA)

Important notes about data localization:
- Once enabled, data localization cannot be disabled or changed directly
- To change or disable it, you must deregister the number and register it again
- To enable local storage on a previously registered number, you must deregister it first

## Deregistering a Phone Number

When you no longer want to use a phone number with the Cloud API or need to change its settings (like data localization), you can deregister it:

```typescript
// Deregister a phone number
const deregistrationResponse = await whatsapp.registration.deregister();

console.log("Deregistration successful:", deregistrationResponse.data.success);
```

Important considerations for deregistration:
- Deregistration makes the number unusable with Cloud API and disables local storage
- It does not delete the number or its message history
- You cannot deregister a number that is in use with both the Cloud API and WhatsApp Business app

## Limitations and Rate Limits

The Registration API has important limitations to be aware of:

- Registration and deregistration requests are limited to 10 requests per business number in a 72-hour moving window
- If you exceed this limit, the API will return error code `133016` and the number will be prevented from being registered/deregistered for the next 72 hours

```typescript
try {
  const registrationResponse = await whatsapp.registration.register({
    pin: "123456"
  });
  console.log("Registration successful:", registrationResponse.data.success);
} catch (error) {
  if (error.code === 133016) {
    console.error("Rate limit exceeded: You've made too many registration attempts in the last 72 hours");
    // Handle rate limiting - perhaps schedule a retry after 72 hours
  }
}
```

## Error Handling

```typescript
try {
  const registrationResponse = await whatsapp.registration.register({
    pin: "123456"
  });
  console.log("Registration successful:", registrationResponse.data.success);
} catch (error) {
  console.error("Error registering phone number:", error);
  
  // Handle specific error scenarios
  switch (error.code) {
    case 100:
      console.log("Parameter missing or invalid");
      break;
    case 133016:
      console.log("Rate limit exceeded - try again after 72 hours");
      break;
    case 10:
      console.log("Permission issue - check access token permissions");
      break;
    default:
      console.log("Unknown error occurred");
  }
}
```

## Complete Registration Workflow

Here's an example of a complete workflow for setting up a new phone number with the WhatsApp Cloud API:

```typescript
const setupWhatsAppNumber = async () => {
  try {
    // Step 1: Set up two-step verification
    console.log("Setting up two-step verification...");
    const verificationResponse = await whatsapp.twoStepVerification.setup({
      pin: "123456"
    });
    
    if (verificationResponse.data.success) {
      // Step 2: Register the phone number
      console.log("Two-step verification set up. Registering phone number...");
      const registrationResponse = await whatsapp.registration.register({
        pin: "123456"
      });
      
      if (registrationResponse.data.success) {
        console.log("Phone number successfully registered with WhatsApp Cloud API");
        
        // Step 3: Now you can start sending messages
        console.log("Sending test message...");
        const messageResponse = await whatsapp.messages.text(
          { body: "Phone number setup complete!" },
          RECIPIENT_PHONE_NUMBER
        );
        
        console.log("Test message sent successfully:", messageResponse.data);
      }
    }
  } catch (error) {
    console.error("Setup process failed:", error);
  }
};

setupWhatsAppNumber();
```

## Migration from On-Premises API to Cloud API

If you're migrating a phone number from the On-Premises API to the Cloud API, additional steps are required. The main steps are:

1. Ensure your number is verified
2. Set up two-step verification
3. Follow the migration steps in the WhatsApp Manager
4. Register your number with the Cloud API

```typescript
// Register a migrated phone number
const migrateAndRegister = async () => {
  try {
    // Assuming migration prerequisites are completed in WhatsApp Manager
    const registrationResponse = await whatsapp.registration.register({
      pin: "123456"
    });
    
    console.log("Migration and registration successful:", registrationResponse.data.success);
  } catch (error) {
    console.error("Migration failed:", error);
  }
};
```

## Additional Resources

For more detailed information about registering phone numbers with the WhatsApp Cloud API, please refer to the [official WhatsApp Cloud API documentation on Registration](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/registration/). 