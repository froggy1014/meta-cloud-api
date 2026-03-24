'use client';

import { useEffect, useState } from 'react';

export interface Session {
    id: string;
    phone_number: string;
    display_name?: string;
    last_message_at: string;
    window_expires_at: string;
}

function maskPhone(phone: string): string {
    if (phone.length < 8) return phone;
    return phone.slice(0, -4).replace(/.(?=.{4})/g, (c, i) => (i > 3 ? '*' : c)) + phone.slice(-4);
}

function timeAgo(dateStr: string, now: number): string {
    const diff = now - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function isWindowActive(expiresAt: string, now: number): boolean {
    return new Date(expiresAt).getTime() > now;
}

interface SessionListProps {
    sessions: Session[];
    activeSessionId: string | null;
    onSelectSession: (id: string) => void;
}

export default function SessionList({ sessions, activeSessionId, onSelectSession }: SessionListProps) {
    const [now, setNow] = useState(0);

    useEffect(() => {
        setNow(Date.now());
        const interval = setInterval(() => setNow(Date.now()), 30_000);
        return () => clearInterval(interval);
    }, []);

    if (!now) return null; // SSR: render nothing, hydrate on client

    if (sessions.length === 0) {
        return (
            <div className="p-4 text-center">
                <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg">💬</span>
                </div>
                <p className="text-xs font-medium text-zinc-400">No conversations yet</p>
                <p className="text-[11px] text-zinc-600 mt-1">
                    Send a WhatsApp message to your business number to start
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-0.5 p-1">
            {sessions.map((s) => {
                const active = isWindowActive(s.window_expires_at, now);
                return (
                    <button
                        type="button"
                        key={s.id}
                        onClick={() => onSelectSession(s.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                            activeSessionId === s.id
                                ? 'bg-[#25D366]/10 border border-[#25D366]/20'
                                : 'hover:bg-zinc-800/50 border border-transparent'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                                <span
                                    className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-[#25D366]' : 'bg-zinc-600'}`}
                                />
                                <span className="text-xs font-medium text-zinc-200 truncate">
                                    {s.display_name || maskPhone(s.phone_number)}
                                </span>
                            </div>
                            <span className="text-[10px] text-zinc-600 shrink-0 ml-2">
                                {timeAgo(s.last_message_at, now)}
                            </span>
                        </div>
                        {!active && <div className="text-[10px] text-amber-500/80 mt-0.5 ml-4">Window expired</div>}
                    </button>
                );
            })}
        </div>
    );
}
