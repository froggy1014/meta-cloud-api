import { ConversationState } from '@prisma/client';
import { SessionStore, SessionData } from './sessionStore.js';
import { ConversationStateMachine } from './stateMachine.js';
import { MessageTemplates } from '@services/whatsapp/templates.js';
import { logger } from '@config/logger.js';
import { prisma } from '@config/database.js';

/**
 * Conversation flow manager
 * Handles conversation state transitions and user interactions
 */
export class ConversationFlows {
    /**
     * Start a new conversation
     */
    static async start(userId: string): Promise<void> {
        try {
            // Get or create session
            const session = await SessionStore.getOrCreate(userId);

            // If already in a conversation, reset to idle first
            if (session.state !== ConversationState.IDLE) {
                logger.info('Resetting existing conversation', { userId, currentState: session.state });
                await this.reset(userId);
            }

            // Send welcome message
            await MessageTemplates.sendWelcome(userId);

            logger.info('Conversation started', { userId });
        } catch (error) {
            logger.error('Failed to start conversation', {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });

            await MessageTemplates.sendError(userId);
        }
    }

    /**
     * Handle new issue button click
     */
    static async handleNewIssue(userId: string): Promise<void> {
        try {
            const session = await SessionStore.getOrCreate(userId);

            // Transition to collecting name
            const nextState = ConversationStateMachine.transition(
                userId,
                session.state,
                ConversationState.COLLECTING_NAME,
            );

            await SessionStore.update(userId, { state: nextState });

            // Ask for name
            await MessageTemplates.askForName(userId);

            logger.info('New issue flow started', { userId });
        } catch (error) {
            logger.error('Failed to handle new issue', {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });

            await MessageTemplates.sendError(userId);
        }
    }

    /**
     * Handle name input
     */
    static async handleNameInput(userId: string, name: string): Promise<void> {
        try {
            const session = await SessionStore.get(userId);

            if (!session || session.state !== ConversationState.COLLECTING_NAME) {
                logger.warn('Invalid state for name input', { userId, state: session?.state });
                await this.start(userId);
                return;
            }

            // Validate name
            if (!name || name.trim().length < 2) {
                await MessageTemplates.sendText(userId, 'Please provide a valid name (at least 2 characters).');
                return;
            }

            // Transition to collecting issue
            const nextState = ConversationStateMachine.transition(
                userId,
                session.state,
                ConversationState.COLLECTING_ISSUE,
            );

            await SessionStore.update(userId, {
                state: nextState,
                userName: name.trim(),
            });

            // Ask for issue description
            await MessageTemplates.askForIssue(userId, name.trim());

            logger.info('Name collected', { userId, name: name.trim() });
        } catch (error) {
            logger.error('Failed to handle name input', {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });

            await MessageTemplates.sendError(userId);
        }
    }

    /**
     * Handle issue description input
     */
    static async handleIssueInput(userId: string, issue: string): Promise<void> {
        try {
            const session = await SessionStore.get(userId);

            if (!session || session.state !== ConversationState.COLLECTING_ISSUE) {
                logger.warn('Invalid state for issue input', { userId, state: session?.state });
                await this.start(userId);
                return;
            }

            // Validate issue
            if (!issue || issue.trim().length < 10) {
                await MessageTemplates.sendText(
                    userId,
                    'Please provide more details about your issue (at least 10 characters).',
                );
                return;
            }

            // Transition to selecting category
            const nextState = ConversationStateMachine.transition(
                userId,
                session.state,
                ConversationState.SELECTING_CATEGORY,
            );

            await SessionStore.update(userId, {
                state: nextState,
                issue: issue.trim(),
            });

            // Show category selection
            await MessageTemplates.showCategories(userId);

            logger.info('Issue collected', { userId, issueLength: issue.length });
        } catch (error) {
            logger.error('Failed to handle issue input', {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });

            await MessageTemplates.sendError(userId);
        }
    }

    /**
     * Handle category selection
     */
    static async handleCategorySelection(userId: string, category: string): Promise<void> {
        try {
            const session = await SessionStore.get(userId);

            if (!session || session.state !== ConversationState.SELECTING_CATEGORY) {
                logger.warn('Invalid state for category selection', { userId, state: session?.state });
                await this.start(userId);
                return;
            }

            // Validate category
            const validCategories = [
                'TECHNICAL_SUPPORT',
                'BILLING_PAYMENT',
                'ACCOUNT_ACCESS',
                'PRODUCT_INQUIRY',
                'FEATURE_REQUEST',
                'BUG_REPORT',
                'GENERAL_INQUIRY',
                'OTHER',
            ];

            if (!validCategories.includes(category)) {
                await MessageTemplates.sendText(userId, 'Invalid category selected. Please choose from the list.');
                await MessageTemplates.showCategories(userId);
                return;
            }

            // Transition to confirming ticket
            const nextState = ConversationStateMachine.transition(
                userId,
                session.state,
                ConversationState.CONFIRMING_TICKET,
            );

            await SessionStore.update(userId, {
                state: nextState,
                category,
            });

            // Show confirmation
            await MessageTemplates.showTicketConfirmation(userId, session.userName!, session.issue!, category);

            logger.info('Category selected', { userId, category });
        } catch (error) {
            logger.error('Failed to handle category selection', {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });

            await MessageTemplates.sendError(userId);
        }
    }

    /**
     * Handle ticket confirmation
     */
    static async handleTicketConfirmation(userId: string, confirmed: boolean): Promise<void> {
        try {
            const session = await SessionStore.get(userId);

            if (!session || session.state !== ConversationState.CONFIRMING_TICKET) {
                logger.warn('Invalid state for ticket confirmation', { userId, state: session?.state });
                await this.start(userId);
                return;
            }

            if (confirmed) {
                // Create ticket in database
                const ticketNumber = await this.createTicket(session);

                // Transition to completed
                const nextState = ConversationStateMachine.transition(
                    userId,
                    session.state,
                    ConversationState.COMPLETED,
                );

                await SessionStore.update(userId, { state: nextState });

                // Send confirmation
                await MessageTemplates.sendTicketCreated(userId, ticketNumber);

                // Clean up session after a delay
                setTimeout(async () => {
                    await this.reset(userId);
                }, 5000);

                logger.info('Ticket created', { userId, ticketNumber });
            } else {
                // Cancel ticket creation
                await this.cancel(userId);
            }
        } catch (error) {
            logger.error('Failed to handle ticket confirmation', {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });

            await MessageTemplates.sendError(userId);
        }
    }

    /**
     * Create ticket in database
     */
    private static async createTicket(session: SessionData): Promise<string> {
        // Generate ticket number
        const ticketCount = await prisma.ticket.count();
        const ticketNumber = `T-${String(ticketCount + 10001).padStart(5, '0')}`;

        // Create conversation record
        const conversation = await prisma.conversation.create({
            data: {
                userId: session.userId,
                state: session.state,
                userName: session.userName!,
                issue: session.issue!,
                category: session.category as any,
                messageCount: session.messageCount,
                context: session.context || {},
            },
        });

        // Create ticket
        await prisma.ticket.create({
            data: {
                ticketNumber,
                conversationId: conversation.id,
                userId: session.userId,
                userName: session.userName!,
                category: session.category as any,
                issue: session.issue!,
                status: 'OPEN',
                priority: 'MEDIUM',
            },
        });

        logger.info('Ticket created in database', {
            ticketNumber,
            userId: session.userId,
        });

        return ticketNumber;
    }

    /**
     * Cancel conversation
     */
    static async cancel(userId: string): Promise<void> {
        try {
            const session = await SessionStore.get(userId);

            if (session) {
                const nextState = ConversationStateMachine.transition(
                    userId,
                    session.state,
                    ConversationState.CANCELLED,
                );

                await SessionStore.update(userId, { state: nextState });
            }

            await MessageTemplates.sendCancellation(userId);

            // Reset after a delay
            setTimeout(async () => {
                await this.reset(userId);
            }, 3000);

            logger.info('Conversation cancelled', { userId });
        } catch (error) {
            logger.error('Failed to cancel conversation', {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }

    /**
     * Reset conversation to idle
     */
    static async reset(userId: string): Promise<void> {
        try {
            await SessionStore.update(userId, {
                state: ConversationState.IDLE,
                userName: undefined,
                issue: undefined,
                category: undefined,
                context: {},
            });

            logger.info('Conversation reset', { userId });
        } catch (error) {
            logger.error('Failed to reset conversation', {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }

    /**
     * Handle check status request
     */
    static async handleCheckStatus(userId: string): Promise<void> {
        try {
            // Get user tickets
            const tickets = await prisma.ticket.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 5,
            });

            await MessageTemplates.sendTicketStatus(userId, tickets);

            logger.info('Ticket status sent', { userId, count: tickets.length });
        } catch (error) {
            logger.error('Failed to handle check status', {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });

            await MessageTemplates.sendError(userId);
        }
    }
}
