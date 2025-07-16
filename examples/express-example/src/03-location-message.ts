import 'dotenv/config';
import express from 'express';
import { MessageTypesEnum } from 'meta-cloud-api';
import { webhookHandler } from 'meta-cloud-api/webhook/express';
import { LocationMessageBuilder } from 'meta-cloud-api/api/messages/builders';

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

    // ==== ACTIVE: Using LocationMessageBuilder ====
    const seoulCityHall = new LocationMessageBuilder()
        .setCoordinates(37.5665, 126.978)
        .setName('Seoul City Hall')
        .setAddress('110 Sejong-daero, Jung-gu, Seoul, South Korea')
        .build();

    await whatsapp.messages.location({
        to: message.from,
        body: seoulCityHall,
    });

    // ==== Example 1: Using LocationMessageFactory for simple location ====
    // Uncomment to use:
    /*
    const simpleLocation = LocationMessageFactory.createSimpleLocation(37.5665, 126.9780);
    await whatsapp.messages.location({
        to: message.from,
        body: simpleLocation
    });
    */

    // ==== Example 2: Multiple locations using factory methods ====
    // Uncomment to use:
    /*
    // First location using named location factory
    const gangnamStation = LocationMessageFactory.createNamedLocation(
        37.5172,
        127.0473,
        "Gangnam Station",
        "Gangnam-gu, Seoul"
    );
    
    await whatsapp.messages.location({
        to: message.from,
        body: gangnamStation
    });
    
    // Second location using business location factory
    const namsanTower = LocationMessageFactory.createBusinessLocation(
        37.5512,
        126.9882,
        "Namsan Tower",
        "105 Namsangongwon-gil, Yongsan-gu, Seoul"
    );

    await whatsapp.messages.location({
        to: message.from,
        body: namsanTower
    });
    */
});

// Handle location messages
bot.processor.onMessage(MessageTypesEnum.Location, async (whatsapp, message) => {
    const lat = message.location?.latitude;
    const lon = message.location?.longitude;

    console.log(`Received location: ${lat}, ${lon} from ${message.from}`);

    await whatsapp.messages.text({
        to: message.from,
        body: `Thanks for sharing your location!\nCoordinates: ${lat}, ${lon}`,
    });

    // ==== Example: Send nearby location using builder ====
    // Uncomment to use:
    /*
    const nearbyLocation = new LocationMessageBuilder()
        .setCoordinates(lat! + 0.01, lon! + 0.01)
        .setName("Nearby Location")
        .setAddress("About 1km from your location")
        .build();

    await whatsapp.messages.location({
        to: message.from,
        body: nearbyLocation
    });
    */
});

// Setup webhook endpoints
app.get('/webhook', bot.webhook);
app.post('/webhook', express.json(), bot.webhook);

// Homepage
app.get('/', (req, res) => res.send('WhatsApp Location Message Example is running!'));

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Location message example server running on port ${PORT}`);
    console.log('Features:');
    console.log('- Active: Send location using LocationMessageBuilder');
    console.log('- Active: Reply when location received');
    console.log('- Available: LocationMessageFactory examples');
});
