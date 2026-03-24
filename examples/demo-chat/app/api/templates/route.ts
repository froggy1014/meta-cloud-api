export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from 'next/server';
import { getSDK } from '@/lib/sdk';

export async function GET() {
    try {
        const sdk = getSDK();
        const result = await sdk.templates.getTemplates();
        const sdkCode = `sdk.templates.getTemplates()`;
        return NextResponse.json({ ...(result as object), sdkCode });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { name } = await request.json();
        if (!name) return NextResponse.json({ error: 'Template name required' }, { status: 400 });

        const sdk = getSDK();
        const result = await sdk.templates.deleteTemplate({ name });
        const sdkCode = `sdk.templates.deleteTemplate({ name: "${name}" })`;
        return NextResponse.json({ ...(result as object), sdkCode });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
