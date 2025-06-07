import { beforeEach, describe, expect, it, vi } from 'vitest';
import WhatsApp from '../../../whatsapp';

describe('QrCode API - Unit Tests', () => {
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
            code: 'qr_123',
            prefilled_message: 'Hello from QR Code!',
            deep_link_url: 'https://wa.me/qr/ABC123',
            qr_image_url: 'https://scontent.whatsapp.net/qr_image.png',
        });
    });

    describe('QrCode Operations', () => {
        it('should create QR code with correct endpoint and body', async () => {
            const createRequest = {
                prefilled_message: 'Welcome to our service!',
                generate_qr_image: 'PNG' as const,
            };

            await whatsApp.qrCode.createQrCode(createRequest);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('POST');
            expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/message_qrdls`);
            expect(timeout).toBeGreaterThan(0);
            expect(JSON.parse(body)).toEqual(createRequest);
        });

        it('should create QR code without image generation', async () => {
            const createRequest = {
                prefilled_message: 'Simple QR code message',
            };

            await whatsApp.qrCode.createQrCode(createRequest);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            expect(JSON.parse(body)).toEqual(createRequest);
            expect(JSON.parse(body)).not.toHaveProperty('generate_qr_image');
        });

        it('should get all QR codes with correct endpoint', async () => {
            await whatsApp.qrCode.getQrCodes();

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('GET');
            expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/message_qrdls`);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });

        it('should get specific QR code with correct endpoint', async () => {
            const qrCodeId = 'qr_test_123';

            await whatsApp.qrCode.getQrCode(qrCodeId);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('GET');
            expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/message_qrdls/${qrCodeId}`);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });

        it('should update QR code with correct endpoint and body', async () => {
            const updateRequest = {
                code: 'existing_qr_123',
                prefilled_message: 'Updated message content',
            };

            await whatsApp.qrCode.updateQrCode(updateRequest);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('POST');
            expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/message_qrdls`);
            expect(timeout).toBeGreaterThan(0);
            expect(JSON.parse(body)).toEqual(updateRequest);
        });

        it('should delete QR code with correct endpoint', async () => {
            const qrCodeId = 'qr_to_delete_123';

            await whatsApp.qrCode.deleteQrCode(qrCodeId);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('DELETE');
            expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/message_qrdls/${qrCodeId}`);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });
    });

    describe('Request Body Structure Validation', () => {
        it('should create correct request body for QR code with PNG image', async () => {
            const request = {
                prefilled_message: 'PNG QR Code Test',
                generate_qr_image: 'PNG' as const,
            };

            await whatsApp.qrCode.createQrCode(request);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody).toHaveProperty('prefilled_message', 'PNG QR Code Test');
            expect(parsedBody).toHaveProperty('generate_qr_image', 'PNG');
        });

        it('should create correct request body for QR code with SVG image', async () => {
            const request = {
                prefilled_message: 'SVG QR Code Test',
                generate_qr_image: 'SVG' as const,
            };

            await whatsApp.qrCode.createQrCode(request);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody).toHaveProperty('prefilled_message', 'SVG QR Code Test');
            expect(parsedBody).toHaveProperty('generate_qr_image', 'SVG');
        });

        it('should create correct request body for QR code without image generation', async () => {
            const request = {
                prefilled_message: 'No Image QR Code Test',
            };

            await whatsApp.qrCode.createQrCode(request);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody).toHaveProperty('prefilled_message', 'No Image QR Code Test');
            expect(parsedBody).not.toHaveProperty('generate_qr_image');
        });

        it('should create correct request body for QR code update', async () => {
            const request = {
                code: 'test_qr_code_123',
                prefilled_message: 'Updated test message',
            };

            await whatsApp.qrCode.updateQrCode(request);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody).toHaveProperty('code', 'test_qr_code_123');
            expect(parsedBody).toHaveProperty('prefilled_message', 'Updated test message');
        });

        it('should handle special characters in prefilled message', async () => {
            const request = {
                prefilled_message: 'Hello! 👋 Welcome to our service. Visit https://example.com for more info.',
                generate_qr_image: 'PNG' as const,
            };

            await whatsApp.qrCode.createQrCode(request);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody.prefilled_message).toBe(
                'Hello! 👋 Welcome to our service. Visit https://example.com for more info.',
            );
        });

        it('should handle long prefilled messages', async () => {
            const longMessage =
                'This is a very long message that contains multiple sentences and should be handled properly by the QR code API. '.repeat(
                    5,
                );
            const request = {
                prefilled_message: longMessage,
            };

            await whatsApp.qrCode.createQrCode(request);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody.prefilled_message).toBe(longMessage);
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully for create operation', async () => {
            mockRequestSend.mockRejectedValue(new Error('API Error: QR code creation failed'));

            const request = {
                prefilled_message: 'Test message',
            };

            await expect(whatsApp.qrCode.createQrCode(request)).rejects.toThrow('API Error: QR code creation failed');
        });

        it('should handle API errors gracefully for get all operation', async () => {
            mockRequestSend.mockRejectedValue(new Error('API Error: Failed to fetch QR codes'));

            await expect(whatsApp.qrCode.getQrCodes()).rejects.toThrow('API Error: Failed to fetch QR codes');
        });

        it('should handle API errors gracefully for get single operation', async () => {
            mockRequestSend.mockRejectedValue(new Error('API Error: QR code not found'));

            await expect(whatsApp.qrCode.getQrCode('invalid_id')).rejects.toThrow('API Error: QR code not found');
        });

        it('should handle API errors gracefully for update operation', async () => {
            mockRequestSend.mockRejectedValue(new Error('API Error: QR code update failed'));

            const request = {
                code: 'test_code',
                prefilled_message: 'Updated message',
            };

            await expect(whatsApp.qrCode.updateQrCode(request)).rejects.toThrow('API Error: QR code update failed');
        });

        it('should handle API errors gracefully for delete operation', async () => {
            mockRequestSend.mockRejectedValue(new Error('API Error: QR code deletion failed'));

            await expect(whatsApp.qrCode.deleteQrCode('qr_123')).rejects.toThrow('API Error: QR code deletion failed');
        });
    });

    describe('API Integration', () => {
        it('should be accessible through WhatsApp instance', () => {
            expect(whatsApp.qrCode).toBeDefined();
            expect(typeof whatsApp.qrCode.createQrCode).toBe('function');
            expect(typeof whatsApp.qrCode.getQrCodes).toBe('function');
            expect(typeof whatsApp.qrCode.getQrCode).toBe('function');
            expect(typeof whatsApp.qrCode.updateQrCode).toBe('function');
            expect(typeof whatsApp.qrCode.deleteQrCode).toBe('function');
        });

        it('should use consistent endpoint for QR code operations', async () => {
            const baseEndpoint = `${whatsApp.requester.phoneNumberId}/message_qrdls`;

            // Test create operation
            await whatsApp.qrCode.createQrCode({ prefilled_message: 'test' });
            const createEndpoint = mockRequestSend.mock.calls[0][1];
            expect(createEndpoint).toBe(baseEndpoint);

            // Test get all operation
            mockRequestSend.mockClear();
            await whatsApp.qrCode.getQrCodes();
            const getAllEndpoint = mockRequestSend.mock.calls[0][1];
            expect(getAllEndpoint).toBe(baseEndpoint);

            // Test update operation (uses same endpoint as create)
            mockRequestSend.mockClear();
            await whatsApp.qrCode.updateQrCode({ code: 'test', prefilled_message: 'updated' });
            const updateEndpoint = mockRequestSend.mock.calls[0][1];
            expect(updateEndpoint).toBe(baseEndpoint);
        });

        it('should use ID-specific endpoints for single resource operations', async () => {
            const qrCodeId = 'test_qr_123';
            const expectedEndpoint = `${whatsApp.requester.phoneNumberId}/message_qrdls/${qrCodeId}`;

            // Test get single operation
            await whatsApp.qrCode.getQrCode(qrCodeId);
            const getEndpoint = mockRequestSend.mock.calls[0][1];
            expect(getEndpoint).toBe(expectedEndpoint);

            // Test delete operation
            mockRequestSend.mockClear();
            await whatsApp.qrCode.deleteQrCode(qrCodeId);
            const deleteEndpoint = mockRequestSend.mock.calls[0][1];
            expect(deleteEndpoint).toBe(expectedEndpoint);
        });

        it('should use correct HTTP methods for each operation', async () => {
            // Test create - POST
            await whatsApp.qrCode.createQrCode({ prefilled_message: 'test' });
            expect(mockRequestSend.mock.calls[0][0]).toBe('POST');

            // Test get all - GET
            mockRequestSend.mockClear();
            await whatsApp.qrCode.getQrCodes();
            expect(mockRequestSend.mock.calls[0][0]).toBe('GET');

            // Test get single - GET
            mockRequestSend.mockClear();
            await whatsApp.qrCode.getQrCode('test_id');
            expect(mockRequestSend.mock.calls[0][0]).toBe('GET');

            // Test update - POST
            mockRequestSend.mockClear();
            await whatsApp.qrCode.updateQrCode({ code: 'test', prefilled_message: 'updated' });
            expect(mockRequestSend.mock.calls[0][0]).toBe('POST');

            // Test delete - DELETE
            mockRequestSend.mockClear();
            await whatsApp.qrCode.deleteQrCode('test_id');
            expect(mockRequestSend.mock.calls[0][0]).toBe('DELETE');
        });
    });

    describe('Timeout Configuration', () => {
        it('should use configured timeout for all operations', async () => {
            const expectedTimeout = whatsApp.config.REQUEST_TIMEOUT;

            // Test all operations have correct timeout
            await whatsApp.qrCode.createQrCode({ prefilled_message: 'test' });
            expect(mockRequestSend.mock.calls[0][2]).toBe(expectedTimeout);

            mockRequestSend.mockClear();
            await whatsApp.qrCode.getQrCodes();
            expect(mockRequestSend.mock.calls[0][2]).toBe(expectedTimeout);

            mockRequestSend.mockClear();
            await whatsApp.qrCode.getQrCode('test_id');
            expect(mockRequestSend.mock.calls[0][2]).toBe(expectedTimeout);

            mockRequestSend.mockClear();
            await whatsApp.qrCode.updateQrCode({ code: 'test', prefilled_message: 'updated' });
            expect(mockRequestSend.mock.calls[0][2]).toBe(expectedTimeout);

            mockRequestSend.mockClear();
            await whatsApp.qrCode.deleteQrCode('test_id');
            expect(mockRequestSend.mock.calls[0][2]).toBe(expectedTimeout);
        });
    });
});
