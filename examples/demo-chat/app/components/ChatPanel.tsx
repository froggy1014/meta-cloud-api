'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, PREDEFINED_RESPONSES } from '@/lib/predefined-responses';
import type { Session } from './SessionList';

export interface Message {
    id: string;
    type: 'sent' | 'received';
    text: string;
    timestamp: number;
    status?: string;
    messageType?: string;
    error?: string;
}

interface ChatPanelProps {
    session: Session | null;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    connectionStatus: 'connecting' | 'connected' | 'disconnected';
    onSdkCode?: (code: string) => void;
}

function maskPhone(phone: string): string {
    if (phone.length < 8) return phone;
    return phone.slice(0, -4).replace(/.(?=.{4})/g, (c, i) => (i > 3 ? '*' : c)) + phone.slice(-4);
}

export default function ChatPanel({ session, messages, setMessages, connectionStatus, onSdkCode }: ChatPanelProps) {
    const [sending, setSending] = useState<string | null>(null);
    const [now, setNow] = useState(0);
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setNow(Date.now());
        const interval = setInterval(() => setNow(Date.now()), 30_000);
        return () => clearInterval(interval);
    }, []);

    const windowActive = session && now ? new Date(session.window_expires_at).getTime() > now : false;
    const windowRemaining = session && now ? Math.max(0, new Date(session.window_expires_at).getTime() - now) : 0;
    const windowHours = Math.floor(windowRemaining / 3600000);
    const windowMins = Math.floor((windowRemaining % 3600000) / 60000);

    // Get last received message ID (for reaction/mark_read)
    const lastReceivedId = [...messages].reverse().find((m) => m.type === 'received')?.id;

    useEffect(() => {
        chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
    }, []);

    const sendResponse = async (responseId: string) => {
        if (sending || !session) return;
        setSending(responseId);

        const response = PREDEFINED_RESPONSES.find((r) => r.id === responseId);
        if (!response) return;

        const tempId = `temp-${Date.now()}`;
        setMessages((prev) => [
            ...prev,
            {
                id: tempId,
                type: 'sent',
                text: `${response.icon} ${response.label}`,
                timestamp: Date.now(),
                status: 'sending',
                messageType: response.type,
            },
        ]);

        try {
            const res = await fetch('/api/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: session.id, responseId, lastMessageId: lastReceivedId }),
            });
            const data = await res.json();
            if (data.sdkCode) onSdkCode?.(data.sdkCode);

            if (!res.ok) {
                setMessages((prev) =>
                    prev.map((m) => (m.id === tempId ? { ...m, status: 'failed', error: data.error } : m)),
                );
            } else {
                const realId = data.messages?.[0]?.id || tempId;
                setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, id: realId, status: 'sent' } : m)));
            }
        } catch {
            setMessages((prev) =>
                prev.map((m) => (m.id === tempId ? { ...m, status: 'failed', error: 'Network error' } : m)),
            );
        } finally {
            setSending(null);
        }
    };

    const statusIcon = (status?: string) => {
        switch (status) {
            case 'sending':
                return '🕐';
            case 'sent':
                return '✓';
            case 'delivered':
            case 'read':
                return '✓✓';
            case 'failed':
                return '❌';
            default:
                return '';
        }
    };

    // No session selected
    if (!session) {
        return (
            <main className="flex-1 flex flex-col items-center justify-center bg-[#09090b] text-zinc-600">
                <div className="w-20 h-20 rounded-2xl bg-zinc-800/30 flex items-center justify-center mb-6">
                    <span className="text-3xl">💬</span>
                </div>
                <h2 className="text-lg font-medium text-zinc-400">meta-cloud-api SDK Demo</h2>
                <p className="text-sm text-zinc-600 mt-2 max-w-[360px] text-center">
                    Send a WhatsApp message to the business number to start a session. Then use the buttons here to
                    respond with different SDK message types.
                </p>
                <div className="mt-6 px-4 py-2 bg-zinc-800/30 rounded-lg text-xs text-zinc-500">
                    Waiting for incoming messages...
                    <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ml-2 ${
                            connectionStatus === 'connected' ? 'bg-[#25D366]' : 'bg-zinc-600'
                        }`}
                    />
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
            {/* Header */}
            <header className="h-14 px-4 border-b border-zinc-800 flex items-center justify-between bg-[#18181b] shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white text-sm font-semibold">
                        {(session.display_name || session.phone_number).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-sm font-medium text-zinc-100">
                            {session.display_name || maskPhone(session.phone_number)}
                        </h2>
                        <p className="text-[11px] text-zinc-500">
                            {windowActive
                                ? `Window: ${windowHours}h ${windowMins}m remaining`
                                : 'Window expired — templates only'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={`w-2 h-2 rounded-full ${
                            connectionStatus === 'connected'
                                ? 'bg-[#25D366]'
                                : connectionStatus === 'connecting'
                                  ? 'bg-amber-500 animate-pulse'
                                  : 'bg-red-500'
                        }`}
                    />
                    <span className="text-[11px] text-zinc-500">
                        {connectionStatus === 'connected'
                            ? 'Realtime'
                            : connectionStatus === 'connecting'
                              ? 'Connecting...'
                              : 'Disconnected'}
                    </span>
                </div>
            </header>

            {/* Window expired banner */}
            {!windowActive && (
                <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-400">
                    24h window expired. Only template messages can be sent. Ask the user to reply to re-open.
                </div>
            )}

            {/* Chat messages */}
            <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                        <p className="text-xs">No messages in this session yet</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                                msg.type === 'sent'
                                    ? msg.status === 'failed'
                                        ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                                        : 'bg-[#25D366]/10 text-zinc-200 border border-[#25D366]/20'
                                    : 'bg-zinc-800 text-zinc-200'
                            }`}
                        >
                            <p className="break-words">{msg.text}</p>
                            {msg.error && <p className="text-[11px] text-red-400 mt-1">{msg.error}</p>}
                            <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-[10px] text-zinc-500">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                                {msg.type === 'sent' && (
                                    <span
                                        className={`text-[11px] ${msg.status === 'read' ? 'text-[#25D366]' : 'text-zinc-500'}`}
                                    >
                                        {statusIcon(msg.status)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Response buttons */}
            <div className="border-t border-zinc-800 bg-[#18181b] px-4 py-3">
                {CATEGORIES.map((cat) => (
                    <div key={cat.key} className="mb-2">
                        <div className="text-[9px] uppercase tracking-wider text-zinc-600 mb-1.5">{cat.label}</div>
                        <div className="flex flex-wrap gap-1.5">
                            {PREDEFINED_RESPONSES.filter((r) => r.category === cat.key).map((r) => {
                                const disabled = sending !== null || (!windowActive && r.requiresWindow);
                                return (
                                    <button
                                        type="button"
                                        key={r.id}
                                        onClick={() => sendResponse(r.id)}
                                        disabled={disabled}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                            disabled
                                                ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
                                                : sending === r.id
                                                  ? 'bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40'
                                                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
                                        }`}
                                    >
                                        {r.icon} {r.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Status bar */}
            <div className="px-4 py-1 border-t border-zinc-800 flex justify-between text-[10px] text-zinc-600 bg-[#09090b]">
                <span>
                    {messages.filter((m) => m.type === 'sent').length} sent ·{' '}
                    {messages.filter((m) => m.type === 'received').length} received
                </span>
                <span>
                    ⚠️ Real API ·{' '}
                    <a
                        href="https://developers.facebook.com/docs/whatsapp/pricing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#25D366]/60 hover:underline"
                    >
                        pricing
                    </a>
                </span>
            </div>
        </main>
    );
}
