'use client';

import type { WebhookLogEntry } from '../SdkPanel';

interface WebhookLogPanelProps {
    logs: WebhookLogEntry[];
}

export default function WebhookLogPanel({ logs }: WebhookLogPanelProps) {
    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-16 text-zinc-600">
                <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center mb-3">
                    <span className="text-lg">📡</span>
                </div>
                <p className="text-xs font-medium text-zinc-500">Waiting for webhooks...</p>
                <p className="text-[11px] text-zinc-600 mt-1">Send a message to see events here</p>
            </div>
        );
    }

    return (
        <div className="p-2 space-y-0.5 font-mono text-[11px]">
            {logs
                .slice()
                .reverse()
                .map((log) => (
                    <div key={log.id} className="px-2 py-1.5 rounded bg-zinc-900/50 flex items-center gap-2">
                        <span
                            className={`shrink-0 w-1.5 h-1.5 rounded-full ${
                                log.type === 'status' ? 'bg-[#25D366]' : 'bg-blue-400'
                            }`}
                        />
                        <span className="text-[#25D366]">{log.type}</span>
                        {log.status && <span className="text-emerald-400">→ {log.status}</span>}
                        {log.from && <span className="text-amber-400 truncate">from {log.from}</span>}
                        <span className="ml-auto text-zinc-600 shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                            })}
                        </span>
                    </div>
                ))}
        </div>
    );
}
