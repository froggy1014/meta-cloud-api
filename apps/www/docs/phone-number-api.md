---
sidebar_position: 3
---

# Phone Number API

WhatsApp Business Accounts require valid, dedicated business phone numbers. The Phone Number API allows you to manage your WhatsApp business phone numbers programmatically.

## Prerequisites

Before using the Phone Number API, you need:
- A WhatsApp Business Account (WABA)
- A Meta business portfolio (formerly known as Business Manager account)
- Proper access permissions to the WABA

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

## Phone Number Requirements

To be eligible for registration, business phone numbers must be:

- Owned by your business
- Have a country and area code (short codes are not supported)
- Able to receive voice calls or SMS for verification
- Not currently in use with WhatsApp Messenger or WhatsApp Business app
- Not banned by WhatsApp

## Managing Phone Numbers

### Retrieving Phone Number Information

You can get information about a specific phone number:

```typescript
// Get information about the current phone number
const phoneNumberInfo = await whatsapp.phoneNumber.get();

console.log("Phone number status:", phoneNumberInfo.data.status);
console.log("Display name:", phoneNumberInfo.data.verified_name);
```

### Get All Registered Phone Numbers 

To retrieve all phone numbers associated with your WhatsApp Business Account:

```typescript
// Get all phone numbers for the WhatsApp Business Account
const allPhoneNumbers = await whatsapp.phoneNumber.getAll();

console.log("Total registered phone numbers:", allPhoneNumbers.data.length);
allPhoneNumbers.data.forEach(number => {
  console.log(`Number: ${number.display_phone_number}, Status: ${number.status}`);
});
```

### Request Verification Code

When registering a new phone number, you'll need to verify it:

```typescript
// Request a verification code via SMS
const verificationRequest = await whatsapp.phoneNumber.requestVerificationCode({
  codeMethod: "SMS", // "SMS" or "VOICE"
  locale: "en_US"
});

console.log("Verification requested:", verificationRequest.data.success);
```

### Verify Phone Number

After receiving the verification code, you can complete the verification:

```typescript
// Verify the phone number with the received code
const verificationResponse = await whatsapp.phoneNumber.verify({
  code: "123456" // The verification code received
});

console.log("Verification status:", verificationResponse.data.success);
```

## Display Names

A business phone number display name is the name that appears in WhatsApp Manager and can be displayed in WhatsApp chat thread headers, chat lists, and profiles if the following conditions are met:

- The business portfolio that owns the WABA has completed business verification
- The phone number's `name_status` is `APPROVED`

### Setting a Display Name

```typescript
// Request to update the display name for your phone number
const updateNameResponse = await whatsapp.phoneNumber.updateDisplayName({
  displayName: "My Business Name"
});

console.log("Display name update request:", updateNameResponse.data.success);
```

### Display Name Approval Process

After setting a display name, Meta will either:
- Approve your display name
- Reject your display name
- Ask you to message more users before making a determination

You'll be notified of the decision through a `phone_number_name_update` webhook and Meta Business Suite notification.

## Two-Step Verification

### Setting Up Two-Step Verification

You can set up a PIN for two-step verification:

```typescript
// Set up a two-step verification PIN
const twoStepResponse = await whatsapp.twoStepVerification.setup({
  pin: "123456"
});

console.log("Two-step verification setup:", twoStepResponse.data.success);
```

### Updating Two-Step Verification PIN

```typescript
// Update an existing two-step verification PIN
const updatePinResponse = await whatsapp.twoStepVerification.update({
  pin: "654321"
});

console.log("PIN update:", updatePinResponse.data.success);
```

## Registered Number Limits

Business portfolios are initially limited to 2 registered business phone numbers, but this limit can be increased to up to 20 based on:

- Business verification status
- API usage volume
- Message quality

If your business needs more than 20 phone numbers and you have Enterprise Support access, you can request an increase through Direct Support.

## Phone Number Status

Business phone numbers have a status that reflects the number's quality rating and current messaging limit usage. You can check a phone number's status:

```typescript
// Get the current phone number's status
const phoneNumberStatus = await whatsapp.phoneNumber.get();

console.log("Phone number status:", phoneNumberStatus.data.status);
```

Possible status values include:
- `CONNECTED`: The phone number is active and able to send messages
- `PENDING`: The phone number is awaiting verification
- `DISCONNECTED`: The phone number is not connected
- `FLAGGED`: The phone number has quality issues
- `RATE_LIMITED`: The phone number has reached its messaging limits

## Migrating Phone Numbers

You can migrate phone numbers from one WABA to another, as well as migrate a number from On-Premises API to Cloud API (or vice-versa). This process needs to be initiated from the WhatsApp Manager or through Support.

## Conversational Components

WhatsApp provides UI components that make it easier for users to interact with your business. These can be enabled for your phone numbers.

```typescript
// Enable conversational components for your phone number
const enableComponentsResponse = await whatsapp.phoneNumber.updateSettings({
  enableConversationalComponents: true
});

console.log("Components enabled:", enableComponentsResponse.data.success);
```

## Error Handling

```typescript
try {
  const phoneNumberInfo = await whatsapp.phoneNumber.get();
  console.log("Phone number info:", phoneNumberInfo.data);
} catch (error) {
  console.error("Error retrieving phone number information:", error);
  
  // Handle specific error scenarios
  if (error.code === 100) {
    console.log("Parameter missing or invalid");
  } else if (error.code === 10) {
    console.log("Permission issue with the phone number");
  }
}
```

## Additional Resources

For more detailed information about WhatsApp business phone numbers, please refer to the [official WhatsApp Cloud API documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers/). 