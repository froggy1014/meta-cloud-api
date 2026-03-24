export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from 'next/server';
import { getSDK } from '@/lib/sdk';

// GET: check current webhook override for this WABA
export async function GET() {
    try {
        const sdk = getSDK();
        const result = await sdk.waba.getAllWabaSubscriptions();
        const app = (result as any).data?.[0];

        return NextResponse.json({
            currentUrl: app?.override_callback_uri || null,
            appName: app?.whatsapp_business_api_data?.name || null,
            sdkCode: 'sdk.waba.getAllWabaSubscriptions()',
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// POST: override webhook URL at WABA level
export async function POST(request: NextRequest) {
    try {
        const { callbackUrl } = await request.json();
        if (!callbackUrl) {
            return NextResponse.json({ error: 'callbackUrl required' }, { status: 400 });
        }

        const sdk = getSDK();
        const result = await sdk.waba.updateWabaSubscription({
            override_callback_uri: callbackUrl,
            verify_token: process.env.WEBHOOK_VERIFICATION_TOKEN!,
        });

        return NextResponse.json({
            ...(result as object),
            callbackUrl,
            sdkCode: `sdk.waba.updateWabaSubscription({\n  override_callback_uri: "${callbackUrl}",\n  verify_token: "***"\n})`,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
