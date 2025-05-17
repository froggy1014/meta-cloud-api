import WhatsApp from '../../src';
import { ACCESS_TOKEN, CALLBACK_URL, PHONE_NUMBER_ID } from './config';
import { createServer, startServer } from './server';

// Initialize WhatsApp client
const whatsapp = new WhatsApp({
    accessToken: ACCESS_TOKEN,
    phoneNumberId: PHONE_NUMBER_ID,
});

// Log the callback URL
console.log(`Using callback URL: ${CALLBACK_URL}`);
console.log('⚠️  Make sure to update CALLBACK_URL with your actual ngrok URL!');

// Create and start the server
const app = createServer(whatsapp);
startServer(app);
