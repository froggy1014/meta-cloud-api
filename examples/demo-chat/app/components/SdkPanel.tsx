'use client';

import { useState } from 'react';
import WebhookLogPanel from './panels/WebhookLogPanel';
import SdkCodeViewer from './SdkCodeViewer';

export interface WebhookLogEntry {
    id: number | string;
    timestamp: number;
    type: string;
    messageId?: string;
    status?: string;
    from?: string;
    text?: string;
}

interface SdkPanelProps {
    webhookLogs: WebhookLogEntry[];
    lastSdkCode?: string;
}

export default function SdkPanel({ webhookLogs, lastSdkCode }: SdkPanelProps) {
    const [tab, setTab] = useState<'code' | 'webhook'>('code');

    return (
        <aside className="w-[320px] bg-[#18181b] border-l border-zinc-800 flex flex-col shrink-0">
            <div className="h-14 px-4 border-b border-zinc-800 flex items-center gap-2 shrink-0">
                <h3 className="text-sm font-semibold text-zinc-200">SDK Inspector</h3>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#25D366]/20 text-[#25D366] font-medium">
                    LIVE
                </span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-800">
                <button
                    type="button"
                    onClick={() => setTab('code')}
                    className={`flex-1 py-2 text-[10px] font-medium border-b-2 transition-colors ${
                        tab === 'code'
                            ? 'text-[#25D366] border-[#25D366]'
                            : 'text-zinc-500 border-transparent hover:text-zinc-300'
                    }`}
                >
                    SDK Code
                </button>
                <button
                    type="button"
                    onClick={() => setTab('webhook')}
                    className={`flex-1 py-2 text-[10px] font-medium border-b-2 transition-colors ${
                        tab === 'webhook'
                            ? 'text-[#25D366] border-[#25D366]'
                            : 'text-zinc-500 border-transparent hover:text-zinc-300'
                    }`}
                >
                    Webhook Log ({webhookLogs.length})
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {tab === 'code' &&
                    (lastSdkCode ? (
                        <SdkCodeViewer code={lastSdkCode} />
                    ) : (
                        <div className="p-4 flex flex-col items-center justify-center h-32 text-zinc-600">
                            <p className="text-xs">Click a response button to see the SDK code</p>
                        </div>
                    ))}
                {tab === 'webhook' && <WebhookLogPanel logs={webhookLogs} />}
            </div>
        </aside>
    );
}
