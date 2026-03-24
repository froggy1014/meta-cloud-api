'use client';

import { useCallback, useEffect, useState } from 'react';
import SdkCodeViewer from '../SdkCodeViewer';

interface Template {
    name: string;
    status: string;
    category: string;
    language: string;
}

export default function TemplatesPanel() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sdkCode, setSdkCode] = useState('');
    const [response, setResponse] = useState('');

    const fetchTemplates = useCallback(() => {
        setLoading(true);
        setError('');
        fetch('/api/templates')
            .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
            .then(({ ok, data }) => {
                if (data.sdkCode) setSdkCode(data.sdkCode);
                setResponse(JSON.stringify(data, null, 2));
                if (!ok) {
                    setError(data.error || 'Failed to load');
                    return;
                }
                setTemplates(data.data || []);
            })
            .catch(() => setError('Network error'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const statusColor = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-[#25D366]/20 text-[#25D366]';
            case 'PENDING':
                return 'bg-amber-500/20 text-amber-400';
            case 'REJECTED':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-zinc-700/20 text-zinc-400';
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
                {loading && (
                    <div className="p-4 space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-zinc-800/50 rounded-md animate-pulse" />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="p-4">
                        <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-md text-xs text-red-400">
                            {error}
                            <button type="button" onClick={fetchTemplates} className="ml-2 underline">
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {!loading && !error && templates.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
                        <p className="text-xs font-medium text-zinc-500">No templates yet</p>
                        <p className="text-[11px] text-zinc-600 mt-1">Create one in the Meta Business Suite</p>
                    </div>
                )}

                {!loading && templates.length > 0 && (
                    <div className="p-2 space-y-1">
                        {templates.map((t) => (
                            <div
                                key={`${t.name}-${t.language}`}
                                className="px-3 py-2.5 rounded-md hover:bg-zinc-800/50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-zinc-200">{t.name}</span>
                                    <span
                                        className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${statusColor(t.status)}`}
                                    >
                                        {t.status}
                                    </span>
                                </div>
                                <div className="text-[11px] text-zinc-500 mt-0.5">
                                    {t.category} · {t.language}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <SdkCodeViewer code={sdkCode} response={response} />
        </div>
    );
}
