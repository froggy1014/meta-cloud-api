---
sidebar_position: 4
---

# QR Code API

QR codes allow customers to scan and quickly start conversations with your business on WhatsApp. The QR Code API enables you to create, retrieve, update, and delete QR codes and their associated short links programmatically.

## Prerequisites

Before using the QR Code API, you need:
- A WhatsApp Business Account (WABA)
- The ID of your WhatsApp business phone number
- Access token with the `whatsapp_business_messages` permission
- Admin access to the Business Manager account

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

## Creating QR Codes

You can create QR codes with pre-filled messages to jumpstart conversations:

```typescript
// Create a QR code with a prefilled message
const qrCodeResponse = await whatsapp.qrCode.create({
  prefilledMessage: "I'd like to know more about your services",
  imageFormat: "SVG" // Can be "SVG" or "PNG"
});

console.log("QR Code created:", qrCodeResponse.data);
console.log("QR Code ID:", qrCodeResponse.data.code);
console.log("Deep link URL:", qrCodeResponse.data.deep_link_url);
console.log("QR image URL:", qrCodeResponse.data.qr_image_url);
```

The response will include:
- `code`: The unique identifier for the QR code
- `prefilled_message`: The message pre-filled for the user
- `deep_link_url`: A URL (in the format https://wa.me/message/CODE) that will open WhatsApp with the prefilled message
- `qr_image_url`: URL of the generated QR code image

## Listing QR Codes

You can retrieve all QR codes associated with your business phone number:

```typescript
// Get all QR codes
const qrCodesResponse = await whatsapp.qrCode.getAll();

console.log("Total QR codes:", qrCodesResponse.data.length);
qrCodesResponse.data.forEach(qrCode => {
  console.log(`QR Code ID: ${qrCode.code}, Message: ${qrCode.prefilled_message}`);
});
```

## Getting a Specific QR Code

Retrieve information about a specific QR code using its ID:

```typescript
// Get a specific QR code by ID
const qrCodeId = "4O4YGZEG3RIVE1"; // The QR code ID from creation or listing
const qrCodeResponse = await whatsapp.qrCode.get(qrCodeId);

console.log("QR Code details:", qrCodeResponse.data);
```

## Updating QR Codes

You can update the prefilled message of an existing QR code:

```typescript
// Update a QR code's prefilled message
const qrCodeId = "4O4YGZEG3RIVE1"; // The QR code ID to update
const updateResponse = await whatsapp.qrCode.update(qrCodeId, {
  prefilledMessage: "I'd like to discuss your summer promotion"
});

console.log("Updated QR Code:", updateResponse.data);
```

## Deleting QR Codes

QR codes don't expire automatically. When you no longer need a QR code, you can delete it:

```typescript
// Delete a QR code
const qrCodeId = "4O4YGZEG3RIVE1"; // The QR code ID to delete
const deleteResponse = await whatsapp.qrCode.delete(qrCodeId);

console.log("Deletion successful:", deleteResponse.data.success);
```

## QR Code Best Practices

1. **Clear Call-to-Action**: Include a clear purpose in your prefilled message
2. **Contextual Placement**: Place QR codes in contexts where the prefilled message makes sense
3. **Regular Maintenance**: Delete unused QR codes to keep your system organized
4. **Tracking**: Consider using different QR codes for different marketing channels to track effectiveness

## Practical Use Cases

### In-Store Assistance

```typescript
const inStoreQrResponse = await whatsapp.qrCode.create({
  prefilledMessage: "I'm in your store and need help finding a product",
  imageFormat: "PNG"
});
```

### Product Inquiries

```typescript
const productQrResponse = await whatsapp.qrCode.create({
  prefilledMessage: "I'd like more information about Product XYZ",
  imageFormat: "SVG"
});
```

### Event Registration

```typescript
const eventQrResponse = await whatsapp.qrCode.create({
  prefilledMessage: "I want to register for your upcoming workshop",
  imageFormat: "PNG"
});
```

## Error Handling

```typescript
try {
  const qrCodeResponse = await whatsapp.qrCode.create({
    prefilledMessage: "Hello, I'm interested in your services",
    imageFormat: "SVG"
  });
  console.log("QR Code created successfully:", qrCodeResponse.data);
} catch (error) {
  console.error("Error creating QR code:", error);
  
  // Handle specific error scenarios
  if (error.code === 100) {
    console.log("Parameter missing or invalid");
  } else if (error.code === 10) {
    console.log("Permission issue with the phone number");
  }
}
```

## Additional Resources

For more detailed information about QR codes and short links for WhatsApp Business, please refer to the [official WhatsApp Business Management API documentation](https://developers.facebook.com/docs/whatsapp/business-management-api/qr-codes/). 