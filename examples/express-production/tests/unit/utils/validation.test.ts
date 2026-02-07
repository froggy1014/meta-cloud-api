import { describe, it, expect } from 'vitest';
import {
    isValidPhoneNumber,
    isValidEmail,
    isValidUrl,
    isValidTicketNumber,
    isValidCuid,
    normalizePhoneNumber,
    isValidLength,
    isAlphanumeric,
    isValidDate,
    isInRange,
} from '../../../src/utils/validation.js';

describe('Validation Utilities', () => {
    describe('isValidPhoneNumber', () => {
        it('should validate correct phone numbers', () => {
            expect(isValidPhoneNumber('14155552671')).toBe(true);
            expect(isValidPhoneNumber('1234567890')).toBe(true);
            expect(isValidPhoneNumber('123456789012345')).toBe(true);
        });

        it('should reject invalid phone numbers', () => {
            expect(isValidPhoneNumber('123')).toBe(false);
            expect(isValidPhoneNumber('12345678901234567890')).toBe(false);
            expect(isValidPhoneNumber('abcdefghij')).toBe(false);
            expect(isValidPhoneNumber('123-456-7890')).toBe(false);
        });
    });

    describe('isValidEmail', () => {
        it('should validate correct emails', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name@example.co.uk')).toBe(true);
            expect(isValidEmail('user+tag@example.com')).toBe(true);
        });

        it('should reject invalid emails', () => {
            expect(isValidEmail('invalid')).toBe(false);
            expect(isValidEmail('invalid@')).toBe(false);
            expect(isValidEmail('@example.com')).toBe(false);
            expect(isValidEmail('invalid@example')).toBe(false);
        });
    });

    describe('isValidUrl', () => {
        it('should validate correct URLs', () => {
            expect(isValidUrl('https://example.com')).toBe(true);
            expect(isValidUrl('http://example.com')).toBe(true);
            expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
        });

        it('should reject invalid URLs', () => {
            expect(isValidUrl('invalid')).toBe(false);
            expect(isValidUrl('example.com')).toBe(false);
            expect(isValidUrl('htp://example.com')).toBe(false);
        });
    });

    describe('isValidTicketNumber', () => {
        it('should validate correct ticket numbers', () => {
            expect(isValidTicketNumber('T-10001')).toBe(true);
            expect(isValidTicketNumber('T-99999')).toBe(true);
        });

        it('should reject invalid ticket numbers', () => {
            expect(isValidTicketNumber('T-1234')).toBe(false);
            expect(isValidTicketNumber('T-123456')).toBe(false);
            expect(isValidTicketNumber('10001')).toBe(false);
            expect(isValidTicketNumber('T-ABCDE')).toBe(false);
        });
    });

    describe('isValidCuid', () => {
        it('should validate correct CUIDs', () => {
            expect(isValidCuid('clp3xj8ks0000qzr0d7h8j8ks')).toBe(true);
        });

        it('should reject invalid CUIDs', () => {
            expect(isValidCuid('123')).toBe(false);
            expect(isValidCuid('invalid-cuid')).toBe(false);
        });
    });

    describe('normalizePhoneNumber', () => {
        it('should remove formatting characters', () => {
            expect(normalizePhoneNumber('(415) 555-2671')).toBe('4155552671');
            expect(normalizePhoneNumber('415-555-2671')).toBe('4155552671');
            expect(normalizePhoneNumber('415 555 2671')).toBe('4155552671');
        });

        it('should preserve already normalized numbers', () => {
            expect(normalizePhoneNumber('14155552671')).toBe('14155552671');
        });
    });

    describe('isValidLength', () => {
        it('should validate string length', () => {
            expect(isValidLength('hello', 1, 10)).toBe(true);
            expect(isValidLength('hello', 5, 5)).toBe(true);
        });

        it('should reject invalid lengths', () => {
            expect(isValidLength('hi', 5, 10)).toBe(false);
            expect(isValidLength('hello world', 1, 5)).toBe(false);
        });

        it('should trim whitespace', () => {
            expect(isValidLength('  hello  ', 5, 5)).toBe(true);
        });
    });

    describe('isAlphanumeric', () => {
        it('should validate alphanumeric strings', () => {
            expect(isAlphanumeric('abc123')).toBe(true);
            expect(isAlphanumeric('ABC')).toBe(true);
            expect(isAlphanumeric('123')).toBe(true);
        });

        it('should reject non-alphanumeric strings', () => {
            expect(isAlphanumeric('abc-123')).toBe(false);
            expect(isAlphanumeric('abc 123')).toBe(false);
            expect(isAlphanumeric('abc@123')).toBe(false);
        });
    });

    describe('isValidDate', () => {
        it('should validate valid date strings', () => {
            expect(isValidDate('2024-01-01')).toBe(true);
            expect(isValidDate('2024-01-01T00:00:00Z')).toBe(true);
        });

        it('should reject invalid date strings', () => {
            expect(isValidDate('invalid')).toBe(false);
            expect(isValidDate('2024-13-01')).toBe(false);
        });
    });

    describe('isInRange', () => {
        it('should validate numbers in range', () => {
            expect(isInRange(5, 1, 10)).toBe(true);
            expect(isInRange(1, 1, 10)).toBe(true);
            expect(isInRange(10, 1, 10)).toBe(true);
        });

        it('should reject numbers out of range', () => {
            expect(isInRange(0, 1, 10)).toBe(false);
            expect(isInRange(11, 1, 10)).toBe(false);
        });
    });
});
