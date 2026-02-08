import { ConversationState } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { ConversationStateMachine } from '../../../src/services/conversation/stateMachine.js';

describe('ConversationStateMachine', () => {
    describe('canTransition', () => {
        it('should allow valid transitions', () => {
            expect(
                ConversationStateMachine.canTransition(ConversationState.IDLE, ConversationState.COLLECTING_NAME),
            ).toBe(true);

            expect(
                ConversationStateMachine.canTransition(
                    ConversationState.COLLECTING_NAME,
                    ConversationState.COLLECTING_ISSUE,
                ),
            ).toBe(true);

            expect(
                ConversationStateMachine.canTransition(
                    ConversationState.COLLECTING_ISSUE,
                    ConversationState.SELECTING_CATEGORY,
                ),
            ).toBe(true);
        });

        it('should reject invalid transitions', () => {
            expect(ConversationStateMachine.canTransition(ConversationState.IDLE, ConversationState.COMPLETED)).toBe(
                false,
            );

            expect(
                ConversationStateMachine.canTransition(
                    ConversationState.COLLECTING_NAME,
                    ConversationState.CONFIRMING_TICKET,
                ),
            ).toBe(false);
        });

        it('should allow cancellation from any state', () => {
            expect(
                ConversationStateMachine.canTransition(ConversationState.COLLECTING_NAME, ConversationState.CANCELLED),
            ).toBe(true);

            expect(
                ConversationStateMachine.canTransition(ConversationState.COLLECTING_ISSUE, ConversationState.CANCELLED),
            ).toBe(true);

            expect(
                ConversationStateMachine.canTransition(
                    ConversationState.SELECTING_CATEGORY,
                    ConversationState.CANCELLED,
                ),
            ).toBe(true);
        });

        it('should allow reset to IDLE from terminal states', () => {
            expect(ConversationStateMachine.canTransition(ConversationState.COMPLETED, ConversationState.IDLE)).toBe(
                true,
            );

            expect(ConversationStateMachine.canTransition(ConversationState.CANCELLED, ConversationState.IDLE)).toBe(
                true,
            );
        });
    });

    describe('transition', () => {
        it('should transition to valid states', () => {
            const nextState = ConversationStateMachine.transition(
                'user123',
                ConversationState.IDLE,
                ConversationState.COLLECTING_NAME,
            );

            expect(nextState).toBe(ConversationState.COLLECTING_NAME);
        });

        it('should throw error for invalid transitions', () => {
            expect(() => {
                ConversationStateMachine.transition('user123', ConversationState.IDLE, ConversationState.COMPLETED);
            }).toThrow('Invalid state transition');
        });
    });

    describe('isTerminalState', () => {
        it('should identify terminal states', () => {
            expect(ConversationStateMachine.isTerminalState(ConversationState.COMPLETED)).toBe(true);

            expect(ConversationStateMachine.isTerminalState(ConversationState.CANCELLED)).toBe(true);
        });

        it('should identify non-terminal states', () => {
            expect(ConversationStateMachine.isTerminalState(ConversationState.IDLE)).toBe(false);

            expect(ConversationStateMachine.isTerminalState(ConversationState.COLLECTING_NAME)).toBe(false);
        });
    });

    describe('requiresUserInput', () => {
        it('should identify states requiring input', () => {
            expect(ConversationStateMachine.requiresUserInput(ConversationState.COLLECTING_NAME)).toBe(true);

            expect(ConversationStateMachine.requiresUserInput(ConversationState.COLLECTING_ISSUE)).toBe(true);

            expect(ConversationStateMachine.requiresUserInput(ConversationState.SELECTING_CATEGORY)).toBe(true);

            expect(ConversationStateMachine.requiresUserInput(ConversationState.CONFIRMING_TICKET)).toBe(true);
        });

        it('should identify states not requiring input', () => {
            expect(ConversationStateMachine.requiresUserInput(ConversationState.IDLE)).toBe(false);

            expect(ConversationStateMachine.requiresUserInput(ConversationState.COMPLETED)).toBe(false);
        });
    });

    describe('getExpectedInputType', () => {
        it('should return correct input type for each state', () => {
            expect(ConversationStateMachine.getExpectedInputType(ConversationState.COLLECTING_NAME)).toBe('text');

            expect(ConversationStateMachine.getExpectedInputType(ConversationState.COLLECTING_ISSUE)).toBe('text');

            expect(ConversationStateMachine.getExpectedInputType(ConversationState.SELECTING_CATEGORY)).toBe('list');

            expect(ConversationStateMachine.getExpectedInputType(ConversationState.CONFIRMING_TICKET)).toBe('button');

            expect(ConversationStateMachine.getExpectedInputType(ConversationState.IDLE)).toBeNull();
        });
    });

    describe('getAllowedTransitions', () => {
        it('should return all allowed transitions for a state', () => {
            const transitions = ConversationStateMachine.getAllowedTransitions(ConversationState.IDLE);

            expect(transitions).toContain(ConversationState.COLLECTING_NAME);
            expect(transitions).toContain(ConversationState.CANCELLED);
        });
    });

    describe('getStateDescription', () => {
        it('should return description for each state', () => {
            expect(ConversationStateMachine.getStateDescription(ConversationState.IDLE)).toBe('No active conversation');

            expect(ConversationStateMachine.getStateDescription(ConversationState.COLLECTING_NAME)).toBe(
                'Collecting user name',
            );
        });
    });
});
