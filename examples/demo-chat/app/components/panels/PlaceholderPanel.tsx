'use client';

type NavPanel = string;

const PANEL_INFO: Record<string, { description: string; methods: string[] }> = {
    templates: {
        description: 'Create, list, and manage WhatsApp message templates',
        methods: ['sdk.templates.list()', 'sdk.templates.create()', 'sdk.templates.delete()'],
    },
    media: {
        description: 'Upload, download, and manage media files',
        methods: ['sdk.media.upload()', 'sdk.media.get()', 'sdk.media.delete()'],
    },
    profile: {
        description: 'View and update your WhatsApp Business Profile',
        methods: ['sdk.businessProfile.get()', 'sdk.businessProfile.update()'],
    },
    'qr-codes': {
        description: 'Generate and manage QR codes for your business',
        methods: ['sdk.qrCode.create()', 'sdk.qrCode.list()', 'sdk.qrCode.delete()'],
    },
    'phone-numbers': {
        description: 'View phone number information and settings',
        methods: ['sdk.phoneNumbers.get()', 'sdk.phoneNumbers.list()'],
    },
    flows: {
        description: 'Create and manage WhatsApp Flows for interactive forms',
        methods: ['sdk.flows.list()', 'sdk.flows.create()', 'sdk.flows.publish()'],
    },
    settings: {
        description: 'Configure BYOK tokens and demo settings',
        methods: [],
    },
};

interface PlaceholderPanelProps {
    panel: NavPanel;
}

export default function PlaceholderPanel({ panel }: PlaceholderPanelProps) {
    const info = PANEL_INFO[panel];
    if (!info) return null;

    return (
        <div className="p-4 space-y-4">
            <p className="text-xs text-zinc-400">{info.description}</p>

            {info.methods.length > 0 && (
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">SDK Methods</p>
                    <div className="space-y-1">
                        {info.methods.map((method) => (
                            <div
                                key={method}
                                className="px-3 py-2 bg-zinc-900 rounded-md font-mono text-[11px] text-[#25D366]"
                            >
                                {method}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="px-4 py-6 border border-dashed border-zinc-700 rounded-lg text-center">
                <p className="text-xs text-zinc-500">Coming soon</p>
                <p className="text-[11px] text-zinc-600 mt-1">This panel will be fully interactive</p>
            </div>
        </div>
    );
}
