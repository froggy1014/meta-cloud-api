---
sidebar_position: 9
---

# Contact Messages

Contact messages allow you to share contact information with your recipients through WhatsApp. You can share names, phone numbers, email addresses, and other contact details.

## Basic Usage

```typescript
import WhatsApp from 'meta-cloud-api';

// Initialize client
const whatsapp = new WhatsApp({
  phoneNumberId: YOUR_PHONE_NUMBER_ID,
  accessToken: 'YOUR_ACCESS_TOKEN'
});

// Send contact message
const response = await whatsapp.messages.contacts(
  [
    {
      name: {
        formatted_name: "John Doe",
        first_name: "John",
        last_name: "Doe"
      },
      phones: [
        {
          phone: "+15551234567",
          type: "CELL"
        }
      ],
      emails: [
        {
          email: "john.doe@example.com",
          type: "WORK"
        }
      ]
    }
  ],
  15551234567
);

console.log(`Contact message sent with ID: ${response.data.messages[0].id}`);
```

## Parameters

The `contacts()` method accepts the following parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| contacts | array | Array of contact objects |
| recipient | string or number | The recipient's phone number with country code |
| replyMessageId | string (optional) | ID of a message to reply to |

### Contact Object Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| name | object | Contact's name information | Yes |
| phones | array | List of phone numbers | No |
| emails | array | List of email addresses | No |
| addresses | array | List of addresses | No |
| org | object | Organization information | No |
| urls | array | List of URLs | No |
| birthday | string | Birthday in YYYY-MM-DD format | No |

### Name Object Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| formatted_name | string | Full formatted name | Yes |
| first_name | string | First name | No |
| last_name | string | Last name | No |
| middle_name | string | Middle name | No |
| suffix | string | Name suffix | No |
| prefix | string | Name prefix | No |

### Phone Object Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| phone | string | Phone number with country code | Yes |
| type | string | Phone type (HOME, WORK, CELL, MAIN, IPHONE, OTHER) | No |
| wa_id | string | WhatsApp ID | No |

### Email Object Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| email | string | Email address | Yes |
| type | string | Email type (HOME, WORK, OTHER) | No |

## Examples

### Basic Contact with Name and Phone

```typescript
const response = await whatsapp.messages.contacts(
  [
    {
      name: {
        formatted_name: "Jane Smith",
        first_name: "Jane",
        last_name: "Smith"
      },
      phones: [
        {
          phone: "+15551234567",
          type: "CELL"
        }
      ]
    }
  ],
  15551234567
);
```

### Contact with Multiple Phone Numbers and Emails

```typescript
const response = await whatsapp.messages.contacts(
  [
    {
      name: {
        formatted_name: "Alex Johnson",
        first_name: "Alex",
        last_name: "Johnson"
      },
      phones: [
        {
          phone: "+15551234567",
          type: "CELL"
        },
        {
          phone: "+15559876543",
          type: "WORK"
        }
      ],
      emails: [
        {
          email: "alex.personal@example.com",
          type: "HOME"
        },
        {
          email: "alex.johnson@company.com",
          type: "WORK"
        }
      ]
    }
  ],
  15551234567
);
```

### Business Contact with Organization Information

```typescript
const response = await whatsapp.messages.contacts(
  [
    {
      name: {
        formatted_name: "Sarah Williams",
        first_name: "Sarah",
        last_name: "Williams",
        prefix: "Dr."
      },
      phones: [
        {
          phone: "+15551234567",
          type: "WORK"
        }
      ],
      emails: [
        {
          email: "sarah.williams@hospital.org",
          type: "WORK"
        }
      ],
      org: {
        company: "City Hospital",
        department: "Cardiology",
        title: "Chief Cardiologist"
      },
      urls: [
        {
          url: "https://cityhospital.org/doctors/williams",
          type: "WORK"
        }
      ]
    }
  ],
  15551234567
);
```

### Sending Multiple Contacts

```typescript
const response = await whatsapp.messages.contacts(
  [
    {
      name: {
        formatted_name: "John Doe",
        first_name: "John",
        last_name: "Doe"
      },
      phones: [
        {
          phone: "+15551234567",
          type: "CELL"
        }
      ]
    },
    {
      name: {
        formatted_name: "Jane Smith",
        first_name: "Jane",
        last_name: "Smith"
      },
      phones: [
        {
          phone: "+15559876543",
          type: "CELL"
        }
      ]
    }
  ],
  15551234567
);
```

### Replying with Contacts

```typescript
const originalMessageId = "wamid.abcd1234...";

const response = await whatsapp.messages.contacts(
  [
    {
      name: {
        formatted_name: "Technical Support",
        first_name: "Technical",
        last_name: "Support"
      },
      phones: [
        {
          phone: "+15551234567",
          type: "WORK"
        }
      ],
      emails: [
        {
          email: "support@company.com",
          type: "WORK"
        }
      ]
    }
  ],
  15551234567,
  originalMessageId
);
```

## Address and Organization Format

### Address Format

```typescript
addresses: [
  {
    type: "WORK",
    street: "123 Business Street",
    city: "San Francisco",
    state: "CA",
    zip: "94107",
    country: "United States",
    country_code: "US"
  }
]
```

### Organization Format

```typescript
org: {
  company: "Company Name",
  department: "Department Name",
  title: "Job Title"
}
```

### URL Format

```typescript
urls: [
  {
    url: "https://example.com",
    type: "WORK"
  }
]
```

## Error Handling

```typescript
try {
  const response = await whatsapp.messages.contacts(
    [
      {
        name: {
          formatted_name: "John Doe",
          first_name: "John",
          last_name: "Doe"
        },
        phones: [
          {
            phone: "+15551234567",
            type: "CELL"
          }
        ]
      }
    ],
    15551234567
  );
  console.log("Contact message sent successfully:", response.data);
} catch (error) {
  console.error("Error sending contact message:", error);
  
  // Handle specific error cases
  if (error.response && error.response.data) {
    console.log("Error details:", error.response.data);
  }
}
```

## Best Practices

1. **Include complete information**: Provide as much relevant contact information as possible to make the contact useful.

2. **Format phone numbers correctly**: Always include the country code with phone numbers (e.g., "+1" for US numbers).

3. **Use appropriate types**: Specify the correct types for phones, emails, and addresses to help recipients organize the contact information.

4. **Consider privacy**: Only share contact information when you have permission to do so.

5. **Verify contact details**: Ensure all contact information is accurate before sending.

6. **Group related contacts**: When sending multiple contacts, group them logically (e.g., team members, service providers).

## How Recipients See Contact Messages

When a recipient receives a contact message:

1. They see the contact name and basic information in the chat
2. They can tap on the contact to view all the details
3. They have the option to save the contact to their phone's address book
4. If the contact has a WhatsApp account, they can start a new chat with them directly

## Related

- [Location Messages](./location.md) - For sharing location information
- [Text Messages](./text.md) - For sending text-based information
- [Interactive Messages](./interactive.md) - For creating interactive elements 