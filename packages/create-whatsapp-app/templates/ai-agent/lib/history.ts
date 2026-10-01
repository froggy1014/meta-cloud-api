import type Anthropic from '@anthropic-ai/sdk';

/**
 * IN-MEMORY conversation history, one short list per WhatsApp user.
 *
 * Good for local dev and a single server only: it is lost on restart and not
 * shared between instances. Replace this file with Redis or a database before
 * you deploy more than one instance.
 */

/** User + assistant messages kept per customer (10 exchanges). */
export const MAX_HISTORY_MESSAGES = 20;

export interface History {
    get(user: string): Anthropic.Beta.BetaMessageParam[];
    /** Record one finished exchange. Stored in pairs so history always starts with a user turn. */
    append(user: string, userText: string, assistantText: string): void;
    clear(user: string): void;
}

export function createMemoryHistory(maxMessages = MAX_HISTORY_MESSAGES): History {
    const byUser = new Map<string, Anthropic.Beta.BetaMessageParam[]>();
    return {
        get: (user) => [...(byUser.get(user) ?? [])],
        append(user, userText, assistantText) {
            const turns = byUser.get(user) ?? [];
            turns.push({ role: 'user', content: userText }, { role: 'assistant', content: assistantText });
            // Drop the oldest pair(s); an even cap keeps the first turn a user turn.
            const cap = maxMessages - (maxMessages % 2);
            if (turns.length > cap) turns.splice(0, turns.length - cap);
            byUser.set(user, turns);
        },
        clear: (user) => {
            byUser.delete(user);
        },
    };
}

// Kept on globalThis so Next.js hot reload does not wipe conversations.
const g = globalThis as typeof globalThis & { __waAgentHistory?: History };
export const history: History = g.__waAgentHistory ?? createMemoryHistory();
g.__waAgentHistory = history;
