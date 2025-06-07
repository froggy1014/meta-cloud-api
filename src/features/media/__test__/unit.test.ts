import { beforeEach, describe, expect, it, vi } from 'vitest';
import WhatsApp from '../../../whatsapp';

describe('Media API - Unit Tests', () => {
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
            id: 'media_123',
            url: 'https://example.com/media.jpg',
            mime_type: 'image/jpeg',
            sha256: 'abcd1234',
            file_size: 102400,
            messaging_product: 'whatsapp',
        });
    });

    describe('Media Operations', () => {
        it('should get media by ID with correct endpoint', async () => {
            const mediaId = 'media_test_123';

            await whatsApp.media.getMediaById(mediaId);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('GET');
            expect(endpoint).toBe(mediaId);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });

        it('should upload media with correct FormData structure', async () => {
            const mockFileContent = 'fake file content';
            const mockFile = new File([mockFileContent], 'test.jpg', { type: 'image/jpeg' });

            await whatsApp.media.uploadMedia(mockFile);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, formData] = mockRequestSend.mock.calls[0];

            expect(method).toBe('POST');
            expect(endpoint).toBe(`${whatsApp.requester.phoneNumberId}/media`);
            expect(timeout).toBeGreaterThan(0);
            expect(formData).toBeInstanceOf(FormData);

            // Verify FormData contains the correct fields
            expect(formData.get('file')).toBe(mockFile);
            expect(formData.get('messaging_product')).toBe('whatsapp');
            expect(formData.get('type')).toBe('image/jpeg');
        });

        it('should upload media with custom messaging product', async () => {
            const mockFileContent = 'fake file content';
            const mockFile = new File([mockFileContent], 'test.jpg', { type: 'image/jpeg' });
            const customMessagingProduct = 'custom_product';

            await whatsApp.media.uploadMedia(mockFile, customMessagingProduct);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, formData] = mockRequestSend.mock.calls[0];

            expect(formData).toBeInstanceOf(FormData);
            expect(formData.get('messaging_product')).toBe(customMessagingProduct);
        });

        it('should delete media with correct endpoint', async () => {
            const mediaId = 'media_to_delete_123';

            await whatsApp.media.deleteMedia(mediaId);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('DELETE');
            expect(endpoint).toBe(mediaId);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });

        it('should download media with correct endpoint', async () => {
            const mediaUrl = 'https://example.com/media/download/test.jpg';

            await whatsApp.media.downloadMedia(mediaUrl);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('GET');
            expect(endpoint).toBe(mediaUrl);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });
    });

    describe('Request Body Structure Validation', () => {
        it('should create correct FormData for image upload', async () => {
            const imageFile = new File(['image content'], 'image.png', { type: 'image/png' });

            await whatsApp.media.uploadMedia(imageFile);

            const [_, __, ___, formData] = mockRequestSend.mock.calls[0];

            expect(formData.get('file')).toBe(imageFile);
            expect(formData.get('messaging_product')).toBe('whatsapp');
            expect(formData.get('type')).toBe('image/png');
        });

        it('should create correct FormData for video upload', async () => {
            const videoFile = new File(['video content'], 'video.mp4', { type: 'video/mp4' });
            const customProduct = 'custom_whatsapp';

            await whatsApp.media.uploadMedia(videoFile, customProduct);

            const [_, __, ___, formData] = mockRequestSend.mock.calls[0];

            expect(formData.get('file')).toBe(videoFile);
            expect(formData.get('messaging_product')).toBe(customProduct);
            expect(formData.get('type')).toBe('video/mp4');
        });

        it('should create correct FormData for document upload', async () => {
            const documentFile = new File(['document content'], 'document.pdf', { type: 'application/pdf' });

            await whatsApp.media.uploadMedia(documentFile);

            const [_, __, ___, formData] = mockRequestSend.mock.calls[0];

            expect(formData.get('file')).toBe(documentFile);
            expect(formData.get('messaging_product')).toBe('whatsapp');
            expect(formData.get('type')).toBe('application/pdf');
        });

        it('should create correct FormData for audio upload', async () => {
            const audioFile = new File(['audio content'], 'audio.ogg', { type: 'audio/ogg' });

            await whatsApp.media.uploadMedia(audioFile);

            const [_, __, ___, formData] = mockRequestSend.mock.calls[0];

            expect(formData.get('file')).toBe(audioFile);
            expect(formData.get('messaging_product')).toBe('whatsapp');
            expect(formData.get('type')).toBe('audio/ogg');
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully', async () => {
            mockRequestSend.mockRejectedValue(new Error('API Error: Media not found'));

            await expect(whatsApp.media.getMediaById('invalid_id')).rejects.toThrow('API Error: Media not found');
        });

        it('should handle upload errors', async () => {
            mockRequestSend.mockRejectedValue(new Error('Upload failed'));

            const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
            await expect(whatsApp.media.uploadMedia(file)).rejects.toThrow('Upload failed');
        });

        it('should handle delete errors', async () => {
            mockRequestSend.mockRejectedValue(new Error('Delete failed'));

            await expect(whatsApp.media.deleteMedia('media_123')).rejects.toThrow('Delete failed');
        });

        it('should handle download errors', async () => {
            mockRequestSend.mockRejectedValue(new Error('Download failed'));

            await expect(whatsApp.media.downloadMedia('https://invalid-url.com')).rejects.toThrow('Download failed');
        });
    });

    describe('API Integration', () => {
        it('should be accessible through WhatsApp instance', () => {
            expect(whatsApp.media).toBeDefined();
            expect(typeof whatsApp.media.getMediaById).toBe('function');
            expect(typeof whatsApp.media.uploadMedia).toBe('function');
            expect(typeof whatsApp.media.deleteMedia).toBe('function');
            expect(typeof whatsApp.media.downloadMedia).toBe('function');
        });

        it('should use consistent endpoint for media operations', async () => {
            const mediaId = 'test_media_123';

            // Test different operations to ensure endpoint consistency
            await whatsApp.media.getMediaById(mediaId);
            const getEndpoint = mockRequestSend.mock.calls[0][1];

            mockRequestSend.mockClear();
            await whatsApp.media.deleteMedia(mediaId);
            const deleteEndpoint = mockRequestSend.mock.calls[0][1];

            expect(getEndpoint).toBe(mediaId);
            expect(deleteEndpoint).toBe(mediaId);
        });

        it('should use phone number ID in upload endpoint', async () => {
            const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

            await whatsApp.media.uploadMedia(file);

            const [_, endpoint] = mockRequestSend.mock.calls[0];
            expect(endpoint).toContain(whatsApp.requester.phoneNumberId.toString());
            expect(endpoint).toContain('media');
        });
    });
});
