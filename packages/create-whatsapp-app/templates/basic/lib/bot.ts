import { sendText } from './whatsapp';

/**
 * Your bot. Runs for every incoming text message, in mock mode and in
 * production alike. Edit this file and send a message to see the change.
 */
export async function onCustomerText(from: string, name: string, text: string): Promise<void> {
    const command = text.trim().toLowerCase();

    if (command === 'hi' || command === 'hello' || command === 'menu') {
        await sendText(
            from,
            [
                `Hi ${name}! 👋 This reply came from lib/bot.ts.`,
                '',
                'Try:',
                '• *time* — server time',
                '• *echo <text>* — repeat after me',
                '• anything else — I will count the characters',
            ].join('\n'),
        );
        return;
    }

    if (command === 'time') {
        await sendText(from, `🕒 ${new Date().toLocaleString()}`);
        return;
    }

    if (command.startsWith('echo ')) {
        await sendText(from, text.trim().slice(5));
        return;
    }

    await sendText(from, `You said "${text}" (${[...text].length} characters). Send *menu* for options.`);
}
