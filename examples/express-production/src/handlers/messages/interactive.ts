import { logger } from '@config/logger.js';
import { ConversationState } from '@prisma/client';
import { ConversationFlows } from '@services/conversation/flows.js';
import { SessionStore } from '@services/conversation/sessionStore.js';
import type { InteractiveMessage } from 'meta-cloud-api/webhook';

/**
 * Interactive message handler
 * Processes button and list interactions
 */
export async function handleInteractiveMessage(message: InteractiveMessage): Promise<void> {
    try {
        const userId = message.from;
        const interactiveType = message.interactive.type;

        logger.info('Processing interactive message', {
            userId,
            messageId: message.id,
            type: interactiveType,
        });

        // Get current session
        const session = await SessionStore.getOrCreate(userId);

        // Update message count
        await SessionStore.update(userId, {
            messageCount: session.messageCount + 1,
        });

        // Handle button reply
        if (interactiveType === 'button_reply') {
            const buttonId = message.interactive.button_reply?.id;

            if (!buttonId) {
                logger.warn('Button reply without ID', { userId });
                return;
            }

            await handleButtonClick(userId, buttonId, session.state);
        }

        // Handle list reply
        else if (interactiveType === 'list_reply') {
            const listId = message.interactive.list_reply?.id;

            if (!listId) {
                logger.warn('List reply without ID', { userId });
                return;
            }

            await handleListSelection(userId, listId, session.state);
        }

        // Handle other interactive types
        else {
            logger.warn('Unsupported interactive type', {
                userId,
                type: interactiveType,
            });
        }
    } catch (error) {
        logger.error('Error handling interactive message', {
            messageId: message.id,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

/**
 * Handle button click
 */
async function handleButtonClick(userId: string, buttonId: string, state: ConversationState): Promise<void> {
    logger.debug('Button clicked', { userId, buttonId, state });

    switch (buttonId) {
        case 'new_issue':
            await ConversationFlows.handleNewIssue(userId);
            break;

        case 'check_status':
            await ConversationFlows.handleCheckStatus(userId);
            break;

        case 'confirm_ticket':
            await ConversationFlows.handleTicketConfirmation(userId, true);
            break;

        case 'cancel_ticket':
            await ConversationFlows.handleTicketConfirmation(userId, false);
            break;

        default:
            logger.warn('Unknown button ID', { userId, buttonId });
            await ConversationFlows.start(userId);
    }
}

/**
 * Handle list selection
 */
async function handleListSelection(userId: string, listId: string, state: ConversationState): Promise<void> {
    logger.debug('List item selected', { userId, listId, state });

    // Category selection
    if (state === ConversationState.SELECTING_CATEGORY) {
        await ConversationFlows.handleCategorySelection(userId, listId);
    }

    // Unknown list selection
    else {
        logger.warn('Unexpected list selection', { userId, listId, state });
        await ConversationFlows.start(userId);
    }
}
