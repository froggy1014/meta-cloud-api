import express from 'express';
import WhatsApp from '../../src';
import { PORT, VERIFY_TOKEN, WEBHOOK_PATH } from './config';
import { setupWebhooks } from './webhooks';

export function createServer(whatsapp: WhatsApp): express.Application {
    const app = express();

    // Middleware
    app.use(express.json());

    // Set up webhook routes
    app.use('/', setupWebhooks(whatsapp));

    // Add a simple homepage
    app.get('/', (req, res) => {
        res.send(`
        <h1>WhatsApp Webhook Server</h1>
        <p>Your webhook is running at ${req.protocol}://${req.get('host')}${WEBHOOK_PATH}</p>
        <p>For local development:</p>
        <ol>
          <li>Install ngrok: <code>npm install -g ngrok</code> or from <a href="https://ngrok.com/download">ngrok.com/download</a></li>
          <li>Start ngrok: <code>ngrok http ${PORT}</code></li>
          <li>Use the ngrok URL (e.g., <code>https://your-subdomain.ngrok.io</code>) as your webhook URL in the Meta Developer Portal</li>
          <li>Set your verify token to match the VERIFY_TOKEN in your .env file</li>
        </ol>
      `);
    });

    return app;
}

export function startServer(app: express.Application) {
    app.listen(PORT, () => {
        console.log(`
========================================================
WhatsApp Webhook Server running on port ${PORT}
--------------------------------------------------------
Webhook path: ${WEBHOOK_PATH}
Verify token: ${VERIFY_TOKEN.substring(0, 3)}...${VERIFY_TOKEN.substring(VERIFY_TOKEN.length - 3)}
========================================================

To expose this server to the internet:
1. Install ngrok (if not already installed)
   npm install -g ngrok
   or download from https://ngrok.com/download

2. In a new terminal, run:
   ngrok http ${PORT}

3. Copy the HTTPS URL provided by ngrok (e.g., https://abc123.ngrok.io)

4. Set this URL as your webhook URL in the Meta Developer Portal
   URL: https://your-ngrok-url${WEBHOOK_PATH}
   Verify token: ${VERIFY_TOKEN}

5. Test your webhook by sending a message to your WhatsApp number
  `);
    });
}
