import 'dotenv/config';
import express from 'express';
import { MessageTypesEnum } from 'meta-cloud-api';
import { ContactMessageFactory } from 'meta-cloud-api/api/messages/builders';
import { webhookHandler } from 'meta-cloud-api/webhook/express';

const app = express();

// Configuration from environment variables
const config = {
    accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
    phoneNumberId: parseInt(process.env.WA_PHONE_NUMBER_ID!),
    webhookVerificationToken: process.env.WEBHOOK_VERIFICATION_TOKEN!,
};

// Create webhook handler
const bot = webhookHandler(config);

// Handle text messages
bot.processor.onMessage(MessageTypesEnum.Text, async (whatsapp, message) => {
    console.log(`Received message: "${message.text?.body}" from ${message.from}`);

    // Mark message as read
    await whatsapp.messages.markAsRead({ messageId: message.id });

    // ==== ACTIVE: Simple contact card ====
    const simpleContact = ContactMessageFactory.createSimpleContact('John Doe', '+1234567890');

    await whatsapp.messages.contacts({
        to: message.from,
        body: [simpleContact],
    });

    // ==== Example 1: Contact with full details ====
    // Uncomment to use:
    /*
    const fullContact = new ContactMessageBuilder()
        .setFullName("Smith", "Jane", "Marie", "PhD", "Dr.")
        .addPhone("+1234567890", "WORK", "1234567890")
        .addPhone("+0987654321", "HOME")
        .addEmail("jane.smith@company.com", "WORK")
        .addEmail("jane@personal.com", "HOME")
        .addAddress({
            street: "123 Main St",
            city: "New York", 
            state: "NY",
            zip: "10001",
            country: "USA",
            country_code: "US",
            type: "WORK"
        })
        .setOrganization("Tech Corp", "Engineering", "Senior Developer")
        .addUrl("https://example.com", "WORK")
        .build();
    
    await whatsapp.messages.contacts({
        to: message.from,
        body: [fullContact]
    });
    */

    // ==== Example 2: Multiple contacts ====
    // Uncomment to use:
    /*
    const salesContact = new ContactMessageBuilder()
        .setSimpleName("Sales Team")
        .addPhone("+1111111111", "WORK")
        .build();
    
    const supportContact = new ContactMessageBuilder()
        .setSimpleName("Support Team")
        .addPhone("+2222222222", "WORK")
        .addEmail("support@company.com", "WORK")
        .build();
    
    await whatsapp.messages.contacts({
        to: message.from,
        body: [salesContact, supportContact]
    });
    */

    // ==== Example 3: Business contact ====
    // Uncomment to use:
    /*
    const businessContact = ContactMessageFactory.createBusinessContact(
        "Customer Service",
        "Manager",
        "Example Corp",
        "Support Department",
        "+1234567890",
        "support@example.com"
    );
    
    await whatsapp.messages.contacts({
        to: message.from,
        body: [businessContact]
    });
    */
});

// Handle contact messages
bot.processor.onMessage(MessageTypesEnum.Contacts, async (whatsapp, message) => {
    const contacts = message.contacts || [];
    const contactNames = contacts.map((c) => c.name?.formatted_name).join(', ');

    console.log(`Received ${contacts.length} contact(s) from ${message.from}`);

    await whatsapp.messages.text({
        to: message.from,
        body: `Thanks for sharing ${contacts.length} contact(s): ${contactNames}`,
    });
});

// Setup webhook endpoints
app.get('/webhook', bot.webhook);
app.post('/webhook', express.json(), bot.webhook);

// Homepage
app.get('/', (req, res) => res.send('WhatsApp Contact Message Example is running!'));

// Start server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Contact message example server running on port ${PORT}`);
    console.log('Features:');
    console.log('- Active: Send simple contact card');
    console.log('- Active: Handle received contacts');
    console.log('- Available: Full contact details, multiple contacts');
});
