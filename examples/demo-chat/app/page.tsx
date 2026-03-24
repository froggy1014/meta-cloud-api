'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import ChatPanel, { type Message } from './components/ChatPanel';
import type { WebhookLogEntry } from './components/SdkPanel';
import SdkPanel from './components/SdkPanel';
import type { Session } from './components/SessionList';
import WabaPanel from './components/WabaPanel';

function mapMessage(row: any): Message {
    return {
        id: row.wa_message_id || row.id,
        type: row.direction === 'sent' ? 'sent' : 'received',
        text: row.content?.text || row.content?.label || row.content?.raw || `[${row.type}]`,
        timestamp: new Date(row.created_at).getTime(),
        status: row.status,
        messageType: row.type,
    };
}

export default function DemoChat() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [webhookLogs, setWebhookLogs] = useState<WebhookLogEntry[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
    const [lastSdkCode, setLastSdkCode] = useState('');

    const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

    // Load sessions + subscribe to realtime
    useEffect(() => {
        const supabase = createBrowserClient();
        setConnectionStatus('connecting');

        // Load sessions
        supabase
            .from('sessions')
            .select('*')
            .order('last_message_at', { ascending: false })
            .then(({ data }) => {
                if (data) setSessions(data);
            });

        // Load webhook events
        supabase
            .from('webhook_events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100)
            .then(({ data }) => {
                if (data) {
                    setWebhookLogs(
                        data.reverse().map((row: any) => ({
                            id: row.id,
                            timestamp: new Date(row.created_at).getTime(),
                            type: row.event_type,
                            messageId: row.wa_message_id,
                            status: row.status,
                        })),
                    );
                }
            });

        // Realtime: sessions
        const channel = supabase
            .channel('demo-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, (payload: any) => {
                if (payload.eventType === 'INSERT') {
                    setSessions((prev) => [payload.new, ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    setSessions((prev) =>
                        prev
                            .map((s) => (s.id === payload.new.id ? payload.new : s))
                            .sort(
                                (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime(),
                            ),
                    );
                }
            })
            // Realtime: messages
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
                const row = payload.new;
                setMessages((prev) => {
                    if (prev.some((m) => m.id === row.wa_message_id)) return prev;
                    return [...prev, mapMessage(row)];
                });
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload: any) => {
                const row = payload.new;
                setMessages((prev) => prev.map((m) => (m.id === row.wa_message_id ? { ...m, status: row.status } : m)));
            })
            // Realtime: webhook events
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'webhook_events' }, (payload: any) => {
                const row = payload.new;
                setWebhookLogs((prev) => [
                    ...prev.slice(-99),
                    {
                        id: row.id,
                        timestamp: new Date(row.created_at).getTime(),
                        type: row.event_type,
                        messageId: row.wa_message_id,
                        status: row.status,
                    },
                ]);
            })
            .subscribe((status: string) => {
                if (status === 'SUBSCRIBED') setConnectionStatus('connected');
                else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') setConnectionStatus('disconnected');
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Load messages when session changes
    useEffect(() => {
        if (!activeSessionId) {
            setMessages([]);
            return;
        }
        const supabase = createBrowserClient();
        supabase
            .from('messages')
            .select('*')
            .eq('session_id', activeSessionId)
            .order('created_at', { ascending: true })
            .limit(100)
            .then(({ data }) => {
                if (data) setMessages(data.map(mapMessage));
            });
    }, [activeSessionId]);

    // Auto-select first session if none selected
    useEffect(() => {
        if (!activeSessionId && sessions.length > 0) {
            setActiveSessionId(sessions[0].id);
        }
    }, [sessions, activeSessionId]);

    return (
        <div className="flex h-screen bg-[#09090b] text-zinc-100">
            {/* Left: WABA info + Sessions */}
            <WabaPanel sessions={sessions} activeSessionId={activeSessionId} onSelectSession={setActiveSessionId} />

            {/* Center: Chat with response buttons */}
            <ChatPanel
                session={activeSession}
                messages={messages}
                setMessages={setMessages}
                connectionStatus={connectionStatus}
                onSdkCode={setLastSdkCode}
            />

            {/* Right: SDK Code + Webhook Log */}
            <SdkPanel webhookLogs={webhookLogs} lastSdkCode={lastSdkCode} />
        </div>
    );
}
