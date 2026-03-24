export interface PredefinedResponse {
    id: string;
    label: string;
    icon: string;
    category: 'basic' | 'interactive' | 'special';
    type: string;
    // The payload sent to /api/respond
    payload: Record<string, unknown>;
    // Whether this requires an active 24h window (false = template, works anytime)
    requiresWindow: boolean;
}

export const PREDEFINED_RESPONSES: PredefinedResponse[] = [
    // Basic
    {
        id: 'hello',
        label: 'Hello!',
        icon: '📝',
        category: 'basic',
        type: 'text',
        payload: { body: 'Hello from meta-cloud-api SDK Demo! 👋' },
        requiresWindow: true,
    },
    {
        id: 'image',
        label: 'Image',
        icon: '📷',
        category: 'basic',
        type: 'image',
        payload: {
            link: 'https://raw.githubusercontent.com/froggy1014/meta-cloud-api/main/website/public/meta-cloud-api.png',
            caption: 'Sent via meta-cloud-api SDK',
        },
        requiresWindow: true,
    },
    {
        id: 'video',
        label: 'Video',
        icon: '🎬',
        category: 'basic',
        type: 'video',
        payload: {
            link: 'https://filesamples.com/samples/video/mp4/sample_640x360.mp4',
            caption: 'Sample video from SDK Demo',
        },
        requiresWindow: true,
    },
    {
        id: 'document',
        label: 'Document',
        icon: '📄',
        category: 'basic',
        type: 'document',
        payload: {
            link: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            filename: 'sdk-demo.pdf',
            caption: 'PDF sent via SDK',
        },
        requiresWindow: true,
    },
    // Interactive
    {
        id: 'buttons',
        label: 'Buttons',
        icon: '🔘',
        category: 'interactive',
        type: 'interactive_buttons',
        payload: {
            body: 'Which SDK feature interests you most?',
            buttons: [
                { type: 'reply', reply: { id: 'btn_msg', title: 'Messaging' } },
                { type: 'reply', reply: { id: 'btn_tmpl', title: 'Templates' } },
                { type: 'reply', reply: { id: 'btn_flow', title: 'Flows' } },
            ],
        },
        requiresWindow: true,
    },
    {
        id: 'list',
        label: 'List',
        icon: '📋',
        category: 'interactive',
        type: 'interactive_list',
        payload: {
            body: 'Explore the SDK capabilities:',
            buttonText: 'View Features',
            sections: [
                {
                    title: 'Messaging',
                    rows: [
                        { id: 'row_text', title: 'Text Messages', description: 'Send plain text' },
                        { id: 'row_media', title: 'Media Messages', description: 'Images, video, audio, docs' },
                        { id: 'row_interactive', title: 'Interactive', description: 'Buttons, lists, CTAs' },
                    ],
                },
                {
                    title: 'Business',
                    rows: [
                        { id: 'row_template', title: 'Templates', description: 'Pre-approved messages' },
                        { id: 'row_profile', title: 'Business Profile', description: 'Manage your profile' },
                    ],
                },
            ],
        },
        requiresWindow: true,
    },
    {
        id: 'cta',
        label: 'CTA URL',
        icon: '🔗',
        category: 'interactive',
        type: 'cta_url',
        payload: {
            body: 'Check out the meta-cloud-api SDK:',
            displayText: 'View on npm',
            url: 'https://www.npmjs.com/package/meta-cloud-api',
        },
        requiresWindow: true,
    },
    // Special
    {
        id: 'location',
        label: 'Location',
        icon: '📍',
        category: 'special',
        type: 'location',
        payload: {
            latitude: '37.5665',
            longitude: '126.9780',
            name: 'Seoul City Hall',
            address: 'Seoul, South Korea',
        },
        requiresWindow: true,
    },
    {
        id: 'contact',
        label: 'Contact',
        icon: '👤',
        category: 'special',
        type: 'contacts',
        payload: {
            contactName: 'SDK Demo Support',
            contactPhone: '+1234567890',
        },
        requiresWindow: true,
    },
    {
        id: 'reaction',
        label: 'Reaction',
        icon: '👍',
        category: 'special',
        type: 'reaction',
        payload: {
            emoji: '🚀',
        },
        requiresWindow: true,
    },
    {
        id: 'template',
        label: 'Template',
        icon: '📋',
        category: 'special',
        type: 'template',
        payload: {
            name: 'sdk_demo_greeting',
            language: 'en_US',
        },
        requiresWindow: false, // Works outside 24h window
    },
    {
        id: 'flow',
        label: 'Flow',
        icon: '🔀',
        category: 'special',
        type: 'flow',
        payload: {
            flowId: '1610873430062667',
            flowName: 'SDK Demo Feedback',
            body: "We'd love your feedback! Tap the button below to share your thoughts.",
            flowCta: 'Give Feedback',
        },
        requiresWindow: true,
    },
    {
        id: 'mark_read',
        label: 'Mark Read',
        icon: '✓✓',
        category: 'special',
        type: 'mark_as_read',
        payload: {},
        requiresWindow: true,
    },
];

export const CATEGORIES = [
    { key: 'basic' as const, label: 'Basic' },
    { key: 'interactive' as const, label: 'Interactive' },
    { key: 'special' as const, label: 'Special' },
];
