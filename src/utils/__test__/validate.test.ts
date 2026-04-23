import { describe, expect, it } from 'vitest';
import { WhatsAppValidationError } from '../isMetaError';
import { assertNonEmpty, assertPhoneNumber } from '../validate';

describe('assertPhoneNumber', () => {
    it('accepts valid E.164 with + prefix', () => {
        expect(() => assertPhoneNumber('+14155552671')).not.toThrow();
        expect(() => assertPhoneNumber('+821012345678')).not.toThrow();
        expect(() => assertPhoneNumber('+5511987654321')).not.toThrow();
    });

    it('accepts valid numbers without + prefix', () => {
        expect(() => assertPhoneNumber('14155552671')).not.toThrow();
        expect(() => assertPhoneNumber('821012345678')).not.toThrow();
    });

    it('throws WhatsAppValidationError for too short number', () => {
        expect(() => assertPhoneNumber('123')).toThrow(WhatsAppValidationError);
        expect(() => assertPhoneNumber('+123')).toThrow(WhatsAppValidationError);
    });

    it('throws WhatsAppValidationError for too long number', () => {
        expect(() => assertPhoneNumber('1234567890123456')).toThrow(WhatsAppValidationError);
    });

    it('throws WhatsAppValidationError for letters in number', () => {
        expect(() => assertPhoneNumber('+1415abc5671')).toThrow(WhatsAppValidationError);
        expect(() => assertPhoneNumber('phone_number')).toThrow(WhatsAppValidationError);
    });

    it('throws WhatsAppValidationError for empty string', () => {
        expect(() => assertPhoneNumber('')).toThrow(WhatsAppValidationError);
    });

    it('error message includes the invalid value', () => {
        expect(() => assertPhoneNumber('bad')).toThrow('Invalid phone number: "bad"');
    });
});

describe('assertNonEmpty', () => {
    it('accepts non-empty array', () => {
        expect(() => assertNonEmpty(['item'], 'items')).not.toThrow();
        expect(() => assertNonEmpty([1, 2, 3], 'numbers')).not.toThrow();
    });

    it('throws WhatsAppValidationError for empty array', () => {
        expect(() => assertNonEmpty([], 'users')).toThrow(WhatsAppValidationError);
    });

    it('error message includes the field name', () => {
        expect(() => assertNonEmpty([], 'participants')).toThrow('"participants" must contain at least one item.');
    });
});
