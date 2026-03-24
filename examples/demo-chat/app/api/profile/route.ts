export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from 'next/server';
import { getSDK } from '@/lib/sdk';

export async function GET() {
    try {
        const sdk = getSDK();
        const result = await sdk.businessProfile.getBusinessProfile();
        const sdkCode = `sdk.businessProfile.getBusinessProfile()`;
        return NextResponse.json({ ...(result as object), sdkCode });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const sdk = getSDK();
        const result = await sdk.businessProfile.updateBusinessProfile(body);
        const sdkCode = `sdk.businessProfile.updateBusinessProfile(${JSON.stringify(body, null, 2)})`;
        return NextResponse.json({ ...(result as object), sdkCode });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
