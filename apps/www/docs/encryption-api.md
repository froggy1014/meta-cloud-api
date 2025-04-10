---
sidebar_position: 5
---

# Encryption API

The Encryption API allows you to manage encryption for WhatsApp Flows, establishing a secure GraphQL-powered data exchange channel between your business and WhatsApp consumer clients. This API enables setting and retrieving business public keys for encryption purposes.

## Prerequisites

Before using the Encryption API, you need:
- A WhatsApp Business Account (WABA) with a successfully registered phone number
- A 2048-bit RSA key pair (details on generation below)
- Access token with the `whatsapp_business_messaging` permission

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

## Generating a 2048-bit RSA Key Pair

Before using the Encryption API, you need to generate a 2048-bit RSA key pair. While this is typically done using command line tools, you can also do it programmatically in your Node.js application.

Here's how to generate keys using OpenSSL (command line):

```bash
# Generate a private key
openssl genrsa -des3 -out private.pem 2048

# Export the public key
openssl rsa -in private.pem -outform PEM -pubout -out public.pem
```

You can also generate keys programmatically using the Node.js `crypto` module:

```typescript
import * as crypto from 'crypto';
import * as fs from 'fs';

// Generate key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
    cipher: 'aes-256-cbc',
    passphrase: 'your-secure-passphrase'
  }
});

// Save keys to files
fs.writeFileSync('private.pem', privateKey);
fs.writeFileSync('public.pem', publicKey);

console.log('RSA key pair generated successfully');
```

### Reusing Existing Keys

If you have an existing private/public key pair or certificate, you can extract the public key from it:

```bash
openssl x509 -pubkey -noout -in certificate.pem > public.pem
```

## Setting a Business Public Key

After generating your key pair, you need to set your business public key:

```typescript
// Read the public key from file
import * as fs from 'fs';
const publicKey = fs.readFileSync('public.pem', 'utf8');

// Set the business public key
const setKeyResponse = await whatsapp.encryption.setBusinessPublicKey(publicKey);

console.log("Key set successfully:", setKeyResponse.data.success);
```

Important considerations:
- If you have multiple phone numbers linked to your WABA, you must call this API for each phone number
- The public key must be in PEM format
- The key should be 2048-bit RSA

## Getting the Business Public Key

You can retrieve the business public key that was previously set:

```typescript
// Get the current business public key
const keyResponse = await whatsapp.encryption.getBusinessPublicKey();

console.log("Public key:", keyResponse.data.business_public_key);
console.log("Signature status:", keyResponse.data.business_public_key_signature_status);
```

The response includes:
- `business_public_key`: The stored 2048-bit RSA business public key
- `business_public_key_signature_status`: Status of the key, which can be `VALID` or `MISMATCH`

## Practical Use Cases

### Setting Up Encrypted Flows

WhatsApp Flows allows interactive experiences with businesses. Setting up encryption for Flows protects sensitive data:

```typescript
import * as fs from 'fs';

// Generate key pair (or use existing)
// ...

// Read public key
const publicKey = fs.readFileSync('public.pem', 'utf8');

// Set the business public key for Flows encryption
try {
  const setKeyResponse = await whatsapp.encryption.setBusinessPublicKey(publicKey);
  
  if (setKeyResponse.data.success) {
    console.log("Encryption successfully set up for WhatsApp Flows");
  }
} catch (error) {
  console.error("Failed to set up encryption:", error);
}
```

### Verifying Encryption Status

Before launching a Flow that relies on encryption, verify the key's status:

```typescript
try {
  const keyResponse = await whatsapp.encryption.getBusinessPublicKey();
  
  if (keyResponse.data.business_public_key_signature_status === 'VALID') {
    console.log("Encryption is properly configured");
  } else {
    console.warn("Encryption key status is not valid:", keyResponse.data.business_public_key_signature_status);
    // Take appropriate action, such as regenerating and setting a new key
  }
} catch (error) {
  console.error("Failed to verify encryption status:", error);
}
```

## Error Handling

```typescript
try {
  const publicKey = fs.readFileSync('public.pem', 'utf8');
  const setKeyResponse = await whatsapp.encryption.setBusinessPublicKey(publicKey);
  console.log("Key set successfully:", setKeyResponse.data.success);
} catch (error) {
  console.error("Error setting business public key:", error);
  
  // Handle specific error scenarios
  if (error.code === 100) {
    console.log("Parameter missing or invalid - public key may be malformed");
  } else if (error.code === 10) {
    console.log("Permission issue - check access token permissions");
  }
}
```

## Security Best Practices

1. **Protect Private Keys**: Keep your private key secure and never share it
2. **Key Rotation**: Periodically generate new key pairs for enhanced security
3. **Separate Storage**: Store private keys separately from your application code
4. **Access Control**: Limit access to encryption-related functionality
5. **Validate Key Status**: Regularly check the signature status of your public key

## Additional Resources

For more detailed information about WhatsApp Business encryption, please refer to the [official WhatsApp Cloud API documentation on Flows Encryption](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/whatsapp-business-encryption/). 