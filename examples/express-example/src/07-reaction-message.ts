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

// Store recent message IDs for reactions
const recentMessages = new Map<string, string>();

// Handle text messages
bot.processor.onMessage(MessageTypesEnum.Text, async (whatsapp, message) => {
    console.log(`Received message: "${message.text?.body}" from ${message.from}`);

    // Mark message as read
    await whatsapp.messages.markAsRead({ messageId: message.id });

    // Store message ID for potential reactions
    recentMessages.set(message.from, message.id);

    const text = message.text?.body?.toLowerCase() || '';

    // ==== ACTIVE: React to messages based on content ====
    let emoji = '👍'; // Default

    if (text.includes('love') || text.includes('amazing')) {
        emoji = '❤️';
    } else if (text.includes('funny') || text.includes('lol')) {
        emoji = '😂';
    } else if (text.includes('sad') || text.includes('sorry')) {
        emoji = '😢';
    } else if (text.includes('wow')) {
        emoji = '😮';
    }

    // Send reaction
    await whatsapp.messages.reaction({
        to: message.from,
        messageId: message.id,
        emoji: emoji,
    });

    // Send instructions
    await whatsapp.messages.text({
        to: message.from,
        body: "I reacted to your message! Try sending:\n• 'love' for ❤️\n• 'funny' for 😂\n• 'sad' for 😢\n• 'wow' for 😮\n• anything else for 👍",
    });

    // ==== Example 1: Using ReactionMessageBuilder ====
    // Uncomment to use:
    /*
    const reaction = new ReactionMessageBuilder()
        .setMessageId(message.id)
        .setEmoji("🎉")
        .build();
    
    await whatsapp.messages.reaction({
        to: message.from,
        messageId: reaction.message_id,
        emoji: reaction.emoji
    });
    */

    // ==== Example 2: Using ReactionMessageFactory ====
    // Uncomment to use:
    /*
    const heartReaction = ReactionMessageFactory.createHeart(message.id);
    await whatsapp.messages.reaction({
        to: message.from,
        messageId: heartReaction.message_id,
        emoji: heartReaction.emoji
    });
    */

    // ==== Example 3: Remove reaction after 5 seconds ====
    // Uncomment to remove reaction after delay:
    /*
    setTimeout(async () => {
        const removeReaction = ReactionMessageFactory.removeReaction(message.id);
        await whatsapp.messages.reaction({
            to: message.from,
            messageId: removeReaction.message_id,
            emoji: removeReaction.emoji
        });
    }, 5000);
    */
});

// Handle reaction messages
bot.processor.onMessage(MessageTypesEnum.Reaction, async (whatsapp, message) => {
    const emoji = message.reaction?.emoji;
    const reactedMessageId = message.reaction?.message_id;

    console.log(`Received reaction ${emoji} from ${message.from}`);

    await whatsapp.messages.text({
        to: message.from,
        body: `You reacted with ${emoji} to message!`,
        replyMessageId: reactedMessageId,
    });
});

// Setup webhook endpoints
app.get('/webhook', bot.webhook);
app.post('/webhook', express.json(), bot.webhook);

// Homepage
app.get('/', (req, res) => res.send('WhatsApp Reaction Message Example is running!'));

// Start server
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`Reaction message example server running on port ${PORT}`);
    console.log('Features:');
    console.log('- Active: React to messages based on keywords');
    console.log('- Active: Handle received reactions');
    console.log('- Available: Remove reactions');
});
