import { WhatsApp } from '@core/whatsapp';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Commerce API - Unit Tests', () => {
    let whatsApp: WhatsApp;
    let mockRequestSend: any;

    beforeEach(() => {
        whatsApp = new WhatsApp({
            accessToken: process.env.CLOUD_API_ACCESS_TOKEN || 'test_token',
            phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID) || 123456789,
            businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID || 'test_business_id',
        });

        mockRequestSend = vi.spyOn(whatsApp.requester, 'getJson');
        mockRequestSend.mockResolvedValue({
            data: [{ id: 'catalog_1', is_cart_enabled: true, is_catalog_visible: true }],
        });
    });

    it('gets commerce settings', async () => {
        await whatsApp.commerce.getCommerceSettings();

        const [method, endpoint] = mockRequestSend.mock.calls[0];
        expect(method).toBe('GET');
        expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/whatsapp_commerce_settings`);
    });

    it('updates commerce settings with query params', async () => {
        await whatsApp.commerce.updateCommerceSettings({ is_cart_enabled: true, is_catalog_visible: false });

        const [method, endpoint, _, body] = mockRequestSend.mock.calls[0];
        expect(method).toBe('POST');
        expect(endpoint).toBe(
            `${whatsApp.requester.phoneNumberId}/whatsapp_commerce_settings?is_cart_enabled=true&is_catalog_visible=false`,
        );
        expect(body).toBeNull();
    });
});
