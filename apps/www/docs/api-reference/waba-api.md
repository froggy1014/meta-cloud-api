---
sidebar_position: 9
---

# WABA API

The WhatsApp Business Account (WABA) API allows you to manage your business accounts and their associated webhooks. This API is particularly useful for receiving notifications about changes to your business accounts, phone numbers, message templates, and messages.

## Prerequisites

Before using the WABA API, you need:
- A WhatsApp Business Account (WABA)
- A verified business phone number
- Access token with the appropriate permissions (`whatsapp_business_messaging` for developers or `whatsapp_business_management` for Solution Partners)
- A webhook URL configured in your Facebook App's dashboard

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

## Understanding Webhooks

WhatsApp Business Accounts and their assets are objects in the Facebook Social Graph. When a trigger event occurs to one of these objects, Facebook sends a notification to the webhook URL specified in your Facebook App's dashboard.

You need to individually subscribe to every WABA for which you wish to receive webhooks.

## Managing Webhook Subscriptions

### Subscribe to Webhooks

To subscribe your app to receive webhooks for a business customer's WABA:

```typescript
// Subscribe to webhooks for a specific WABA
const subscriptionResponse = await whatsapp.waba.subscribeWebhooks(WABA_ID);

console.log("Subscription successful:", subscriptionResponse.data.success);
```

### Get All Subscriptions

To retrieve a list of apps subscribed to webhooks for a WABA:

```typescript
// Get all webhook subscriptions for a WABA
const subscriptionsResponse = await whatsapp.waba.getWebhookSubscriptions(WABA_ID);

console.log("Subscribed apps:", subscriptionsResponse.data);
```

### Unsubscribe from Webhooks

To unsubscribe your app from webhooks for a WABA:

```typescript
// Unsubscribe from webhooks for a WABA
const unsubscribeResponse = await whatsapp.waba.unsubscribeWebhooks(WABA_ID);

console.log("Unsubscription successful:", unsubscribeResponse.data.success);
```

## Available Webhook Subscription Fields

You can configure your app to receive various types of notifications. Here are the available subscription fields:

| Field Name | Description |
|------------|-------------|
| account_alerts | Notifications about decisions related to Official Business Account status or denial of messaging limit increases |
| account_review_update | Notifications when a WABA has been reviewed |
| account_update | Notifications about changes to your WABA (phone number updates, policy violations, bans, etc.) |
| business_capability_update | Notifications about changes to business capabilities (max phone numbers, messaging limits) |
| message_template_components_update | Notifications about changes to a template's components |
| message_template_quality_update | Notifications when a message template's quality rating changes |
| message_template_status_update | Notifications when a message template is approved, rejected, or disabled |
| messages | Notifications about customer messages, message delivery, and message read status |
| phone_number_name_update | Notifications when a phone number name is approved or rejected |
| phone_number_quality_update | Notifications when the business phone number quality status changes |
| security | Notifications about two-step verification code changes |
| template_category_update | Notifications when a template's category changes |

## Webhook Format

Webhook notifications follow this general format:

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "BUSINESS_ID",
      "time": TIMESTAMP,
      "changes": [
        {
          "field": "FIELD_NAME",
          "value": {
            // Value object containing the notification details
          }
        }
      ]
    }
  ]
}
```

## Example Webhook Payloads

### Onboarded Business Customer

When a business customer successfully completes the Embedded Signup flow:

```json
{
  "entry": [
    {
      "id": "35602282435505",
      "time": 1731617831,
      "changes": [
        {
          "value": {
            "event": "PARTNER_ADDED",
            "waba_info": {
              "waba_id": "495709166956424",
              "owner_business_id": "942647313864044"
            }
          },
          "field": "account_update"
        }
      ]
    }
  ],
  "object": "whatsapp_business_account"
}
```

### Phone Number Name Update

When a phone number name change is approved:

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP-BUSINESS-ACCOUNT-ID",
      "time": TIMESTAMP,
      "changes": [
        {
          "field": "phone_number_name_update",
          "value": {
            "display_phone_number": "PHONE_NUMBER",
            "decision": "APPROVED",
            "requested_verified_name": "WhatsApp",
            "rejection_reason": null
          }
        }
      ]
    }
  ]
}
```

### Phone Number Quality Update

When a phone number's quality status changes:

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP-BUSINESS-ACCOUNT-ID",
      "time": TIMESTAMP,
      "changes": [
        {
          "field": "phone_number_quality_update",
          "value": {
            "display_phone_number": "PHONE_NUMBER",
            "event": "FLAGGED",
            "current_limit": "TIER_10K"
          }
        }
      ]
    }
  ]
}
```

### WABA Status Updates

When a sandbox number is upgraded to a Verified Account:

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP-BUSINESS-ACCOUNT-ID",
      "time": TIMESTAMP,
      "changes": [
        {
          "field": "account_update",
          "value": {
            "phone_number": "PHONE_NUMBER",
            "event": "VERIFIED_ACCOUNT"
          }
        }
      ]
    }
  ]
}
```

When a WABA is banned:

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP-BUSINESS-ACCOUNT-ID",
      "time": TIMESTAMP,
      "changes": [
        {
          "field": "account_update",
          "value": {
            "event": "DISABLED_UPDATE",
            "ban_info": {
              "waba_ban_state": ["SCHEDULE_FOR_DISABLE", "DISABLE", "REINSTATE"],
              "waba_ban_date": "DATE"
            }
          }
        }
      ]
    }
  ]
}
```

### Message Template Updates

When a message template is approved:

```json
{
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "time": TIMESTAMP,
      "changes": [
        {
          "value": {
            "event": "APPROVED",
            "message_template_id": TEMPLATE_ID,
            "message_template_name": "TEMPLATE_NAME",
            "message_template_language": "LANGUAGE_AND_LOCALE_CODE",
            "reason": "NONE"
          },
          "field": "message_template_status_update"
        }
      ]
    }
  ],
  "object": "whatsapp_business_account"
}
```

## Error Handling

Here's an example of handling errors when subscribing to webhooks:

```typescript
try {
  const subscriptionResponse = await whatsapp.waba.subscribeWebhooks(WABA_ID);
  console.log("Subscription successful:", subscriptionResponse.data.success);
} catch (error) {
  console.error("Error subscribing to webhooks:", error);
  
  // Handle specific error scenarios
  switch (error.code) {
    case 190:
      console.log("Invalid access token");
      break;
    case 10:
      console.log("Permission issue - check access token permissions");
      break;
    default:
      console.log("Unknown error occurred");
  }
}
```

## Complete Webhook Setup Workflow

Here's an example of a complete workflow for setting up webhooks for a WABA:

```typescript
const setupWabaWebhooks = async () => {
  try {
    // Step 1: Subscribe to webhooks for the WABA
    console.log("Subscribing to WABA webhooks...");
    const subscriptionResponse = await whatsapp.waba.subscribeWebhooks(WABA_ID);
    
    if (subscriptionResponse.data.success) {
      // Step 2: Verify the subscription is active
      console.log("Subscription successful. Verifying subscriptions...");
      const subscriptionsResponse = await whatsapp.waba.getWebhookSubscriptions(WABA_ID);
      
      console.log("Current subscriptions:", subscriptionsResponse.data);
      
      // Step 3: Test webhook by sending a message
      console.log("Sending test message to trigger webhook...");
      const messageResponse = await whatsapp.messages.text(
        { body: "This message will trigger a webhook event" },
        RECIPIENT_PHONE_NUMBER
      );
      
      console.log("Test message sent successfully:", messageResponse.data);
    }
  } catch (error) {
    console.error("Webhook setup process failed:", error);
  }
};

setupWabaWebhooks();
```

## Additional Resources

For more detailed information about WhatsApp Business Account webhooks, please refer to the [official WhatsApp documentation on Managing Webhooks](https://developers.facebook.com/docs/whatsapp/embedded-signup/webhooks#subscribe). 