'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface ChatMessage {
    id: string;
    contact: string;
    direction: 'in' | 'out';
    text: string;
    at: number;
    status?: 'sent' | 'delivered' | 'read' | 'failed';
    error?: string;
}
interface Contact {
    waId: string;
    name: string;
    lastAt: number;
}

const MOCK_CUSTOMER = { from: '15550001111', name: 'Test Customer' };

function ticks(status?: ChatMessage['status']) {
    if (status === 'read') return <span className="read">✓✓</span>;
    if (status === 'delivered') return '✓✓';
    if (status === 'failed') return <span className="failed">!</span>;
    return '✓';
}

export default function Home() {
    const [mode, setMode] = useState<'mock' | 'live' | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [active, setActive] = useState<string | null>(null);
    const [reply, setReply] = useState('');
    const [customerText, setCustomerText] = useState('hi');
    const [busy, setBusy] = useState(false);
    const [lastPayload, setLastPayload] = useState<unknown>(null);
    const threadRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const es = new EventSource('/api/events');
        es.addEventListener('snapshot', (e) => {
            const data = JSON.parse((e as MessageEvent).data);
            setMode(data.mode);
            setMessages(data.messages);
            setContacts(data.contacts);
        });
        es.addEventListener('change', (e) => {
            const { message, contact } = JSON.parse((e as MessageEvent).data) as {
                message: ChatMessage;
                contact?: Contact;
            };
            setMessages((prev) => {
                const i = prev.findIndex((m) => m.id === message.id);
                if (i === -1) return [...prev, message];
                const next = prev.slice();
                next[i] = message;
                return next;
            });
            setContacts((prev) => {
                const rest = prev.filter((c) => c.waId !== message.contact);
                const existing = prev.find((c) => c.waId === message.contact);
                const name = contact?.name ?? existing?.name ?? message.contact;
                return [{ waId: message.contact, name, lastAt: Math.max(message.at, existing?.lastAt ?? 0) }, ...rest];
            });
        });
        return () => es.close();
    }, []);

    const current = active ?? contacts[0]?.waId ?? (mode === 'mock' ? MOCK_CUSTOMER.from : null);
    const thread = useMemo(() => messages.filter((m) => m.contact === current), [messages, current]);
    const currentName =
        contacts.find((c) => c.waId === current)?.name ?? (mode === 'mock' ? MOCK_CUSTOMER.name : current);

    // biome-ignore lint/correctness/useExhaustiveDependencies: scroll only when a message is added, not on status ticks
    useEffect(() => {
        threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
    }, [thread.length]);

    async function sendReply(e: React.FormEvent) {
        e.preventDefault();
        if (!current || !reply.trim()) return;
        setBusy(true);
        await fetch('/api/send', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ to: current, text: reply }),
        });
        setReply('');
        setBusy(false);
    }

    async function sendAsCustomer(e: React.FormEvent) {
        e.preventDefault();
        if (!customerText.trim()) return;
        setBusy(true);
        const res = await fetch('/api/simulate', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ ...MOCK_CUSTOMER, text: customerText }),
        });
        const data = await res.json();
        setLastPayload(data.payload);
        setCustomerText('');
        setBusy(false);
    }

    return (
        <div className="app">
            <aside className="sidebar">
                <div className="brand">
                    <h1>{'{{PROJECT_NAME}}'}</h1>
                    <p>WhatsApp app on meta-cloud-api</p>
                    {mode && (
                        <span className={`pill ${mode}`}>
                            {mode === 'mock'
                                ? '● Mock mode — no Meta account needed'
                                : '● Live — connected to WhatsApp'}
                        </span>
                    )}
                </div>
                <div className="contacts">
                    {contacts.length === 0 ? (
                        <p className="empty-list">
                            {mode === 'live' ? 'Waiting for the first WhatsApp message…' : 'No conversations yet.'}
                        </p>
                    ) : (
                        contacts.map((c) => (
                            <button
                                type="button"
                                key={c.waId}
                                className={`contact ${c.waId === current ? 'active' : ''}`}
                                onClick={() => setActive(c.waId)}
                            >
                                <strong>{c.name}</strong>
                                <span>+{c.waId}</span>
                            </button>
                        ))
                    )}
                </div>
            </aside>

            <main className="chat">
                <div className="chat-header">
                    <div>
                        <strong>{current ? currentName : 'No conversation'}</strong>
                        <small>{current ? `+${current}` : 'Messages to your number show up here'}</small>
                    </div>
                </div>

                <div className="thread" ref={threadRef}>
                    {thread.length === 0 && (
                        <div className="welcome">
                            {mode === 'live' ? (
                                <>
                                    <h2>Say hi from your phone</h2>
                                    <p>
                                        Send a WhatsApp message to your business number. It appears here and{' '}
                                        <code>lib/bot.ts</code> replies.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h2>You are the customer</h2>
                                    <p>
                                        Type in the dashed box below. It is sent as a real Cloud API webhook payload
                                        through the SDK, and <code>lib/bot.ts</code> answers.
                                    </p>
                                    <p>
                                        Add credentials to <code>.env.local</code> to switch to real WhatsApp.
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                    {thread.map((m) => (
                        <div key={m.id} className={`bubble ${m.direction}`}>
                            {m.text}
                            {m.error && <div className="error">{m.error}</div>}
                            <span className="meta">
                                {new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                                {m.direction === 'out' && ticks(m.status)}
                            </span>
                        </div>
                    ))}
                </div>

                {mode === 'mock' && lastPayload !== null && (
                    <details className="payload">
                        <summary>Webhook payload the SDK just processed</summary>
                        <pre>{JSON.stringify(lastPayload, null, 2)}</pre>
                    </details>
                )}

                {mode === 'mock' && (
                    <form className="composer customer" onSubmit={sendAsCustomer}>
                        <label htmlFor="customer">CUSTOMER</label>
                        <input
                            id="customer"
                            value={customerText}
                            onChange={(e) => setCustomerText(e.target.value)}
                            placeholder="Message your business as the customer…"
                        />
                        <button type="submit" disabled={busy}>
                            Send
                        </button>
                    </form>
                )}

                <form className="composer" onSubmit={sendReply}>
                    <label htmlFor="reply">BUSINESS</label>
                    <input
                        id="reply"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder={current ? 'Reply as the business…' : 'No conversation selected'}
                        disabled={!current}
                    />
                    <button type="submit" disabled={busy || !current}>
                        Reply
                    </button>
                </form>
            </main>
        </div>
    );
}
