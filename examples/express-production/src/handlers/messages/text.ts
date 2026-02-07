import { TextMessage } from 'meta-cloud-api/webhook';
import { logger } from '@config/logger.js';
import { SessionStore } from '@services/conversation/sessionStore.js';
import { ConversationFlows } from '@services/conversation/flows.js';
import { ConversationState } from '@prisma/client';

/**
 * Text message handler
 * Processes incoming text messages based on conversation state
 */
export async function handleTextMessage(message: TextMessage): Promise<void> {
    try {
        const userId = message.from;
        const text = message.text.body.trim();

        logger.info('Processing text message', {
            userId,
            messageId: message.id,
            textLength: text.length,
        });

        // Get current session
        const session = await SessionStore.getOrCreate(userId);

        // Update message count
        await SessionStore.update(userId, {
            messageCount: session.messageCount + 1,
        });

        // Handle common commands regardless of state
        const lowerText = text.toLowerCase();

        if (lowerText === 'hi' || lowerText === 'hello' || lowerText === 'hey' || lowerText === 'start') {
            await ConversationFlows.start(userId);
            return;
        }

        if (lowerText === 'status' || lowerText === 'check status' || lowerText === 'my tickets') {
            await ConversationFlows.handleCheckStatus(userId);
            return;
        }

        if (lowerText === 'cancel' || lowerText === 'stop' || lowerText === 'reset') {
            await ConversationFlows.cancel(userId);
            return;
        }

        // Handle state-specific text input
        switch (session.state) {
            case ConversationState.IDLE:
                // User is idle, prompt them to start
                await ConversationFlows.start(userId);
                break;

            case ConversationState.COLLECTING_NAME:
                // Collecting user's name
                await ConversationFlows.handleNameInput(userId, text);
                break;

            case ConversationState.COLLECTING_ISSUE:
                // Collecting issue description
                await ConversationFlows.handleIssueInput(userId, text);
                break;

            case ConversationState.SELECTING_CATEGORY:
                // User should use the list menu, but handle text fallback
                logger.warn('Received text during category selection', { userId });
                await MessageTemplates.sendText(userId, 'Please select a category from the list above.');
                break;

            case ConversationState.CONFIRMING_TICKET:
                // User should use buttons, but handle text fallback
                logger.warn('Received text during ticket confirmation', { userId });
                await MessageTemplates.sendText(userId, 'Please use the buttons above to confirm or cancel.');
                break;

            case ConversationState.COMPLETED:
            case ConversationState.CANCELLED:
                // Conversation ended, restart
                await ConversationFlows.start(userId);
                break;

            default:
                logger.warn('Unknown conversation state', {
                    userId,
                    state: session.state,
                });
                await ConversationFlows.reset(userId);
                await ConversationFlows.start(userId);
        }
    } catch (error) {
        logger.error('Error handling text message', {
            messageId: message.id,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

// Import MessageTemplates for fallback responses
import { MessageTemplates } from '@services/whatsapp/templates.js';
