import 'dotenv/config';
import express from 'express';
import { MessageTypesEnum } from 'meta-cloud-api';
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

    const text = message.text?.body?.toLowerCase() || '';

    // ==== ACTIVE: Send different media based on text ====
    if (text.includes('image') || text.includes('photo')) {
        await whatsapp.messages.image({
            to: message.from,
            body: {
                link: 'https://picsum.photos/400/300',
                caption: "Here's a random image for you! 📸",
            },
        });
    } else if (text.includes('video')) {
        await whatsapp.messages.video({
            to: message.from,
            body: {
                link: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
                caption: 'Check out this video! 🎥',
            },
        });
    } else if (text.includes('document') || text.includes('pdf')) {
        await whatsapp.messages.document({
            to: message.from,
            body: {
                link: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                caption: "Here's a sample document 📄",
                filename: 'sample.pdf',
            },
        });
    } else if (text.includes('audio')) {
        await whatsapp.messages.audio({
            to: message.from,
            body: {
                link: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            },
        });
    } else {
        // Default: send instructions
        await whatsapp.messages.text({
            to: message.from,
            body: "Send me a message with:\n• 'image' for a photo\n• 'video' for a video\n• 'document' for a PDF\n• 'audio' for audio",
        });
    }

    // ==== Example 1: Multiple images ====
    // Uncomment to use:
    /*
    await whatsapp.messages.image({
        to: message.from,
        body: {
            link: "https://picsum.photos/400/300?random=1",
            caption: "First image"
        }
    });
    
    await whatsapp.messages.image({
        to: message.from,
        body: {
            link: "https://picsum.photos/400/300?random=2",
            caption: "Second image"
        }
    });
    */

    // ==== Example 2: Sticker (WebP format) ====
    // Uncomment to use:
    /*
    await whatsapp.messages.sticker({
        to: message.from,
        body: {
            link: "https://example.com/sticker.webp"
        }
    });
    */
});

// Handle image messages
bot.processor.onMessage(MessageTypesEnum.Image, async (whatsapp, message) => {
    console.log(`Received image from ${message.from}`);
    await whatsapp.messages.text({
        to: message.from,
        body: 'Nice image! I received your photo. 📸',
    });
});

// Handle video messages
bot.processor.onMessage(MessageTypesEnum.Video, async (whatsapp, message) => {
    console.log(`Received video from ${message.from}`);
    await whatsapp.messages.text({
        to: message.from,
        body: 'Great video! Thanks for sharing. 🎥',
    });
});

// Handle audio messages
bot.processor.onMessage(MessageTypesEnum.Audio, async (whatsapp, message) => {
    console.log(`Received audio from ${message.from}`);
    await whatsapp.messages.text({
        to: message.from,
        body: 'I received your audio message. 🎵',
    });
});

// Handle document messages
bot.processor.onMessage(MessageTypesEnum.Document, async (whatsapp, message) => {
    console.log(`Received document from ${message.from}`);
    await whatsapp.messages.text({
        to: message.from,
        body: `Document received: ${message.document?.filename || 'Unknown'} 📄`,
    });
});

// Setup webhook endpoints
app.get('/webhook', bot.webhook);
app.post('/webhook', express.json(), bot.webhook);

// Homepage
app.get('/', (req, res) => res.send('WhatsApp Media Message Example is running!'));

// Start server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Media message example server running on port ${PORT}`);
    console.log('Features:');
    console.log('- Active: Send media based on keywords (image, video, document, audio)');
    console.log('- Active: Respond to received media');
    console.log('- Available: Multiple images, stickers');
});
