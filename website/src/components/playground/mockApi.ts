export interface ApiResult {
    request: {
        method: string;
        url: string;
        headers: Record<string, string>;
        body: unknown;
    };
    response: {
        status: number;
        body: unknown;
    };
    mode: 'live' | 'mock';
}

export interface Credentials {
    accessToken: string;
    phoneNumberId: string;
}

const API_VERSION = 'v21.0';

function buildUrl(phoneNumberId: string): string {
    return `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`;
}

function messageId(): string {
    return `wamid.HBgL${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
}

interface Example {
    label: string;
    payload: Record<string, unknown>;
}

const examples: Record<string, Example> = {
    'send-text': {
        label: 'Send Text Message',
        payload: {
            messaging_product: 'whatsapp',
            to: '821089791169',
            type: 'text',
            text: { body: 'Hello from the playground!' },
        },
    },
    'send-image': {
        label: 'Send Image',
        payload: {
            messaging_product: 'whatsapp',
            to: '821089791169',
            type: 'image',
            image: {
                link: 'https://example.com/photo.jpg',
                caption: 'Check this out!',
            },
        },
    },
    'send-template': {
        label: 'Send Template',
        payload: {
            messaging_product: 'whatsapp',
            to: '821089791169',
            type: 'template',
            template: {
                name: 'hello_world',
                language: { code: 'en_US' },
            },
        },
    },
    'send-interactive': {
        label: 'Send Interactive List',
        payload: {
            messaging_product: 'whatsapp',
            to: '821089791169',
            type: 'interactive',
            interactive: {
                type: 'list',
                body: { text: 'Choose an option:' },
                action: {
                    button: 'View Options',
                    sections: [
                        {
                            title: 'Menu',
                            rows: [
                                { id: 'opt_1', title: 'Option 1' },
                                { id: 'opt_2', title: 'Option 2' },
                            ],
                        },
                    ],
                },
            },
        },
    },
};

export function getExamples() {
    return Object.entries(examples).map(([key, { label }]) => ({
        key,
        label,
    }));
}

export function getExamplePayload(key: string): string {
    const example = examples[key] ?? examples['send-text']!;
    return JSON.stringify(example.payload, null, 2);
}

/** Execute against real WhatsApp Cloud API */
export async function executeLive(
    payloadJson: string,
    creds: Credentials,
): Promise<ApiResult> {
    const body = JSON.parse(payloadJson);
    const url = buildUrl(creds.phoneNumberId);

    const request: ApiResult['request'] = {
        method: 'POST',
        url,
        headers: {
            Authorization: `Bearer ${creds.accessToken.slice(0, 12)}...`,
            'Content-Type': 'application/json',
        },
        body,
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${creds.accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const responseBody = await res.json();

    return {
        request,
        response: { status: res.status, body: responseBody },
        mode: 'live',
    };
}

/** Execute with mock data */
export async function executeMock(payloadJson: string): Promise<ApiResult> {
    await new Promise((resolve) =>
        setTimeout(resolve, 200 + Math.random() * 300),
    );

    const body = JSON.parse(payloadJson);

    return {
        request: {
            method: 'POST',
            url: buildUrl('123456789'),
            headers: {
                Authorization: 'Bearer <ACCESS_TOKEN>',
                'Content-Type': 'application/json',
            },
            body,
        },
        response: {
            status: 200,
            body: {
                messaging_product: 'whatsapp',
                contacts: [
                    { input: body.to || '821089791169', wa_id: body.to || '821089791169' },
                ],
                messages: [{ id: messageId() }],
            },
        },
        mode: 'mock',
    };
}

export function buildCurl(result: ApiResult, rawToken?: string): string {
    const headers = { ...result.request.headers };
    if (rawToken) {
        headers.Authorization = `Bearer ${rawToken}`;
    }
    const h = Object.entries(headers)
        .map(([k, v]) => `  -H '${k}: ${v}'`)
        .join(' \\\n');
    return `curl -X ${result.request.method} '${result.request.url}' \\\n${h} \\\n  -d '${JSON.stringify(result.request.body, null, 2)}'`;
}
