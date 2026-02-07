import { ConversationState } from '@prisma/client';

/**
 * Conversation-related type definitions
 */

export interface ConversationContext {
    userId: string;
    state: ConversationState;
    userName?: string;
    issue?: string;
    category?: string;
    lastMessageAt: number;
    messageCount: number;
}

export interface StateTransition {
    from: ConversationState;
    to: ConversationState;
    timestamp: number;
    trigger?: string;
}

export interface ConversationHistory {
    userId: string;
    transitions: StateTransition[];
    messages: Array<{
        timestamp: number;
        type: 'incoming' | 'outgoing';
        content: string;
    }>;
}
