import { WhatsApp } from '@core/whatsapp';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Contact Book API - Unit Tests', () => {
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
            messaging_product: 'whatsapp',
            success: true,
            deleted: true,
        });
    });

    it('deletes a contact book entry by BSUID', async () => {
        const result = await whatsApp.contactBook.deleteEntry({ bsuid: 'US.13491208655302741918' });

        const [method, endpoint] = mockRequestSend.mock.calls[0];
        expect(method).toBe('DELETE');
        expect(endpoint).toBe(
            `${whatsApp.requester.phoneNumberId}/contact_book?messaging_product=whatsapp&bsuid=US.13491208655302741918`,
        );
        expect(result.deleted).toBe(true);
    });

    it('rejects a delete without a BSUID', async () => {
        await expect(whatsApp.contactBook.deleteEntry({ bsuid: '' })).rejects.toThrow(
            '"bsuid" is required to delete a contact book entry.',
        );
        expect(mockRequestSend).not.toHaveBeenCalled();
    });
});
