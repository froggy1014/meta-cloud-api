import { describe, expect, it } from 'vitest';
import WhatsAppDefault, { WhatsApp } from '../index';

describe('package entry exports', () => {
    it('exposes WhatsApp as both the default and a named export', () => {
        expect(WhatsAppDefault).toBe(WhatsApp);
        expect(typeof WhatsAppDefault).toBe('function');
    });
});
