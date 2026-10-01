import { WhatsApp } from '@core/whatsapp';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WhatsAppValidationError } from '../../../utils/isMetaError';

describe('Media API - Unit Tests', () => {
    let whatsApp: WhatsApp;
    let mockGetJson: any;
    let mockSendFormData: any;

    const mockMediaResponse = {
        id: 'media_123',
        url: 'https://example.com/media.jpg',
        mime_type: 'image/jpeg',
        sha256: 'abcd1234',
        file_size: 102400,
        messaging_product: 'whatsapp',
    };

    beforeEach(() => {
        whatsApp = new WhatsApp({
            accessToken: process.env.CLOUD_API_ACCESS_TOKEN || 'test_token',
            phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID) || 123456789,
            businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID || 'test_business_id',
        });

        mockGetJson = vi.spyOn(whatsApp.requester, 'getJson');
        mockGetJson.mockResolvedValue(mockMediaResponse);

        mockSendFormData = vi.spyOn(whatsApp.requester, 'sendFormData');
        mockSendFormData.mockResolvedValue({ id: 'media_123' });
    });

    describe('Media Operations', () => {
        it('should get media by ID with correct endpoint', async () => {
            const mediaId = 'media_test_123';

            await whatsApp.media.getMediaById(mediaId);

            expect(mockGetJson).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockGetJson.mock.calls[0];

            expect(method).toBe('GET');
            expect(endpoint).toBe(mediaId);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });

        it('should upload media with correct FormData structure', async () => {
            const mockFileContent = 'fake file content';
            const mockFile = new File([mockFileContent], 'test.jpg', { type: 'image/jpeg' });

            await whatsApp.media.uploadMedia(mockFile);

            expect(mockSendFormData).toHaveBeenCalled();
            const [method, endpoint, timeout, formData] = mockSendFormData.mock.calls[0];

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

            expect(mockSendFormData).toHaveBeenCalled();
            const [_, __, ___, formData] = mockSendFormData.mock.calls[0];

            expect(formData).toBeInstanceOf(FormData);
            expect(formData.get('messaging_product')).toBe(customMessagingProduct);
        });

        it('should delete media with correct endpoint', async () => {
            const mediaId = 'media_to_delete_123';

            await whatsApp.media.deleteMedia(mediaId);

            expect(mockGetJson).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockGetJson.mock.calls[0];

            expect(method).toBe('DELETE');
            expect(endpoint).toBe(mediaId);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });

        it('should download media with correct endpoint', async () => {
            const mediaUrl = 'https://example.com/media/download/test.jpg';

            await whatsApp.media.downloadMedia(mediaUrl);

            expect(mockGetJson).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockGetJson.mock.calls[0];

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

            const [_, __, ___, formData] = mockSendFormData.mock.calls[0];

            expect(formData.get('file')).toBe(imageFile);
            expect(formData.get('messaging_product')).toBe('whatsapp');
            expect(formData.get('type')).toBe('image/png');
        });

        it('should create correct FormData for video upload', async () => {
            const videoFile = new File(['video content'], 'video.mp4', { type: 'video/mp4' });
            const customProduct = 'custom_whatsapp';

            await whatsApp.media.uploadMedia(videoFile, customProduct);

            const [_, __, ___, formData] = mockSendFormData.mock.calls[0];

            expect(formData.get('file')).toBe(videoFile);
            expect(formData.get('messaging_product')).toBe(customProduct);
            expect(formData.get('type')).toBe('video/mp4');
        });

        it('should create correct FormData for document upload', async () => {
            const documentFile = new File(['document content'], 'document.pdf', { type: 'application/pdf' });

            await whatsApp.media.uploadMedia(documentFile);

            const [_, __, ___, formData] = mockSendFormData.mock.calls[0];

            expect(formData.get('file')).toBe(documentFile);
            expect(formData.get('messaging_product')).toBe('whatsapp');
            expect(formData.get('type')).toBe('application/pdf');
        });

        it('should create correct FormData for audio upload', async () => {
            const audioFile = new File(['audio content'], 'audio.ogg', { type: 'audio/ogg' });

            await whatsApp.media.uploadMedia(audioFile);

            const [_, __, ___, formData] = mockSendFormData.mock.calls[0];

            expect(formData.get('file')).toBe(audioFile);
            expect(formData.get('messaging_product')).toBe('whatsapp');
            expect(formData.get('type')).toBe('audio/ogg');
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully', async () => {
            mockGetJson.mockRejectedValue(new Error('API Error: Media not found'));

            await expect(whatsApp.media.getMediaById('invalid_id')).rejects.toThrow('API Error: Media not found');
        });

        it('should handle upload errors', async () => {
            mockSendFormData.mockRejectedValue(new Error('Upload failed'));

            const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
            await expect(whatsApp.media.uploadMedia(file)).rejects.toThrow('Upload failed');
        });

        it('should handle delete errors', async () => {
            mockGetJson.mockRejectedValue(new Error('Delete failed'));

            await expect(whatsApp.media.deleteMedia('media_123')).rejects.toThrow('Delete failed');
        });

        it('should handle download errors', async () => {
            mockGetJson.mockRejectedValue(new Error('Download failed'));

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
            const getEndpoint = mockGetJson.mock.calls[0][1];

            mockGetJson.mockClear();
            await whatsApp.media.deleteMedia(mediaId);
            const deleteEndpoint = mockGetJson.mock.calls[0][1];

            expect(getEndpoint).toBe(mediaId);
            expect(deleteEndpoint).toBe(mediaId);
        });

        it('should use phone number ID in upload endpoint', async () => {
            const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

            await whatsApp.media.uploadMedia(file);

            const [_, endpoint] = mockSendFormData.mock.calls[0];
            expect(endpoint).toContain(whatsApp.requester.phoneNumberId.toString());
            expect(endpoint).toContain('media');
        });
    });
});

describe('Media API - uploadMedia input types (fetch mocked)', () => {
    const PNG_BYTES = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    let whatsApp: WhatsApp;
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchMock = vi.fn(async () => new Response('{"id":"media_123"}', { status: 200 }));
        vi.stubGlobal('fetch', fetchMock);
        whatsApp = new WhatsApp({ accessToken: 'test_token', phoneNumberId: 123456789, businessAcctId: 'biz' });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    async function sentForm() {
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(url).toBe('https://graph.facebook.com/v23.0/123456789/media');
        expect(init.method).toBe('POST');
        expect(init.body).toBeInstanceOf(FormData);
        // multipart boundary is set by fetch, never by the SDK
        expect((init.headers as Record<string, string>)['Content-Type']).toBeUndefined();
        const form = init.body as FormData;
        const file = form.get('file') as File;
        expect(file).toBeInstanceOf(Blob);
        return { form, file, bytes: [...new Uint8Array(await file.arrayBuffer())] };
    }

    it('keeps sending a File unchanged', async () => {
        const input = new File([new Uint8Array(PNG_BYTES)], 'logo.png', { type: 'image/png' });
        await expect(whatsApp.media.uploadMedia(input)).resolves.toEqual({ id: 'media_123' });

        const { form, file, bytes } = await sentForm();
        expect(file.name).toBe('logo.png');
        expect(file.type).toBe('image/png');
        expect(bytes).toEqual(PNG_BYTES);
        expect(form.get('type')).toBe('image/png');
        expect(form.get('messaging_product')).toBe('whatsapp');
    });

    it('accepts a Blob with a type', async () => {
        await whatsApp.media.uploadMedia(new Blob([new Uint8Array(PNG_BYTES)], { type: 'image/png' }), {
            filename: 'a.png',
        });

        const { form, file, bytes } = await sentForm();
        expect(file.name).toBe('a.png');
        expect(bytes).toEqual(PNG_BYTES);
        expect(form.get('type')).toBe('image/png');
    });

    it('accepts a Uint8Array (and so a Buffer) with options.type', async () => {
        await whatsApp.media.uploadMedia(new Uint8Array(PNG_BYTES), { type: 'image/png', filename: 'b.png' });

        const { form, file, bytes } = await sentForm();
        expect(file.name).toBe('b.png');
        expect(file.type).toBe('image/png');
        expect(bytes).toEqual(PNG_BYTES);
        expect(form.get('type')).toBe('image/png');
    });

    it('sends only the viewed range of a Uint8Array subarray', async () => {
        const backing = new Uint8Array([0, 0, ...PNG_BYTES, 0]);
        await whatsApp.media.uploadMedia(backing.subarray(2, 2 + PNG_BYTES.length), { type: 'image/png' });

        const { file, bytes } = await sentForm();
        expect(file.name).toBe('file');
        expect(bytes).toEqual(PNG_BYTES);
    });

    it('accepts an ArrayBuffer with options.type and a custom messaging product', async () => {
        await whatsApp.media.uploadMedia(new Uint8Array(PNG_BYTES).buffer, {
            type: 'image/png',
            messagingProduct: 'whatsapp',
        });

        const { form, bytes } = await sentForm();
        expect(bytes).toEqual(PNG_BYTES);
        expect(form.get('type')).toBe('image/png');
    });

    it('collects a ReadableStream into the multipart body', async () => {
        const chunks = [PNG_BYTES.slice(0, 3), PNG_BYTES.slice(3)];
        const stream = new ReadableStream<Uint8Array>({
            start(controller) {
                for (const chunk of chunks) controller.enqueue(new Uint8Array(chunk));
                controller.close();
            },
        });

        await whatsApp.media.uploadMedia(stream, { type: 'application/pdf', filename: 'report.pdf' });

        const { form, file, bytes } = await sentForm();
        expect(file.name).toBe('report.pdf');
        expect(file.type).toBe('application/pdf');
        expect(bytes).toEqual(PNG_BYTES);
        expect(form.get('type')).toBe('application/pdf');
    });

    it('lets options.type override the type of a Blob', async () => {
        await whatsApp.media.uploadMedia(new Blob(['%PDF'], { type: 'application/octet-stream' }), {
            type: 'application/pdf',
        });

        const { form, file } = await sentForm();
        expect(file.type).toBe('application/pdf');
        expect(form.get('type')).toBe('application/pdf');
    });

    it('rejects input without a MIME type before calling fetch', async () => {
        await expect(whatsApp.media.uploadMedia(new Uint8Array(PNG_BYTES))).rejects.toBeInstanceOf(
            WhatsAppValidationError,
        );
        await expect(whatsApp.media.uploadMedia(new Blob(['x']))).rejects.toBeInstanceOf(WhatsAppValidationError);
        await expect(whatsApp.media.uploadMedia('nope' as never, { type: 'image/png' })).rejects.toBeInstanceOf(
            WhatsAppValidationError,
        );
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
