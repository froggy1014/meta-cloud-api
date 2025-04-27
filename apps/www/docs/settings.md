---
sidebar_position: 3
---

# Settings and Configuration

This guide explains the various configuration options available for the Meta Cloud API wrapper.

## Configuration Methods

You can configure the wrapper in two primary ways:

1.  **Directly via Constructor:** Pass a configuration object when creating the `WhatsApp` instance.
2.  **Using Environment Variables:** Set specific environment variables, and the wrapper will automatically pick them up.

## Configuration Parameters

### Required Parameters

These parameters are essential for the wrapper to authenticate and interact with the WhatsApp Cloud API.

*   `phoneNumberId` (string)
    *   **Description:** The ID of the phone number you want to use for sending messages.
    *   **Environment Variable:** `META_PHONE_NUMBER_ID`
    *   **How to find:** In the Meta App Dashboard > WhatsApp > API Setup.

*   `accessToken` (string)
    *   **Description:** The access token for authenticating your API requests. This is typically a temporary token for testing or a permanent System User token for production.
    *   **Environment Variable:** `META_ACCESS_TOKEN`
    *   **How to find:** In the Meta App Dashboard > WhatsApp > API Setup (Temporary Token) or generated via Business Manager for a System User (Permanent Token).

### Optional Parameters

These parameters allow for further customization.

*   `businessAcctId` (string)
    *   **Description:** Your WhatsApp Business Account (WABA) ID. While often not required for basic messaging, it might be needed for specific API calls related to account management.
    *   **Environment Variable:** `META_BUSINESS_ACCT_ID`
    *   **How to find:** In the Meta Business Suite/Manager > Business Settings > Accounts > WhatsApp Accounts.

*   `apiVersion` (string)
    *   **Description:** The specific version of the Graph API you want to use (e.g., "v19.0", "v20.0").
    *   **Environment Variable:** `META_API_VERSION`
    *   **Default:** The wrapper usually defaults to the latest stable version supported (e.g., "22" in the provided code, but this might change).
    *   **Recommendation:** Explicitly set this if you need to rely on features or behaviors of a specific API version.

*   `host` (string)
    *   **Description:** The base host for the Graph API.
    *   **Environment Variable:** `META_API_HOST` (Assuming, verify actual implementation)
    *   **Default:** `graph.facebook.com`
    *   **Recommendation:** Usually, you don't need to change this unless instructed by Meta or for specific testing environments.

*   `userAgent` (string)
    *   **Description:** Custom User-Agent string for API requests.
    *   **Environment Variable:** Not typically configured via environment variable.
    *   **Default:** A default string identifying the wrapper (e.g., `meta-cloud-api/x.y.z`).
    *   **Recommendation:** Generally leave as default.

## Examples

### Constructor Configuration

```typescript
import WhatsApp from 'meta-cloud-api';

const whatsapp = new WhatsApp({
  phoneNumberId: '123456789012345',
  accessToken: 'EAAM...', // Your access token
  businessAcctId: '987654321098765', // Optional
  apiVersion: 'v20.0' // Optional
});
```

### Environment Variable Configuration

**.env file:**

```
META_PHONE_NUMBER_ID=123456789012345
META_ACCESS_TOKEN=EAAM...
META_BUSINESS_ACCT_ID=987654321098765
META_API_VERSION=v20.0
```

**Code:**

```typescript
import WhatsApp from 'meta-cloud-api';

// Loads configuration from .env automatically
const whatsapp = new WhatsApp();
```

Choose the configuration method that best suits your project structure and deployment strategy. Using environment variables is generally recommended for production environments to keep sensitive credentials out of your codebase.
