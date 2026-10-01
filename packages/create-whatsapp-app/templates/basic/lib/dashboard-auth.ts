import { timingSafeEqual } from 'node:crypto';

/** Browser Basic Auth also protects fetch and EventSource requests. */
export function authorizeDashboard(request: Request): Response | null {
    const live = Boolean(process.env.CLOUD_API_ACCESS_TOKEN && process.env.WA_PHONE_NUMBER_ID);
    if (!live) return null;
    const origin = request.headers.get('origin');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && origin && origin !== new URL(request.url).origin) {
        return new Response('Cross-origin dashboard request denied', { status: 403 });
    }
    const password = process.env.DASHBOARD_PASSWORD;
    if (!password) return new Response('Set DASHBOARD_PASSWORD before using the live dashboard.', { status: 503 });
    const expected = Buffer.from(`Basic ${Buffer.from(`admin:${password}`).toString('base64')}`);
    const actual = Buffer.from(request.headers.get('authorization') ?? '');
    if (actual.length === expected.length && timingSafeEqual(actual, expected)) return null;
    return new Response('Dashboard authentication required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="WhatsApp dashboard", charset="UTF-8"',
            'Cache-Control': 'no-store',
        },
    });
}
