import type { WhatsApp } from 'meta-cloud-api';

/**
 * Send a reaction to a message
 * Can be used to react with emoji to any message
 */
export const sendReactionMessage = async (whatsapp: WhatsApp, to: string, messageId: string) => {
    await whatsapp.messages.reaction({
        to,
        messageId,
        emoji: '👍',
    });

    console.log(`✅ Reaction sent to message ${messageId}`);
};
