import { useCallback, useEffect, useRef, useState } from 'react';
import {
    getExamples,
    getExamplePayload,
    executeMock,
    executeLive,
    buildCurl,
} from './mockApi';
import type { ApiResult, Credentials } from './mockApi';

const SAMPLE_IMAGES = [
    {
        label: 'Landscape',
        url: 'https://picsum.photos/id/10/400/300',
        thumb: 'https://picsum.photos/id/10/120/80',
    },
    {
        label: 'City',
        url: 'https://picsum.photos/id/274/400/300',
        thumb: 'https://picsum.photos/id/274/120/80',
    },
    {
        label: 'Ocean',
        url: 'https://picsum.photos/id/141/400/300',
        thumb: 'https://picsum.photos/id/141/120/80',
    },
    {
        label: 'Forest',
        url: 'https://picsum.photos/id/15/400/300',
        thumb: 'https://picsum.photos/id/15/120/80',
    },
    {
        label: 'Coffee',
        url: 'https://picsum.photos/id/425/400/300',
        thumb: 'https://picsum.photos/id/425/120/80',
    },
];

import { EditorView, basicSetup } from 'codemirror';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';

type Tab = 'request' | 'response' | 'curl';

const STORAGE_KEY = 'mca-playground-creds';

function loadCreds(): Credentials | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed.accessToken && parsed.phoneNumberId) return parsed;
        return null;
    } catch {
        return null;
    }
}

function saveCreds(creds: Credentials | null) {
    if (creds?.accessToken && creds?.phoneNumberId) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
}

export default function Playground() {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const [selectedExample, setSelectedExample] = useState('send-text');
    const [activeTab, setActiveTab] = useState<Tab>('request');
    const [result, setResult] = useState<ApiResult | null>(null);
    const [running, setRunning] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [creds, setCreds] = useState<Credentials | null>(null);
    const [tokenInput, setTokenInput] = useState('');
    const [phoneInput, setPhoneInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const examples = getExamples();

    useEffect(() => {
        const saved = loadCreds();
        if (saved) {
            setCreds(saved);
            setTokenInput(saved.accessToken);
            setPhoneInput(saved.phoneNumberId);
        }
    }, []);

    const isLive = Boolean(creds?.accessToken && creds?.phoneNumberId);

    // Get current editor content
    const getEditorContent = (): string => {
        return viewRef.current?.state.doc.toString() ?? '';
    };

    // Initialize CodeMirror
    useEffect(() => {
        if (!editorRef.current) return;

        const state = EditorState.create({
            doc: getExamplePayload(selectedExample),
            extensions: [
                basicSetup,
                json(),
                oneDark,
                EditorView.theme({
                    '&': { height: '100%', fontSize: '13px' },
                    '.cm-scroller': { overflow: 'auto' },
                    '.cm-content': {
                        fontFamily: "'JetBrains Mono', monospace",
                    },
                    '.cm-gutters': {
                        backgroundColor: 'hsl(220, 20%, 5%)',
                        borderRight: '1px solid hsl(220, 10%, 18%)',
                    },
                }),
            ],
        });

        const view = new EditorView({ state, parent: editorRef.current });
        viewRef.current = view;
        return () => view.destroy();
    }, []);

    // Update editor on example change
    useEffect(() => {
        if (!viewRef.current) return;
        const payload = getExamplePayload(selectedExample);
        viewRef.current.dispatch({
            changes: {
                from: 0,
                to: viewRef.current.state.doc.length,
                insert: payload,
            },
        });
        setResult(null);
        setError(null);
    }, [selectedExample]);

    const handleRun = useCallback(async () => {
        setRunning(true);
        setError(null);
        try {
            const payloadJson = getEditorContent();
            // Validate JSON
            try {
                JSON.parse(payloadJson);
            } catch {
                setError('Invalid JSON — check your payload syntax');
                setRunning(false);
                return;
            }

            if (isLive && creds) {
                const liveResult = await executeLive(payloadJson, creds);
                setResult(liveResult);
                if (liveResult.response.status >= 400) {
                    setError(`API returned ${liveResult.response.status}`);
                }
            } else {
                const mockResult = await executeMock(payloadJson);
                setResult(mockResult);
            }
            setActiveTab('response');
        } catch (err: any) {
            setError(err.message || 'Request failed');
        } finally {
            setRunning(false);
        }
    }, [isLive, creds]);

    const handleSaveCreds = () => {
        if (tokenInput && phoneInput) {
            const newCreds = {
                accessToken: tokenInput,
                phoneNumberId: phoneInput,
            };
            setCreds(newCreds);
            saveCreds(newCreds);
        } else {
            setCreds(null);
            saveCreds(null);
        }
        setShowSettings(false);
    };

    const handleClearCreds = () => {
        setCreds(null);
        setTokenInput('');
        setPhoneInput('');
        saveCreds(null);
        setShowSettings(false);
    };

    const handleCopyCurl = () => {
        if (!result) return;
        navigator.clipboard.writeText(
            buildCurl(result, isLive ? creds?.accessToken : undefined),
        );
    };

    const handleImageSelect = (url: string) => {
        setSelectedImage(url);
        if (!viewRef.current) return;
        const content = viewRef.current.state.doc.toString();
        try {
            const parsed = JSON.parse(content);
            parsed.image = { ...parsed.image, link: url };
            const updated = JSON.stringify(parsed, null, 2);
            viewRef.current.dispatch({
                changes: {
                    from: 0,
                    to: viewRef.current.state.doc.length,
                    insert: updated,
                },
            });
        } catch {
            const updated = content.replace(
                /"link":\s*"[^"]*"/,
                `"link": "${url}"`,
            );
            viewRef.current.dispatch({
                changes: {
                    from: 0,
                    to: viewRef.current.state.doc.length,
                    insert: updated,
                },
            });
        }
    };

    return (
        <div style={styles.container}>
            {/* Toolbar */}
            <div style={styles.toolbar}>
                <select
                    value={selectedExample}
                    onChange={(e) => setSelectedExample(e.target.value)}
                    style={styles.select}
                >
                    {examples.map((ex) => (
                        <option key={ex.key} value={ex.key}>
                            {ex.label}
                        </option>
                    ))}
                </select>

                <button
                    onClick={() => setShowSettings(!showSettings)}
                    style={{
                        ...styles.settingsBtn,
                        borderColor: isLive
                            ? 'hsl(145, 55%, 38%)'
                            : 'hsl(220, 10%, 22%)',
                    }}
                    title="API Credentials"
                >
                    {isLive ? '🔑 Live' : '⚙ Settings'}
                </button>

                <button
                    onClick={handleRun}
                    disabled={running}
                    style={{
                        ...styles.runButton,
                        opacity: running ? 0.6 : 1,
                        background: isLive
                            ? 'hsl(145, 63%, 42%)'
                            : 'hsl(220, 10%, 30%)',
                    }}
                >
                    {running
                        ? 'Running...'
                        : isLive
                          ? '▶ Run (Live)'
                          : '▶ Run (Mock)'}
                </button>
            </div>

            {/* Settings panel */}
            {showSettings && (
                <div style={styles.settingsPanel}>
                    <div style={styles.settingsHeader}>
                        <span style={styles.settingsTitle}>
                            API Credentials
                        </span>
                        <span style={styles.settingsHint}>
                            Stored in localStorage only — never sent to our
                            servers
                        </span>
                    </div>
                    <div style={styles.settingsFields}>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Access Token</label>
                            <input
                                type="password"
                                value={tokenInput}
                                onChange={(e) => setTokenInput(e.target.value)}
                                placeholder="EAABs..."
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Phone Number ID</label>
                            <input
                                type="text"
                                value={phoneInput}
                                onChange={(e) => setPhoneInput(e.target.value)}
                                placeholder="123456789012345"
                                style={styles.input}
                            />
                        </div>
                    </div>
                    <div style={styles.settingsActions}>
                        <button
                            onClick={handleSaveCreds}
                            style={styles.saveBtn}
                        >
                            Save
                        </button>
                        {isLive && (
                            <button
                                onClick={handleClearCreds}
                                style={styles.clearBtn}
                            >
                                Clear
                            </button>
                        )}
                        <button
                            onClick={() => setShowSettings(false)}
                            style={styles.cancelBtn}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Error banner */}
            {error && (
                <div style={styles.errorBanner}>
                    <span>{error}</span>
                </div>
            )}

            {/* Image picker */}
            {selectedExample === 'send-image' && (
                <div style={styles.imagePicker}>
                    <span style={styles.imagePickerLabel}>Image</span>
                    <div style={styles.imageGrid}>
                        {SAMPLE_IMAGES.map((img) => {
                            const isSelected = selectedImage === img.url;
                            return (
                                <button
                                    key={img.label}
                                    onClick={() => handleImageSelect(img.url)}
                                    style={{
                                        ...styles.imageThumb,
                                        borderColor: isSelected
                                            ? 'hsl(145, 55%, 45%)'
                                            : 'hsl(220, 10%, 20%)',
                                        boxShadow: isSelected
                                            ? '0 0 12px hsla(145, 55%, 42%, 0.3)'
                                            : 'none',
                                        transform: isSelected
                                            ? 'scale(1.05)'
                                            : 'scale(1)',
                                    }}
                                    title={img.label}
                                >
                                    <img
                                        src={img.thumb}
                                        alt={img.label}
                                        style={styles.imageThumbImg}
                                        loading="lazy"
                                    />
                                    <span
                                        style={{
                                            ...styles.imageThumbLabel,
                                            background: isSelected
                                                ? 'hsla(145, 55%, 30%, 0.85)'
                                                : 'hsla(0, 0%, 0%, 0.65)',
                                        }}
                                    >
                                        {isSelected ? '✓ ' : ''}
                                        {img.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Template warning */}
            {selectedExample === 'send-template' && (
                <div style={styles.warningBanner}>
                    ⚠ Templates must be pre-approved in your WhatsApp Business Manager before sending. The <code style={styles.inlineCode}>hello_world</code> template is available by default in test accounts.
                </div>
            )}

            {/* Main content */}
            <div style={styles.main}>
                {/* Editor */}
                <div style={styles.editorPane}>
                    <div style={styles.paneHeader}>
                        <span style={styles.paneTitle}>
                            Request Body (JSON)
                        </span>
                        {!isLive && (
                            <span style={styles.modeBadge}>MOCK</span>
                        )}
                        {isLive && (
                            <span style={styles.liveBadge}>LIVE</span>
                        )}
                    </div>
                    <div ref={editorRef} style={styles.editor} />
                </div>

                {/* Output */}
                <div style={styles.outputPane}>
                    <div style={styles.paneHeader}>
                        <button
                            onClick={() => setActiveTab('request')}
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'request'
                                    ? styles.activeTab
                                    : {}),
                            }}
                        >
                            Request
                        </button>
                        <button
                            onClick={() => setActiveTab('response')}
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'response'
                                    ? styles.activeTab
                                    : {}),
                            }}
                        >
                            Response
                        </button>
                        <button
                            onClick={() => setActiveTab('curl')}
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'curl'
                                    ? styles.activeTab
                                    : {}),
                            }}
                        >
                            cURL
                        </button>
                        {result && activeTab === 'curl' && (
                            <button
                                onClick={handleCopyCurl}
                                style={styles.copyBtn}
                            >
                                Copy
                            </button>
                        )}
                    </div>
                    <div style={styles.output}>
                        {result ? (
                            <pre
                                style={{
                                    ...styles.json,
                                    color:
                                        activeTab === 'response' &&
                                        result.response.status >= 400
                                            ? 'hsl(0, 70%, 65%)'
                                            : 'hsl(145, 60%, 60%)',
                                }}
                            >
                                {activeTab === 'request'
                                    ? JSON.stringify(result.request, null, 2)
                                    : activeTab === 'response'
                                      ? JSON.stringify(
                                            result.response,
                                            null,
                                            2,
                                        )
                                      : buildCurl(
                                            result,
                                            isLive
                                                ? creds?.accessToken
                                                : undefined,
                                        )}
                            </pre>
                        ) : (
                            <div style={styles.placeholder}>
                                {isLive
                                    ? 'Edit the JSON payload, then click Run to send a real API request'
                                    : 'Add your API key in Settings to make live calls, or click Run for mock data'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        background: 'hsl(220, 20%, 5%)',
        border: '1px solid hsl(220, 10%, 18%)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 0 40px hsla(145, 63%, 42%, 0.12)',
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 1rem',
        background: 'hsl(220, 14%, 8%)',
        borderBottom: '1px solid hsl(220, 10%, 18%)',
    },
    select: {
        flex: 1,
        padding: '0.4rem 0.6rem',
        background: 'hsl(220, 18%, 6%)',
        color: 'hsl(0, 0%, 85%)',
        border: '1px solid hsl(220, 10%, 22%)',
        borderRadius: '6px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.8rem',
        cursor: 'pointer',
    },
    settingsBtn: {
        padding: '0.4rem 0.8rem',
        background: 'transparent',
        color: 'hsl(0, 0%, 75%)',
        border: '1px solid hsl(220, 10%, 22%)',
        borderRadius: '6px',
        fontSize: '0.75rem',
        cursor: 'pointer',
        fontFamily: "'JetBrains Mono', monospace",
        whiteSpace: 'nowrap' as const,
        transition: 'border-color 0.15s ease',
    },
    runButton: {
        padding: '0.4rem 1rem',
        background: 'hsl(145, 63%, 42%)',
        color: 'hsl(220, 18%, 6%)',
        border: 'none',
        borderRadius: '6px',
        fontWeight: 600,
        fontSize: '0.8rem',
        cursor: 'pointer',
        fontFamily: "'JetBrains Mono', monospace",
        transition: 'opacity 0.15s ease',
        whiteSpace: 'nowrap' as const,
    },
    settingsPanel: {
        padding: '1rem',
        background: 'hsl(220, 16%, 8%)',
        borderBottom: '1px solid hsl(220, 10%, 18%)',
    },
    settingsHeader: {
        display: 'flex',
        alignItems: 'baseline',
        gap: '0.75rem',
        marginBottom: '0.75rem',
    },
    settingsTitle: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.8rem',
        fontWeight: 600,
        color: 'hsl(0, 0%, 90%)',
    },
    settingsHint: {
        fontSize: '0.7rem',
        color: 'hsl(220, 8%, 45%)',
    },
    settingsFields: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem',
        marginBottom: '0.75rem',
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.25rem',
    },
    label: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.65rem',
        color: 'hsl(220, 8%, 55%)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
    },
    input: {
        padding: '0.45rem 0.6rem',
        background: 'hsl(220, 18%, 6%)',
        color: 'hsl(0, 0%, 85%)',
        border: '1px solid hsl(220, 10%, 22%)',
        borderRadius: '6px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.8rem',
        outline: 'none',
    },
    settingsActions: {
        display: 'flex',
        gap: '0.5rem',
    },
    saveBtn: {
        padding: '0.35rem 1rem',
        background: 'hsl(145, 55%, 38%)',
        color: 'hsl(220, 18%, 6%)',
        border: 'none',
        borderRadius: '6px',
        fontWeight: 600,
        fontSize: '0.75rem',
        cursor: 'pointer',
        fontFamily: "'JetBrains Mono', monospace",
    },
    clearBtn: {
        padding: '0.35rem 0.8rem',
        background: 'transparent',
        color: 'hsl(0, 60%, 60%)',
        border: '1px solid hsl(0, 40%, 30%)',
        borderRadius: '6px',
        fontSize: '0.75rem',
        cursor: 'pointer',
        fontFamily: "'JetBrains Mono', monospace",
    },
    cancelBtn: {
        padding: '0.35rem 0.8rem',
        background: 'transparent',
        color: 'hsl(220, 8%, 55%)',
        border: '1px solid hsl(220, 10%, 22%)',
        borderRadius: '6px',
        fontSize: '0.75rem',
        cursor: 'pointer',
        fontFamily: "'JetBrains Mono', monospace",
    },
    errorBanner: {
        padding: '0.5rem 1rem',
        background: 'hsla(0, 60%, 40%, 0.15)',
        borderBottom: '1px solid hsla(0, 60%, 40%, 0.3)',
        color: 'hsl(0, 70%, 70%)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.75rem',
    },
    main: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '380px',
    },
    editorPane: {
        display: 'flex',
        flexDirection: 'column' as const,
        borderRight: '1px solid hsl(220, 10%, 18%)',
    },
    outputPane: {
        display: 'flex',
        flexDirection: 'column' as const,
    },
    paneHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        padding: '0 0.75rem',
        height: '36px',
        background: 'hsl(220, 14%, 7%)',
        borderBottom: '1px solid hsl(220, 10%, 18%)',
    },
    paneTitle: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.7rem',
        color: 'hsl(220, 8%, 50%)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        marginRight: '0.5rem',
    },
    modeBadge: {
        padding: '0.1rem 0.4rem',
        background: 'hsla(220, 10%, 50%, 0.15)',
        border: '1px solid hsl(220, 10%, 25%)',
        borderRadius: '4px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.55rem',
        color: 'hsl(220, 8%, 50%)',
        letterSpacing: '0.06em',
    },
    liveBadge: {
        padding: '0.1rem 0.4rem',
        background: 'hsla(145, 55%, 38%, 0.15)',
        border: '1px solid hsla(145, 55%, 38%, 0.3)',
        borderRadius: '4px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.55rem',
        color: 'hsl(145, 60%, 58%)',
        letterSpacing: '0.06em',
    },
    tab: {
        padding: '0.35rem 0.75rem',
        background: 'none',
        border: 'none',
        color: 'hsl(220, 8%, 50%)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.7rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        cursor: 'pointer',
        borderBottom: '2px solid transparent',
        transition: 'color 0.15s ease',
    },
    activeTab: {
        color: 'hsl(145, 63%, 55%)',
        borderBottomColor: 'hsl(145, 63%, 42%)',
    },
    copyBtn: {
        marginLeft: 'auto',
        padding: '0.2rem 0.5rem',
        background: 'transparent',
        border: '1px solid hsl(220, 10%, 22%)',
        borderRadius: '4px',
        color: 'hsl(220, 8%, 55%)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.6rem',
        cursor: 'pointer',
    },
    editor: {
        flex: 1,
        overflow: 'auto',
    },
    output: {
        flex: 1,
        overflow: 'auto',
        padding: '1rem',
    },
    json: {
        margin: 0,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.8rem',
        lineHeight: 1.6,
        color: 'hsl(145, 60%, 60%)',
        whiteSpace: 'pre-wrap' as const,
    },
    placeholder: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'hsl(220, 8%, 40%)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.8rem',
        textAlign: 'center' as const,
        padding: '2rem',
        lineHeight: 1.6,
    },

    // Image picker
    imagePicker: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.65rem 1rem',
        background: 'hsl(220, 14%, 7%)',
        borderBottom: '1px solid hsl(220, 10%, 18%)',
        overflowX: 'auto' as const,
    },
    imagePickerLabel: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.65rem',
        color: 'hsl(220, 8%, 45%)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap' as const,
    },
    imageGrid: {
        display: 'flex',
        gap: '0.5rem',
    },
    imageThumb: {
        position: 'relative' as const,
        padding: 0,
        background: 'none',
        border: '2px solid transparent',
        borderRadius: '8px',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'border-color 0.15s ease, transform 0.15s ease',
        flexShrink: 0,
    },
    imageThumbImg: {
        display: 'block',
        width: '72px',
        height: '48px',
        objectFit: 'cover' as const,
        borderRadius: '6px',
    },
    imageThumbLabel: {
        position: 'absolute' as const,
        bottom: 0,
        left: 0,
        right: 0,
        padding: '1px 0',
        background: 'hsla(0, 0%, 0%, 0.7)',
        color: 'hsl(0, 0%, 85%)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.5rem',
        textAlign: 'center' as const,
        letterSpacing: '0.03em',
        borderRadius: '0 0 6px 6px',
    },

    // Warning banner
    warningBanner: {
        padding: '0.55rem 1rem',
        background: 'hsla(40, 70%, 40%, 0.12)',
        borderBottom: '1px solid hsla(40, 70%, 40%, 0.25)',
        color: 'hsl(40, 60%, 65%)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.72rem',
        lineHeight: 1.5,
    },
    inlineCode: {
        padding: '0.1rem 0.35rem',
        background: 'hsla(40, 70%, 40%, 0.12)',
        border: '1px solid hsla(40, 70%, 40%, 0.2)',
        borderRadius: '3px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.7rem',
    },
};
