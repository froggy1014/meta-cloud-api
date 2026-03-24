const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 30;

const windows: Map<string, number[]> = new Map();

export function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const timestamps = windows.get(ip) ?? [];

    // Remove expired entries
    const valid = timestamps.filter((t) => now - t < WINDOW_MS);

    if (valid.length >= MAX_REQUESTS) {
        windows.set(ip, valid);
        return false; // Rate limited
    }

    valid.push(now);
    windows.set(ip, valid);
    return true; // Allowed
}

export function getClientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return '127.0.0.1';
}
