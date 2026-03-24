'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

interface SdkCodeViewerProps {
    code: string;
    response?: string;
}

export default function SdkCodeViewer({ code, response }: SdkCodeViewerProps) {
    const [tab, setTab] = useState<'code' | 'response'>('code');
    const [copied, setCopied] = useState(false);

    const content = tab === 'code' ? code : response || 'No response yet';

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!code && !response) {
        return (
            <div className="p-4 flex flex-col items-center justify-center h-32 text-zinc-600">
                <p className="text-xs">Execute an action to see the SDK code</p>
            </div>
        );
    }

    return (
        <div className="border-t border-zinc-800">
            <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/50">
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={() => setTab('code')}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                            tab === 'code' ? 'bg-[#25D366]/20 text-[#25D366]' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        SDK Code
                    </button>
                    {response && (
                        <button
                            type="button"
                            onClick={() => setTab('response')}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                tab === 'response'
                                    ? 'bg-[#25D366]/20 text-[#25D366]'
                                    : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            Response
                        </button>
                    )}
                </div>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                    title="Copy to clipboard"
                >
                    {copied ? <Check size={12} className="text-[#25D366]" /> : <Copy size={12} />}
                </button>
            </div>
            <pre className="p-3 text-[11px] font-mono text-zinc-300 bg-[#09090b] overflow-auto max-h-48 leading-relaxed">
                {content}
            </pre>
        </div>
    );
}
