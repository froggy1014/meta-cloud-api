'use client';

import { useCallback, useEffect, useState } from 'react';
import SdkCodeViewer from '../SdkCodeViewer';

interface ProfileData {
    about?: string;
    address?: string;
    description?: string;
    email?: string;
    vertical?: string;
    websites?: string[];
    profile_picture_url?: string;
}

export default function ProfilePanel() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sdkCode, setSdkCode] = useState('');
    const [response, setResponse] = useState('');

    const fetchProfile = useCallback(() => {
        setLoading(true);
        setError('');
        fetch('/api/profile')
            .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
            .then(({ ok, data }) => {
                if (data.sdkCode) setSdkCode(data.sdkCode);
                setResponse(JSON.stringify(data, null, 2));
                if (!ok) {
                    setError(data.error || 'Failed to load');
                    return;
                }
                setProfile(data.data?.[0] || data);
            })
            .catch(() => setError('Network error'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
                {loading && (
                    <div className="p-4 space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-10 bg-zinc-800/50 rounded-md animate-pulse" />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="p-4">
                        <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-md text-xs text-red-400">
                            {error}
                            <button type="button" onClick={fetchProfile} className="ml-2 underline">
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {!loading && !error && profile && (
                    <div className="p-4 space-y-3">
                        {profile.profile_picture_url && (
                            <div className="flex justify-center">
                                <img
                                    src={profile.profile_picture_url}
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full border-2 border-zinc-700"
                                />
                            </div>
                        )}
                        <ProfileField label="About" value={profile.about} />
                        <ProfileField label="Description" value={profile.description} />
                        <ProfileField label="Address" value={profile.address} />
                        <ProfileField label="Email" value={profile.email} />
                        <ProfileField label="Vertical" value={profile.vertical} />
                        {profile.websites && profile.websites.length > 0 && (
                            <ProfileField label="Websites" value={profile.websites.join(', ')} />
                        )}
                    </div>
                )}
            </div>

            <SdkCodeViewer code={sdkCode} response={response} />
        </div>
    );
}

function ProfileField({ label, value }: { label: string; value?: string }) {
    if (!value) return null;
    return (
        <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">{label}</div>
            <div className="text-xs text-zinc-300 bg-zinc-800/30 px-3 py-2 rounded-md">{value}</div>
        </div>
    );
}
