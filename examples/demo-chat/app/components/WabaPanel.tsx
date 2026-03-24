'use client';

import { AlertCircle, CheckCircle, Link, Loader2, QrCode } from 'lucide-react';
import { useEffect, useState } from 'react';
import SessionList, { type Session } from './SessionList';

const WA_PHONE = '+1 206-745-7470';
const WA_LINK = 'https://wa.me/12067457470?text=Hi!%20I%20want%20to%20try%20the%20SDK%20demo';

interface WabaPanelProps {
    sessions: Session[];
    activeSessionId: string | null;
    onSelectSession: (id: string) => void;
}

export default function WabaPanel({ sessions, activeSessionId, onSelectSession }: WabaPanelProps) {
    const [webhookUrl, setWebhookUrl] = useState<string | null>(null);
    const [webhookLoading, setWebhookLoading] = useState(true);
    const [webhookUpdating, setWebhookUpdating] = useState(false);
    const [isConnectedHere, setIsConnectedHere] = useState(false);

    // Check current webhook override for this WABA
    useEffect(() => {
        fetch('/api/webhook-config')
            .then((r) => r.json())
            .then((data) => {
                setWebhookUrl(data.currentUrl || null);
                const currentHost = window.location.origin;
                const webhookEndpoint = `${currentHost}/api/webhook`;
                setIsConnectedHere(data.currentUrl === webhookEndpoint);
            })
            .catch(() => {})
            .finally(() => setWebhookLoading(false));
    }, []);

    const connectWebhook = async () => {
        setWebhookUpdating(true);
        try {
            const callbackUrl = `${window.location.origin}/api/webhook`;
            const res = await fetch('/api/webhook-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callbackUrl }),
            });
            const data = await res.json();
            if (data.success) {
                setWebhookUrl(callbackUrl);
                setIsConnectedHere(true);
            }
        } catch {
            // ignore
        } finally {
            setWebhookUpdating(false);
        }
    };

    return (
        <aside className="w-[320px] bg-[#18181b] border-r border-zinc-800 flex flex-col shrink-0">
            {/* Header */}
            <div className="h-14 px-4 border-b border-zinc-800 flex items-center shrink-0">
                <div>
                    <h1 className="text-sm font-semibold text-zinc-100">meta-cloud-api</h1>
                    <p className="text-[10px] text-zinc-500">SDK Live Demo</p>
                </div>
            </div>

            {/* Webhook status */}
            <div className="px-4 py-2 border-b border-zinc-800">
                {webhookLoading ? (
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                        <Loader2 size={12} className="animate-spin" /> Checking webhook...
                    </div>
                ) : isConnectedHere ? (
                    <div className="flex items-center gap-2 text-[11px] text-[#25D366]">
                        <CheckCircle size={12} /> Webhook connected to this demo
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[11px] text-amber-400 min-w-0">
                            <AlertCircle size={12} className="shrink-0" />
                            <span className="truncate">Webhook: {webhookUrl || 'not set'}</span>
                        </div>
                        <button
                            type="button"
                            onClick={connectWebhook}
                            disabled={webhookUpdating}
                            className="flex items-center gap-1 px-2 py-1 bg-[#25D366] hover:bg-[#20bd5a] disabled:bg-zinc-700 text-white text-[10px] font-medium rounded transition-colors shrink-0 ml-2"
                        >
                            {webhookUpdating ? <Loader2 size={10} className="animate-spin" /> : <Link size={10} />}
                            Connect
                        </button>
                    </div>
                )}
            </div>

            {/* QR Code CTA */}
            <div className="p-4 border-b border-zinc-800">
                <div className="bg-white rounded-lg p-3 flex flex-col items-center">
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(WA_LINK)}&bgcolor=ffffff&color=25D366`}
                        alt="Scan to chat on WhatsApp"
                        width={160}
                        height={160}
                        className="rounded"
                    />
                    <p className="text-[11px] text-zinc-800 font-medium mt-2">Scan to start a session</p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-zinc-500">Business Number</p>
                        <p className="text-xs text-zinc-300 font-mono">{WA_PHONE}</p>
                    </div>
                    <a
                        href={WA_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-medium rounded-lg transition-colors"
                    >
                        <QrCode size={14} />
                        Open Chat
                    </a>
                </div>
            </div>

            {/* Sessions */}
            <div className="px-4 py-2 border-b border-zinc-800">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Sessions ({sessions.length})</p>
            </div>

            <div className="flex-1 overflow-y-auto">
                <SessionList sessions={sessions} activeSessionId={activeSessionId} onSelectSession={onSelectSession} />
            </div>
        </aside>
    );
}
