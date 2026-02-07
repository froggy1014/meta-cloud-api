/**
 * Validation utilities
 */

/**
 * Validate phone number format
 * Accepts international format without + (10-15 digits)
 */
export function isValidPhoneNumber(phone: string): boolean {
    return /^\d{10,15}$/.test(phone);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Sanitize string input
 * Removes potentially dangerous characters
 */
export function sanitizeString(input: string): string {
    return input.replace(/[<>\"']/g, '').trim();
}

/**
 * Validate ticket number format (T-XXXXX)
 */
export function isValidTicketNumber(ticketNumber: string): boolean {
    return /^T-\d{5}$/.test(ticketNumber);
}

/**
 * Validate CUID format
 */
export function isValidCuid(id: string): boolean {
    return /^c[a-z0-9]{24}$/.test(id);
}

/**
 * Normalize phone number
 * Removes spaces, dashes, and parentheses
 */
export function normalizePhoneNumber(phone: string): string {
    return phone.replace(/[\s\-\(\)]/g, '');
}

/**
 * Validate string length
 */
export function isValidLength(str: string, min: number, max: number): boolean {
    const length = str.trim().length;
    return length >= min && length <= max;
}

/**
 * Check if string contains only alphanumeric characters
 */
export function isAlphanumeric(str: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Validate date string
 */
export function isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Check if value is within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
}
