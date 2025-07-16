import type { WhatsApp } from 'meta-cloud-api';
import { ReactionMessageBuilder } from 'meta-cloud-api/api/messages/builders';

/**
 * Send a reaction to a message
 * Can be used to react with emoji to any message
 */
export const sendReactionMessage = async (whatsapp: WhatsApp, to: string, messageId: string) => {
    const reactionMessage = new ReactionMessageBuilder().setMessageId(messageId).setEmoji('👍').build();

    await whatsapp.messages.reaction({
        to,
        messageId,
        emoji: '👍',
    });

    console.log(`✅ Reaction sent to message ${messageId}`);
};
