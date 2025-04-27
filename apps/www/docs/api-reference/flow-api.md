---
sidebar_position: 10
---

# Flow API

The Flow API allows you to create and manage WhatsApp Flows - interactive, form-like experiences that help businesses collect information from customers within WhatsApp. This API enables you to programmatically create, update, publish, and manage your WhatsApp Flows.

## Prerequisites

Before using the Flow API, you need:
- A WhatsApp Business Account (WABA)
- A verified business phone number
- Access token with the appropriate permissions (`whatsapp_business_messaging` for developers or `whatsapp_business_management` for Solution Partners)
- Your business must be verified and maintain high message quality

## Basic Usage

First, initialize the WhatsApp client:

```typescript
import WhatsApp from 'meta-cloud-api';

// Initialize with configuration object
const whatsapp = new WhatsApp({
  phoneNumberId: YOUR_PHONE_NUMBER_ID,
  accessToken: 'YOUR_ACCESS_TOKEN',
  wabaId: YOUR_WABA_ID // Required for Flow API operations
});
```

## Creating a Flow

To create a new Flow:

```typescript
// Create a new Flow in DRAFT status
const flowResponse = await whatsapp.flows.create({
  name: "Appointment Booking Flow",
  categories: ["APPOINTMENT_BOOKING"],
});

console.log("Flow created successfully. Flow ID:", flowResponse.id);
```

To create a Flow with a JSON definition and publish it immediately:

```typescript
// Create and publish a Flow with JSON definition
const flowJson = {
  version: "5.0",
  screens: [
    {
      id: "WELCOME_SCREEN",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "TextHeading",
            text: "Welcome to our appointment booking"
          },
          {
            type: "Footer",
            label: "Complete",
            "on-click-action": {
              name: "complete",
              payload: {}
            }
          }
        ]
      },
      title: "Welcome",
      terminal: true,
      success: true,
      data: {}
    }
  ]
};

const flowResponse = await whatsapp.flows.create({
  name: "Appointment Booking Flow",
  categories: ["APPOINTMENT_BOOKING"],
  flowJson: JSON.stringify(flowJson),
  publish: true
});

console.log("Flow created and published. Flow ID:", flowResponse.id);
```

### Supported Parameters

| Parameter | Description |
|-----------|-------------|
| name | **Required.** The name of your Flow |
| categories | **Required.** A list of Flow categories. Must include at least one value from: SIGN_UP, SIGN_IN, APPOINTMENT_BOOKING, LEAD_GENERATION, CONTACT_US, CUSTOMER_SUPPORT, SURVEY, OTHER |
| flowJson | **Optional.** Flow's JSON definition encoded as a string |
| publish | **Optional.** Whether to publish the Flow immediately. Only works if flowJson is provided |
| cloneFlowId | **Optional.** ID of a source Flow to clone |
| endpointUri | **Optional.** URL of the WhatsApp Flow Endpoint (for Flows with JSON version 3.0+) |

## Updating Flow Metadata

To update a Flow's metadata:

```typescript
// Update a Flow's name and categories
const updateResponse = await whatsapp.flows.updateMetadata(FLOW_ID, {
  name: "Updated Appointment Flow",
  categories: ["APPOINTMENT_BOOKING", "CUSTOMER_SUPPORT"]
});

console.log("Flow updated successfully:", updateResponse.success);
```

## Updating Flow JSON

To update a Flow's JSON definition:

```typescript
// Update Flow JSON definition
const updateJsonResponse = await whatsapp.flows.updateJson(FLOW_ID, flowJson);

console.log("Flow JSON updated successfully:", updateJsonResponse.success);
console.log("Validation errors:", updateJsonResponse.validation_errors);
```

## Getting Flow Preview URL

To generate a preview URL for your Flow:

```typescript
// Get a preview URL for a Flow
const previewResponse = await whatsapp.flows.getPreviewUrl(FLOW_ID);

console.log("Preview URL:", previewResponse.preview.preview_url);
console.log("Expires at:", previewResponse.preview.expires_at);
```

The preview URL can be used to visualize and interact with your Flow before publishing. It can also be embedded as an iframe into an existing website:

```html
<iframe src="PREVIEW_URL" width="430" height="800"></iframe>
```

### Preview URL Parameters

You can add parameters to the preview URL for additional configuration:

| Parameter | Description |
|-----------|-------------|
| interactive | If true, the preview will run in interactive mode |
| flow_token | Token sent with each request to your server |
| custom_data | Custom data to initialize the Flow |
| endpoint_url | Override the endpoint URL defined in the Flow |

## Publishing a Flow

Once your Flow has been validated and meets WhatsApp's design principles and policies, you can publish it:

```typescript
// Publish a Flow
const publishResponse = await whatsapp.flows.publish(FLOW_ID);

console.log("Flow published successfully:", publishResponse.success);
```

## Deprecating a Flow

When you no longer want to use a published Flow:

```typescript
// Deprecate a Flow
const deprecateResponse = await whatsapp.flows.deprecate(FLOW_ID);

console.log("Flow deprecated successfully:", deprecateResponse.success);
```

## Retrieving Flow Assets

To get a list of assets attached to a Flow:

```typescript
// Get Flow assets
const assetsResponse = await whatsapp.flows.getAssets(FLOW_ID);

console.log("Flow assets:", assetsResponse);
```

## Migrating Flows Between WABAs

To migrate Flows from one WABA to another:

```typescript
// Migrate Flows between WABAs
const migrationResponse = await whatsapp.flows.migrate({
  sourceWabaId: SOURCE_WABA_ID,
  destinationWabaId: DESTINATION_WABA_ID,
  sourceFlowNames: ["appointment-booking", "lead-gen"]
});

console.log("Migrated Flows:", migrationResponse.migrated_flows);
console.log("Failed Flows:", migrationResponse.failed_flows);
```

## Flow Lifecycle

The lifecycle of a Flow includes these main states:

1. **DRAFT** - Initial state when creating or updating a Flow
2. **PUBLISHED** - Flow is live and can be sent to customers
3. **DEPRECATED** - Flow is no longer in use
4. **THROTTLED** - Flow is temporarily throttled due to high error rates
5. **BLOCKED** - Flow cannot be sent due to policy violations or other issues

## Error Handling

Flow API operations may return validation errors that need to be addressed:

```typescript
try {
  const flowResponse = await whatsapp.flows.create({
    name: "Appointment Booking Flow",
    categories: ["APPOINTMENT_BOOKING"],
    flowJson: JSON.stringify(flowJson),
    publish: true
  });
  
  console.log("Flow created successfully. Flow ID:", flowResponse.id);
  
  // Check for validation errors even on success
  if (flowResponse.validation_errors && flowResponse.validation_errors.length > 0) {
    console.warn("Flow created with validation warnings:", flowResponse.validation_errors);
  }
} catch (error) {
  console.error("Error creating Flow:", error);
  
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

## Complete Flow Creation Workflow

Here's an example of a complete workflow for creating, testing, and publishing a Flow:

```typescript
const createAndPublishFlow = async () => {
  try {
    // Step 1: Create a new Flow in draft mode
    console.log("Creating Flow...");
    const flowResponse = await whatsapp.flows.create({
      name: "Appointment Booking Flow",
      categories: ["APPOINTMENT_BOOKING"]
    });
    
    const flowId = flowResponse.id;
    
    // Step 2: Update the Flow with JSON content
    console.log("Updating Flow JSON...");
    const flowJson = {
      version: "5.0",
      screens: [
        // Flow screens definition
        // ...
      ]
    };
    
    const updateResponse = await whatsapp.flows.updateJson(flowId, flowJson);
    
    // Step 3: Check for validation errors
    if (updateResponse.validation_errors && updateResponse.validation_errors.length > 0) {
      console.warn("Flow validation issues need to be fixed:", updateResponse.validation_errors);
      return;
    }
    
    // Step 4: Generate a preview URL for testing
    console.log("Generating preview URL...");
    const previewResponse = await whatsapp.flows.getPreviewUrl(flowId);
    
    console.log("Please test your Flow at this URL:", previewResponse.preview.preview_url);
    console.log("This URL will expire at:", previewResponse.preview.expires_at);
    
    // Step 5: After manual testing, publish the Flow
    console.log("Publishing Flow...");
    const publishResponse = await whatsapp.flows.publish(flowId);
    
    console.log("Flow published successfully:", publishResponse.success);
    
    // Step 6: Now you can send the Flow to customers
    console.log("You can now send this Flow to customers using the Messages API");
  } catch (error) {
    console.error("Flow creation process failed:", error);
  }
};

createAndPublishFlow();
```

## Troubleshooting

Common issues when working with the Flow API include:

| Issue | Potential Cause | Resolution |
|-------|----------------|------------|
| Permission errors | Insufficient permissions or invalid access token | Verify your token has `whatsapp_business_management` and `whatsapp_business_messaging` permissions |
| Invalid request syntax | Malformed API request | Double-check your request against the API reference |
| Validation errors | Issues with Flow JSON structure | Fix all errors reported in the validation_errors array |
| Publishing failed | Flow doesn't meet WhatsApp requirements | Ensure your Flow complies with WhatsApp's design principles and policies |

## Additional Resources

For more detailed information about the WhatsApp Flow API, please refer to the [official WhatsApp Flows API documentation](https://developers.facebook.com/docs/whatsapp/flows/reference/flowsapi/). 
