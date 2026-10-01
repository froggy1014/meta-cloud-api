import type Anthropic from '@anthropic-ai/sdk';
import { describe, expect, it, vi } from 'vitest';
import {
    type CreateMessage,
    createAgent,
    DEFAULT_MODEL,
    EMPTY_REPLY,
    echoReply,
    nonTextReply,
    REFUSAL_REPLY,
    WHATSAPP_TEXT_LIMIT,
} from '../lib/agent';
import { createMemoryHistory } from '../lib/history';

/** A fake Claude response with the fields the agent reads. */
function message(
    text: string,
    stop_reason: Anthropic.Beta.Messages.BetaMessage['stop_reason'] = 'end_turn',
): Anthropic.Beta.Messages.BetaMessage {
    return {
        content: text ? [{ type: 'text', text, citations: null }] : [],
        stop_reason,
    } as unknown as Anthropic.Beta.Messages.BetaMessage;
}

function setup(
    reply: (params: Anthropic.Beta.Messages.MessageCreateParamsNonStreaming) => string,
    model = DEFAULT_MODEL,
) {
    const createMessage = vi.fn<CreateMessage>(async (params) => message(reply(params)));
    const history = createMemoryHistory(4);
    const agent = createAgent({ createMessage, model, systemPrompt: 'Be nice.', history });
    return { agent, createMessage, history };
}

describe('ai agent', () => {
    it('echoes deterministically when no Claude client is configured', async () => {
        const agent = createAgent({
            createMessage: null,
            model: DEFAULT_MODEL,
            systemPrompt: 'x',
            history: createMemoryHistory(),
        });
        expect(await agent.reply('1555', 'hello')).toBe(echoReply('hello'));
        expect(echoReply('hello')).toMatch(/^Echo: hello/);
    });

    it('sends the system prompt, the history, and the new text to Claude', async () => {
        const { agent, createMessage } = setup(() => 'Hi there!');
        expect(await agent.reply('1555', 'hello')).toBe('Hi there!');
        expect(await agent.reply('1555', 'again')).toBe('Hi there!');

        const params = createMessage.mock.calls[1]?.[0];
        expect(params?.model).toBe(DEFAULT_MODEL);
        expect(params?.system).toBe('Be nice.');
        expect(params?.messages).toEqual([
            { role: 'user', content: 'hello' },
            { role: 'assistant', content: 'Hi there!' },
            { role: 'user', content: 'again' },
        ]);
        expect(params?.output_config).toEqual({ effort: 'low' });
        expect(params?.fallbacks).toBe('default');
    });

    it('keeps history per user and trims the oldest exchanges', async () => {
        const { agent, history } = setup((params) => `re: ${params.messages.at(-1)?.content}`);
        await agent.reply('a', '1');
        await agent.reply('b', 'other user');
        await agent.reply('a', '2');
        await agent.reply('a', '3');

        expect(history.get('a')).toEqual([
            { role: 'user', content: '2' },
            { role: 'assistant', content: 're: 2' },
            { role: 'user', content: '3' },
            { role: 'assistant', content: 're: 3' },
        ]);
        expect(history.get('b')).toHaveLength(2);
    });

    it('omits model-specific tuning for an overridden model', async () => {
        const { agent, createMessage } = setup(() => 'ok', 'claude-haiku-4-5');
        await agent.reply('1555', 'hello');
        const params = createMessage.mock.calls[0]?.[0];
        expect(params?.model).toBe('claude-haiku-4-5');
        expect(params?.output_config).toBeUndefined();
        expect(params?.fallbacks).toBeUndefined();
    });

    it('answers politely on a refusal and does not store it', async () => {
        const createMessage = vi.fn<CreateMessage>(async () => message('', 'refusal'));
        const history = createMemoryHistory();
        const agent = createAgent({ createMessage, model: DEFAULT_MODEL, systemPrompt: 'x', history });
        expect(await agent.reply('1555', 'bad')).toBe(REFUSAL_REPLY);
        expect(history.get('1555')).toEqual([]);
    });

    it('handles empty and oversized replies', async () => {
        expect(await setup(() => '').agent.reply('1555', 'hi')).toBe(EMPTY_REPLY);
        const long = await setup(() => 'x'.repeat(WHATSAPP_TEXT_LIMIT + 100)).agent.reply('1555', 'hi');
        expect(long).toHaveLength(WHATSAPP_TEXT_LIMIT);
    });

    it('replies politely to non-text messages', () => {
        expect(nonTextReply('image')).toContain('photo');
        expect(nonTextReply('audio')).toContain('voice message');
        expect(nonTextReply('interactive')).toContain('only read text');
    });
});
