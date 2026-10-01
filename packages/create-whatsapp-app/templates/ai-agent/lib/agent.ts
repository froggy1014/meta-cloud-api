import type Anthropic from '@anthropic-ai/sdk';
import type { History } from './history';

/** Current Claude Sonnet. Override with ANTHROPIC_MODEL in .env.local. */
export const DEFAULT_MODEL = 'claude-sonnet-5-5';

/** WhatsApp rejects text bodies longer than 4096 characters. */
export const WHATSAPP_TEXT_LIMIT = 4096;

/** The one Claude call the agent makes. `lib/claude.ts` wires the real SDK; tests pass a fake. */
export type CreateMessage = (
    params: Anthropic.Beta.Messages.MessageCreateParamsNonStreaming,
) => Promise<Anthropic.Beta.Messages.BetaMessage>;

export interface AgentOptions {
    /** `null` when ANTHROPIC_API_KEY is not set: the agent echoes instead of calling Claude. */
    createMessage: CreateMessage | null;
    model: string;
    systemPrompt: string;
    history: History;
}

export interface Agent {
    /** Reply to one incoming text from `user` (their WhatsApp ID). */
    reply(user: string, text: string): Promise<string>;
}

export const REFUSAL_REPLY = "Sorry, I can't help with that one. Is there something else I can do for you?";
export const EMPTY_REPLY = 'Sorry, I could not come up with a reply. Could you rephrase that?';

export function echoReply(text: string): string {
    return `Echo: ${text}\n\n(Set ANTHROPIC_API_KEY in .env.local to get replies from Claude.)`;
}

const NON_TEXT_LABELS: Record<string, string> = {
    image: 'photo',
    video: 'video',
    audio: 'voice message',
    document: 'document',
    sticker: 'sticker',
    location: 'location',
    contacts: 'contact card',
};

/** Polite reply for anything that is not plain text (photos, voice notes, ...). */
export function nonTextReply(type: string): string {
    const what = NON_TEXT_LABELS[type] ?? 'message';
    return `Thanks for the ${what}! I can only read text messages for now. Could you type your question instead?`;
}

function truncate(text: string): string {
    return text.length <= WHATSAPP_TEXT_LIMIT ? text : `${text.slice(0, WHATSAPP_TEXT_LIMIT - 1)}…`;
}

export function createAgent({ createMessage, model, systemPrompt, history }: AgentOptions): Agent {
    // Effort and server-side fallback are tuned for the default model. If you
    // switch ANTHROPIC_MODEL, check which of these that model supports.
    const tuned = model === DEFAULT_MODEL;

    return {
        async reply(user, text) {
            if (!createMessage) return echoReply(text);

            const response = await createMessage({
                model,
                max_tokens: 4096,
                system: systemPrompt,
                messages: [...history.get(user), { role: 'user', content: text }],
                // Caches the conversation prefix, so long chats cost less per turn.
                cache_control: { type: 'ephemeral' },
                ...(tuned && {
                    // Chat rarely needs deep reasoning; low effort keeps replies fast and cheap.
                    output_config: { effort: 'low' as const },
                    // If a safety classifier declines, retry on Anthropic's recommended fallback model.
                    betas: ['server-side-fallback-2026-07-01'],
                    fallbacks: 'default' as const,
                }),
            });

            if (response.stop_reason === 'refusal') return REFUSAL_REPLY;

            const answer = response.content
                .flatMap((block) => (block.type === 'text' ? [block.text] : []))
                .join('')
                .trim();
            if (!answer) return EMPTY_REPLY;

            history.append(user, text, answer);
            return truncate(answer);
        },
    };
}
