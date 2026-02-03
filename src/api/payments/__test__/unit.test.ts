import { WhatsApp } from '@core/whatsapp';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Payments API - Unit Tests', () => {
    let whatsApp: WhatsApp;
    let mockRequestSend: any;

    beforeEach(() => {
        whatsApp = new WhatsApp({
            accessToken: process.env.CLOUD_API_ACCESS_TOKEN || 'test_token',
            phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID) || 123456789,
            businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID || 'test_business_id',
        });

        mockRequestSend = vi.spyOn(whatsApp.requester, 'getJson');
        mockRequestSend.mockResolvedValue({ success: true });
    });

    it('lists payment configurations', async () => {
        await whatsApp.payments.listPaymentConfigurations('waba_1');

        const [method, endpoint] = mockRequestSend.mock.calls[0];
        expect(method).toBe('GET');
        expect(endpoint).toBe('/waba_1/payment_configurations');
    });

    it('gets a payment configuration', async () => {
        await whatsApp.payments.getPaymentConfiguration('waba_1', 'test-config');

        const [method, endpoint] = mockRequestSend.mock.calls[0];
        expect(method).toBe('GET');
        expect(endpoint).toBe('/waba_1/payment_configuration/test-config');
    });

    it('creates a payment configuration', async () => {
        await whatsApp.payments.createPaymentConfiguration('waba_1', {
            configuration_name: 'test-config',
            provider_name: 'razorpay',
            redirect_url: 'https://example.com',
        });

        const [method, endpoint, _, body] = mockRequestSend.mock.calls[0];
        expect(method).toBe('POST');
        expect(endpoint).toBe('/waba_1/payment_configuration');
        expect(JSON.parse(body)).toEqual({
            configuration_name: 'test-config',
            provider_name: 'razorpay',
            redirect_url: 'https://example.com',
        });
    });

    it('updates a payment configuration', async () => {
        await whatsApp.payments.updatePaymentConfiguration('waba_1', 'test-config', {
            redirect_url: 'https://example.com/redirect',
        });

        const [method, endpoint, _, body] = mockRequestSend.mock.calls[0];
        expect(method).toBe('POST');
        expect(endpoint).toBe('/waba_1/payment_configuration/test-config');
        expect(JSON.parse(body)).toEqual({
            redirect_url: 'https://example.com/redirect',
        });
    });

    it('generates payment configuration oauth link', async () => {
        await whatsApp.payments.generatePaymentConfigurationOauthLink('waba_1', {
            configuration_name: 'test-config',
            redirect_url: 'https://example.com',
        });

        const [method, endpoint, _, body] = mockRequestSend.mock.calls[0];
        expect(method).toBe('POST');
        expect(endpoint).toBe('/waba_1/generate_payment_configuration_oauth_link');
        expect(JSON.parse(body)).toEqual({
            configuration_name: 'test-config',
            redirect_url: 'https://example.com',
        });
    });

    it('deletes a payment configuration', async () => {
        await whatsApp.payments.deletePaymentConfiguration('waba_1', { configuration_name: 'test-config' });

        const [method, endpoint, _, body] = mockRequestSend.mock.calls[0];
        expect(method).toBe('DELETE');
        expect(endpoint).toBe('/waba_1/payment_configuration');
        expect(JSON.parse(body)).toEqual({ configuration_name: 'test-config' });
    });
});
