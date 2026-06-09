import { WhatsApp } from '@core/whatsapp';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Solutions API - Unit Tests', () => {
    let whatsApp: WhatsApp;
    let mockGetJson: any;

    beforeEach(() => {
        whatsApp = new WhatsApp({
            accessToken: 'test_token',
            phoneNumberId: 123456789,
            businessAcctId: 'waba_123',
        });

        mockGetJson = vi.spyOn(whatsApp.requester, 'getJson');
        mockGetJson.mockResolvedValue({ success: true });
    });

    it('creates a multi-partner solution', async () => {
        await whatsApp.solutions.createWhatsAppBusinessSolution('app_123', { partner_app_id: 'partner_app_123' });

        const [method, endpoint, _, body] = mockGetJson.mock.calls[0];
        expect(method).toBe('POST');
        expect(endpoint).toBe('app_123/whatsapp_business_solution');
        expect(JSON.parse(body)).toEqual({ partner_app_id: 'partner_app_123' });
    });

    it('gets and accepts a solution', async () => {
        await whatsApp.solutions.getSolutionDetails('solution_123', ['id', 'status']);

        expect(mockGetJson.mock.calls[0][0]).toBe('GET');
        expect(mockGetJson.mock.calls[0][1]).toBe('solution_123?fields=id%2Cstatus');

        mockGetJson.mockClear();
        await whatsApp.solutions.acceptSolution('solution_123', { partner_app_id: 'partner_app_123' });

        expect(mockGetJson.mock.calls[0][0]).toBe('POST');
        expect(mockGetJson.mock.calls[0][1]).toBe('solution_123/accept');
    });

    it('lists WABA solutions using configured WABA id', async () => {
        await whatsApp.solutions.listWabaSolutions(undefined, { status: 'ACTIVE' });

        const [method, endpoint, _, body] = mockGetJson.mock.calls[0];
        expect(method).toBe('GET');
        expect(endpoint).toBe('waba_123/solutions?status=ACTIVE');
        expect(body).toBeNull();
    });
});
