import { sendText } from '@/lib/whatsapp';

export const runtime = 'nodejs';

/** Reply from the dashboard as the business. */
export async function POST(request: Request): Promise<Response> {
    const { to, text } = (await request.json()) as { to?: string; text?: string };
    if (!to || !text?.trim()) return Response.json({ error: 'to and text are required' }, { status: 400 });
    try {
        return Response.json(await sendText(to, text.trim()));
    } catch (err) {
        return Response.json({ error: err instanceof Error ? err.message : 'Send failed' }, { status: 502 });
    }
}
