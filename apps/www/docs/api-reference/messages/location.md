---
sidebar_position: 8
---

# Location Messages

Location messages allow you to share geographic locations with your recipients through WhatsApp. You can send coordinates along with optional location name and address information.

## Basic Usage

```typescript
import WhatsApp from 'meta-cloud-api';

// Initialize client
const whatsapp = new WhatsApp({
  phoneNumberId: YOUR_PHONE_NUMBER_ID,
  accessToken: 'YOUR_ACCESS_TOKEN'
});

// Send location message
const response = await whatsapp.messages.location({
  body: { 
    latitude: 37.483872,
    longitude: -122.148358,
    name: "Meta Headquarters",
    address: "1 Hacker Way, Menlo Park, CA 94025"
  },
  to: "15551234567"
});

console.log(`Location message sent with ID: ${response.messages[0].id}`);
```

## Parameters

The `location()` method accepts the following parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| params | MessageRequestParams`LocationObject` | Object containing message parameters |

### MessageRequestParams`LocationObject` Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| body | LocationObject | The location message body | Required |
| to | string | The recipient's phone number with country code | Required |
| replyMessageId | string | ID of a message to reply to | Optional |

### LocationObject Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| latitude | number | Latitude coordinate of the location | Yes |
| longitude | number | Longitude coordinate of the location | Yes |
| name | string | Name of the location | No |
| address | string | Address of the location | No |

## Examples

### Basic Location with Coordinates Only

```typescript
const response = await whatsapp.messages.location({
  body: { 
    latitude: 40.730610,
    longitude: -73.935242
  },
  to: "15551234567"
});
```

### Location with Name and Address

```typescript
const response = await whatsapp.messages.location({
  body: { 
    latitude: 48.858844,
    longitude: 2.294351,
    name: "Eiffel Tower",
    address: "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France"
  },
  to: "15551234567"
});
```

### Sending a Business Location

```typescript
const response = await whatsapp.messages.location({
  body: { 
    latitude: 51.509865,
    longitude: -0.118092,
    name: "London Office",
    address: "123 Business Street, London, UK"
  },
  to: "15551234567"
});
```

### Replying with a Location

```typescript
const originalMessageId = "wamid.abcd1234...";

const response = await whatsapp.messages.location({
  body: { 
    latitude: 34.052235,
    longitude: -118.243683,
    name: "Meeting Point",
    address: "Downtown Los Angeles, CA"
  },
  to: "15551234567",
  replyMessageId: originalMessageId
});
```

## Obtaining Coordinates

There are several ways to obtain coordinates for a location:

1. **Using Google Maps**: Right-click on a location in Google Maps and select "What's here?" to see the coordinates.

2. **Using Geocoding Services**: Use geocoding APIs to convert addresses to coordinates.

3. **Using Device GPS**: In mobile applications, you can use the device's GPS to obtain the user's current coordinates.

Here's an example of how you might use a geocoding service:

```typescript
// This is just a conceptual example - you would need to use a real geocoding service
async function getCoordinates(address) {
  const geocodingResponse = await geocodingService.geocode(address);
  return {
    latitude: geocodingResponse.lat,
    longitude: geocodingResponse.lng
  };
}

// Then use the coordinates to send a location message
const coordinates = await getCoordinates("1 Hacker Way, Menlo Park, CA");
const response = await whatsapp.messages.location({
  body: { 
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    name: "Meta Headquarters",
    address: "1 Hacker Way, Menlo Park, CA 94025"
  },
  to: "15551234567"
});
```

## Error Handling

```typescript
try {
  const response = await whatsapp.messages.location({
    body: { 
      latitude: 37.483872,
      longitude: -122.148358,
      name: "Meta Headquarters",
      address: "1 Hacker Way, Menlo Park, CA 94025"
    },
    to: "15551234567"
  });
  console.log("Location message sent successfully:", response);
} catch (error) {
  console.error("Error sending location message:", error);
  
  // Handle specific error cases
  if (error.response && error.response.data) {
    console.log("Error details:", error.response.data);
  }
}
```

## Best Practices

1. **Provide accurate coordinates**: Ensure that latitude and longitude values are accurate to provide the correct location.

2. **Include name and address**: While optional, providing a name and address makes the location more recognizable and useful.

3. **Verify coordinates before sending**: Double-check coordinates to avoid sending incorrect locations.

4. **Consider privacy**: Be mindful of sharing sensitive location information.

5. **Use for relevant purposes**: Send location messages when they provide value, such as sharing business locations, meeting points, or event venues.

## How Recipients See Location Messages

When a recipient receives a location message:

1. They see a map preview with a pin at the specified coordinates
2. If provided, they see the name and address text
3. They can tap on the location to open it in their default maps application
4. They can easily get directions to the location from their current position

## Related

- [Contact Messages](./contact.md) - For sharing contact information
- [Interactive Messages](./interactive.md) - For creating interactive elements
- [Text Messages](./text.md) - For sending text-based information 