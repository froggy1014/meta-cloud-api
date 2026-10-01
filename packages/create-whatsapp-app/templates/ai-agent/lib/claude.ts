import Anthropic from '@anthropic-ai/sdk';
import { createAgent, DEFAULT_MODEL } from './agent';
import { history } from './history';
import { SYSTEM_PROMPT } from './prompt';

/**
 * Without ANTHROPIC_API_KEY the agent echoes messages back, so mock mode and
 * smoke tests run with no secrets at all.
 */
export const hasClaude = Boolean(process.env.ANTHROPIC_API_KEY);
export const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;

const client = hasClaude ? new Anthropic() : null;

export const agent = createAgent({
    createMessage: client ? (params) => client.beta.messages.create(params) : null,
    model,
    systemPrompt: SYSTEM_PROMPT,
    history,
});
