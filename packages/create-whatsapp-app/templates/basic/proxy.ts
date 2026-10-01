import { type NextRequest, NextResponse } from 'next/server';
import { authorizeDashboard } from './lib/dashboard-auth';

export function proxy(request: NextRequest) {
    // Meta must reach this endpoint without browser authentication.
    // Its POST handler independently requires Meta's App Secret signature.
    if (request.nextUrl.pathname === '/api/webhook') return NextResponse.next();
    return authorizeDashboard(request) ?? NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
