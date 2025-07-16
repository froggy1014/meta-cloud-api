/**
 * Builder class for creating reaction messages with a fluent API
 */
export class ReactionMessageBuilder {
    private reaction: { message_id?: string; emoji?: string } = {};

    /**
     * Set the message ID to react to
     */
    setMessageId(messageId: string): this {
        if (!messageId || typeof messageId !== 'string') {
            throw new Error('Message ID must be a non-empty string');
        }
        this.reaction.message_id = messageId;
        return this;
    }

    /**
     * Set the emoji for the reaction
     */
    setEmoji(emoji: string): this {
        if (!emoji || typeof emoji !== 'string') {
            throw new Error('Emoji must be a non-empty string');
        }
        // Validate that it's a single emoji (basic check)
        if (emoji.length > 4) {
            throw new Error('Please provide a single emoji character');
        }
        this.reaction.emoji = emoji;
        return this;
    }

    /**
     * Remove a reaction (by sending empty emoji)
     */
    removeReaction(): this {
        this.reaction.emoji = '';
        return this;
    }

    /**
     * Build the final reaction object
     */
    build(): { message_id: string; emoji: string } {
        if (!this.reaction.message_id) {
            throw new Error('Message ID is required');
        }
        if (this.reaction.emoji === undefined) {
            throw new Error('Emoji is required (use empty string to remove reaction)');
        }

        return this.reaction as { message_id: string; emoji: string };
    }

    /**
     * Reset the builder for reuse
     */
    reset(): this {
        this.reaction = {};
        return this;
    }
}

/**
 * Factory class for common reaction patterns
 */
export class ReactionMessageFactory {
    /**
     * Create a like reaction
     */
    static createLike(messageId: string): { message_id: string; emoji: string } {
        return new ReactionMessageBuilder().setMessageId(messageId).setEmoji('👍').build();
    }

    /**
     * Create a heart reaction
     */
    static createHeart(messageId: string): { message_id: string; emoji: string } {
        return new ReactionMessageBuilder().setMessageId(messageId).setEmoji('❤️').build();
    }

    /**
     * Create a laughing reaction
     */
    static createLaugh(messageId: string): { message_id: string; emoji: string } {
        return new ReactionMessageBuilder().setMessageId(messageId).setEmoji('😂').build();
    }

    /**
     * Create a wow reaction
     */
    static createWow(messageId: string): { message_id: string; emoji: string } {
        return new ReactionMessageBuilder().setMessageId(messageId).setEmoji('😮').build();
    }

    /**
     * Create a sad reaction
     */
    static createSad(messageId: string): { message_id: string; emoji: string } {
        return new ReactionMessageBuilder().setMessageId(messageId).setEmoji('😢').build();
    }

    /**
     * Create an angry reaction
     */
    static createAngry(messageId: string): { message_id: string; emoji: string } {
        return new ReactionMessageBuilder().setMessageId(messageId).setEmoji('😠').build();
    }

    /**
     * Remove a reaction
     */
    static removeReaction(messageId: string): { message_id: string; emoji: string } {
        return new ReactionMessageBuilder().setMessageId(messageId).removeReaction().build();
    }
}
