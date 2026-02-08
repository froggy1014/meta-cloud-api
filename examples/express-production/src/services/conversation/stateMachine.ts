import { logger } from '@config/logger.js';
import { ConversationState } from '@prisma/client';

/**
 * Conversation state machine
 * Defines valid state transitions and validates state changes
 */

/**
 * Valid state transitions map
 * Each state can only transition to specific next states
 */
const STATE_TRANSITIONS: Record<ConversationState, ConversationState[]> = {
    IDLE: [ConversationState.COLLECTING_NAME, ConversationState.CANCELLED],
    COLLECTING_NAME: [ConversationState.COLLECTING_ISSUE, ConversationState.CANCELLED, ConversationState.IDLE],
    COLLECTING_ISSUE: [ConversationState.SELECTING_CATEGORY, ConversationState.CANCELLED, ConversationState.IDLE],
    SELECTING_CATEGORY: [ConversationState.CONFIRMING_TICKET, ConversationState.CANCELLED, ConversationState.IDLE],
    CONFIRMING_TICKET: [ConversationState.COMPLETED, ConversationState.CANCELLED, ConversationState.IDLE],
    COMPLETED: [ConversationState.IDLE],
    CANCELLED: [ConversationState.IDLE],
};

/**
 * State descriptions for logging
 */
const STATE_DESCRIPTIONS: Record<ConversationState, string> = {
    IDLE: 'No active conversation',
    COLLECTING_NAME: 'Collecting user name',
    COLLECTING_ISSUE: 'Collecting issue description',
    SELECTING_CATEGORY: 'User selecting category',
    CONFIRMING_TICKET: 'Confirming ticket creation',
    COMPLETED: 'Ticket created successfully',
    CANCELLED: 'Conversation cancelled',
};

/**
 * State machine class
 * Manages conversation state transitions
 */
export class ConversationStateMachine {
    /**
     * Validate if a state transition is allowed
     */
    static canTransition(currentState: ConversationState, nextState: ConversationState): boolean {
        const allowedTransitions = STATE_TRANSITIONS[currentState];
        return allowedTransitions.includes(nextState);
    }

    /**
     * Transition to a new state
     * Throws an error if the transition is invalid
     */
    static transition(
        userId: string,
        currentState: ConversationState,
        nextState: ConversationState,
    ): ConversationState {
        if (!ConversationStateMachine.canTransition(currentState, nextState)) {
            logger.error('Invalid state transition', {
                userId,
                currentState,
                nextState,
                allowedTransitions: STATE_TRANSITIONS[currentState],
            });

            throw new Error(`Invalid state transition from ${currentState} to ${nextState}`);
        }

        logger.debug('State transition', {
            userId,
            from: currentState,
            to: nextState,
            description: STATE_DESCRIPTIONS[nextState],
        });

        return nextState;
    }

    /**
     * Get allowed transitions for a state
     */
    static getAllowedTransitions(state: ConversationState): ConversationState[] {
        return STATE_TRANSITIONS[state];
    }

    /**
     * Get state description
     */
    static getStateDescription(state: ConversationState): string {
        return STATE_DESCRIPTIONS[state];
    }

    /**
     * Check if state is terminal (conversation ended)
     */
    static isTerminalState(state: ConversationState): boolean {
        return state === ConversationState.COMPLETED || state === ConversationState.CANCELLED;
    }

    /**
     * Check if state requires user input
     */
    static requiresUserInput(state: ConversationState): boolean {
        return (
            state === ConversationState.COLLECTING_NAME ||
            state === ConversationState.COLLECTING_ISSUE ||
            state === ConversationState.SELECTING_CATEGORY ||
            state === ConversationState.CONFIRMING_TICKET
        );
    }

    /**
     * Get next expected input type for a state
     */
    static getExpectedInputType(state: ConversationState): 'text' | 'button' | 'list' | null {
        switch (state) {
            case ConversationState.COLLECTING_NAME:
                return 'text';
            case ConversationState.COLLECTING_ISSUE:
                return 'text';
            case ConversationState.SELECTING_CATEGORY:
                return 'list';
            case ConversationState.CONFIRMING_TICKET:
                return 'button';
            default:
                return null;
        }
    }

    /**
     * Reset conversation to idle state
     */
    static reset(): ConversationState {
        return ConversationState.IDLE;
    }
}
