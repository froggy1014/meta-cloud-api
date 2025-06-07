import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentTypesEnum, InteractiveTypesEnum, LanguagesEnum } from '../../../shared/types';
import WhatsApp from '../../../whatsapp';
import { ContactObject, InteractiveObject, MessageRequestParams, MessageTemplateObject } from '../types';

describe('Messages API - Unit Tests', () => {
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
            contacts: [{ input: '1234567890', wa_id: '1234567890' }],
            messages: [{ id: 'msg_test_123' }],
        });
    });

    describe('Message Type Validation', () => {
        it('should send image message with correct schema', async () => {
            const imageParams = {
                to: '1234567890',
                body: {
                    id: 'image_media_123',
                    caption: 'Test image',
                },
            };

            await whatsApp.messages.image(imageParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                type: 'image',
                to: '1234567890',
                image: {
                    id: 'image_media_123',
                    caption: 'Test image',
                },
            });
        });

        it('should send text message with correct schema', async () => {
            const textParams = {
                to: '1234567890',
                body: 'Hello, World!',
            };

            await whatsApp.messages.text(textParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                type: 'text',
                to: '1234567890',
                text: {
                    body: 'Hello, World!',
                },
            });
        });

        it('should send video message with correct schema', async () => {
            const videoParams = {
                to: '1234567890',
                body: {
                    id: 'video_media_123',
                    caption: 'Test video',
                },
            };

            await whatsApp.messages.video(videoParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                type: 'video',
                to: '1234567890',
                video: {
                    id: 'video_media_123',
                    caption: 'Test video',
                },
            });
        });

        it('should send audio message with correct schema', async () => {
            const audioParams = {
                to: '1234567890',
                body: {
                    id: 'audio_media_123',
                },
            };

            await whatsApp.messages.audio(audioParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                type: 'audio',
                to: '1234567890',
                audio: {
                    id: 'audio_media_123',
                },
            });
        });

        it('should send document message with correct schema', async () => {
            const documentParams = {
                to: '1234567890',
                body: {
                    id: 'document_media_123',
                    filename: 'test.pdf',
                    caption: 'Test document',
                },
            };

            await whatsApp.messages.document(documentParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                type: 'document',
                to: '1234567890',
                document: {
                    id: 'document_media_123',
                    filename: 'test.pdf',
                    caption: 'Test document',
                },
            });
        });

        it('should send sticker message with correct schema', async () => {
            const stickerParams = {
                to: '1234567890',
                body: {
                    id: 'sticker_media_123',
                },
            };

            await whatsApp.messages.sticker(stickerParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                type: 'sticker',
                to: '1234567890',
                sticker: {
                    id: 'sticker_media_123',
                },
            });
        });

        it('should send location message with correct schema', async () => {
            const locationParams = {
                to: '1234567890',
                body: {
                    longitude: 126.978,
                    latitude: 37.5665,
                    name: 'Seoul',
                    address: 'Seoul, South Korea',
                },
            };

            await whatsApp.messages.location(locationParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                type: 'location',
                to: '1234567890',
                location: {
                    longitude: 126.978,
                    latitude: 37.5665,
                    name: 'Seoul',
                    address: 'Seoul, South Korea',
                },
            });
        });

        it('should send contacts message with correct schema', async () => {
            const contactsParams: MessageRequestParams<[ContactObject]> = {
                to: '1234567890',
                body: [
                    {
                        name: {
                            formatted_name: 'John Doe',
                            first_name: 'John',
                            last_name: 'Doe',
                        },
                        phones: [
                            {
                                phone: 'PHONE_NUMBER',
                                type: 'WORK',
                            },
                        ],
                    },
                ],
            };

            await whatsApp.messages.contacts(contactsParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                type: 'contacts',
                to: '1234567890',
                contacts: [
                    {
                        name: {
                            formatted_name: 'John Doe',
                            first_name: 'John',
                            last_name: 'Doe',
                        },
                        phones: [
                            {
                                phone: 'PHONE_NUMBER',
                                type: 'WORK',
                            },
                        ],
                    },
                ],
            });
        });

        it('should send interactive button message with correct schema', async () => {
            const interactiveParams: MessageRequestParams<InteractiveObject> = {
                to: '1234567890',
                body: {
                    type: InteractiveTypesEnum.Button,
                    header: {
                        type: 'text',
                        text: 'Header Text',
                    },
                    body: {
                        text: 'Choose an option:',
                    },
                    action: {
                        buttons: [
                            {
                                type: 'reply',
                                reply: {
                                    id: 'btn_1',
                                    title: 'Button 1',
                                },
                            },
                        ],
                    },
                },
            };

            await whatsApp.messages.interactive(interactiveParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                type: 'interactive',
                to: '1234567890',
                interactive: {
                    type: 'button',
                    header: {
                        type: 'text',
                        text: 'Header Text',
                    },
                    body: {
                        text: 'Choose an option:',
                    },
                    action: {
                        buttons: [
                            {
                                type: 'reply',
                                reply: {
                                    id: 'btn_1',
                                    title: 'Button 1',
                                },
                            },
                        ],
                    },
                },
            });
        });

        it('should send template message with correct schema', async () => {
            const templateParams: MessageRequestParams<MessageTemplateObject<ComponentTypesEnum>> = {
                to: '1234567890',
                body: {
                    name: 'hello_world',
                    language: {
                        policy: 'deterministic' as const,
                        code: LanguagesEnum.English,
                    },
                    components: [],
                },
            };

            await whatsApp.messages.template(templateParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                type: 'template',
                to: '1234567890',
                template: {
                    name: 'hello_world',
                    language: {
                        code: LanguagesEnum.English,
                    },
                },
            });
        });
    });

    describe('Message Status Operations', () => {
        it('should mark message as read with correct schema', async () => {
            const statusParams = {
                status: 'read',
                messageId: 'msg_test_123',
            };

            await whatsApp.messages.status(statusParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                messaging_product: 'whatsapp',
                status: 'read',
                message_id: 'msg_test_123',
            });
        });

        it('should show typing indicator with correct schema', async () => {
            const typingParams = {
                messageId: 'msg_test_123',
            };

            await whatsApp.messages.showTypingIndicator(typingParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                messaging_product: 'whatsapp',
                status: 'read',
                message_id: 'msg_test_123',
            });
        });
    });
});
