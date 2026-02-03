import { describe, expect, it } from 'vitest';

import {
    createWhatsAppApiError,
    isAuthorizationErrorCode,
    isWhatsAppErrorCode,
    WhatsAppApiError,
    WhatsAppAuthorizationError,
    WhatsAppBlockUserError,
    WhatsAppCallingError,
    WhatsAppFlowError,
    WhatsAppGroupError,
    WhatsAppIntegrityError,
    WhatsAppSendMessageError,
    WhatsAppThrottlingError,
} from '../isMetaError';

const buildError = (code: number) => ({
    message: 'error message',
    type: 'OAuthException',
    code,
    fbtrace_id: 'trace',
});

describe('WhatsApp error mapping', () => {
    it('maps authorization errors', () => {
        const error = createWhatsAppApiError(buildError(190));
        expect(error).toBeInstanceOf(WhatsAppAuthorizationError);
    });

    it('maps throttling errors', () => {
        const error = createWhatsAppApiError(buildError(131048));
        expect(error).toBeInstanceOf(WhatsAppThrottlingError);
    });

    it('maps integrity errors', () => {
        const error = createWhatsAppApiError(buildError(131031));
        expect(error).toBeInstanceOf(WhatsAppIntegrityError);
    });

    it('maps send message errors', () => {
        const error = createWhatsAppApiError(buildError(131026));
        expect(error).toBeInstanceOf(WhatsAppSendMessageError);
    });

    it('maps flow errors', () => {
        const error = createWhatsAppApiError(buildError(139000));
        expect(error).toBeInstanceOf(WhatsAppFlowError);
    });

    it('maps block user errors', () => {
        const error = createWhatsAppApiError(buildError(139100));
        expect(error).toBeInstanceOf(WhatsAppBlockUserError);
    });

    it('maps calling errors', () => {
        const error = createWhatsAppApiError(buildError(138000));
        expect(error).toBeInstanceOf(WhatsAppCallingError);
    });

    it('maps group errors', () => {
        const error = createWhatsAppApiError(buildError(131020));
        expect(error).toBeInstanceOf(WhatsAppGroupError);
    });

    it('falls back to base error for uncategorized codes', () => {
        const error = createWhatsAppApiError(buildError(133000));
        expect(error).toBeInstanceOf(WhatsAppApiError);
    });
});

describe('WhatsApp error code guards', () => {
    it('recognizes permission range codes', () => {
        expect(isAuthorizationErrorCode(200)).toBe(true);
        expect(isAuthorizationErrorCode(299)).toBe(true);
    });

    it('recognizes known codes', () => {
        expect(isWhatsAppErrorCode(131020)).toBe(true);
        expect(isWhatsAppErrorCode(139004)).toBe(true);
    });
});
