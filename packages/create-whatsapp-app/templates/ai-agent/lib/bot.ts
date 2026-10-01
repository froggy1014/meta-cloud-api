import { nonTextReply } from './agent';
import { agent } from './claude';
import { sendText } from './whatsapp';

/**
 * Your bot. Runs for every incoming message, in mock mode and in production
 * alike. Text goes to Claude (see lib/prompt.ts for the system prompt);
 * everything else gets a polite "text only" reply.
 */
export async function onCustomerText(from: string, _name: string, text: string): Promise<void> {
    let reply: string;
    try {
        reply = await agent.reply(from, text);
    } catch (err) {
        console.error('[agent]', err instanceof Error ? err.message : err);
        reply = 'Sorry, something went wrong on our side. Please try again in a moment.';
    }
    await sendText(from, reply);
}

export async function onCustomerNonText(from: string, type: string): Promise<void> {
    await sendText(from, nonTextReply(type));
}
