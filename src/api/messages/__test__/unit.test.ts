import { WhatsApp } from '@core/whatsapp';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type ComponentTypesEnum, InteractiveTypesEnum, LanguagesEnum } from '../../../types/enums';
import type { ContactObject, InteractiveObject, MessageRequestParams, MessageTemplateObject } from '../types';

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

        it('should send group message with group recipient type', async () => {
            await whatsApp.messages.text({
                to: '120363025000000000@g.us',
                recipientType: 'group',
                body: 'Hello, group!',
            });

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                recipient_type: 'group',
                to: '120363025000000000@g.us',
                type: 'text',
                text: {
                    body: 'Hello, group!',
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

        it('should send interactive carousel message with correct schema', async () => {
            await whatsApp.messages.interactiveCarousel({
                to: '1234567890',
                body: {
                    type: InteractiveTypesEnum.Carousel,
                    body: {
                        text: 'Check these out',
                    },
                    action: {
                        cards: [
                            {
                                card_index: 0,
                                type: 'cta_url' as const,
                                header: {
                                    type: 'image' as const,
                                    image: {
                                        link: 'https://example.com/image-1.png',
                                    },
                                },
                                body: {
                                    text: 'Card 1',
                                },
                                action: {
                                    name: 'cta_url' as const,
                                    parameters: {
                                        display_text: 'Open',
                                        url: 'https://example.com',
                                    },
                                },
                            },
                            {
                                card_index: 1,
                                type: 'cta_url' as const,
                                header: {
                                    type: 'image' as const,
                                    image: {
                                        link: 'https://example.com/image-2.png',
                                    },
                                },
                                action: {
                                    buttons: [
                                        {
                                            type: 'quick_reply',
                                            quick_reply: {
                                                id: 'card_2_reply',
                                                title: 'Select',
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            });

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                type: 'interactive',
                to: '1234567890',
                interactive: {
                    type: 'carousel',
                    body: {
                        text: 'Check these out',
                    },
                    action: {
                        cards: [
                            {
                                card_index: 0,
                                type: 'cta_url',
                                header: {
                                    type: 'image',
                                    image: {
                                        link: 'https://example.com/image-1.png',
                                    },
                                },
                                body: {
                                    text: 'Card 1',
                                },
                                action: {
                                    name: 'cta_url',
                                    parameters: {
                                        display_text: 'Open',
                                        url: 'https://example.com',
                                    },
                                },
                            },
                            {
                                card_index: 1,
                                type: 'cta_url',
                                header: {
                                    type: 'image',
                                    image: {
                                        link: 'https://example.com/image-2.png',
                                    },
                                },
                                action: {
                                    buttons: [
                                        {
                                            type: 'quick_reply',
                                            quick_reply: {
                                                id: 'card_2_reply',
                                                title: 'Select',
                                            },
                                        },
                                    ],
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
                status: 'read' as const,
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
                status: 'typing',
                message_id: 'msg_test_123',
                typing_indicator: { type: 'text' },
            });
        });
    });

    describe('Brazil Payments (order_details / order_status)', () => {
        const sampleOrder = {
            status: 'pending' as const,
            items: [
                {
                    retailer_id: '1234567',
                    name: 'Cake',
                    amount: { value: 50000, offset: 100 },
                    quantity: 1,
                },
            ],
            subtotal: { value: 50000, offset: 100 },
            tax: { value: 0, offset: 100 },
        };

        it('should send Brazil order_details with Pix via helper method', async () => {
            await whatsApp.messages.interactiveOrderDetailsBrPix({
                to: '5511999999999',
                body: 'Complete your payment',
                pix: {
                    code: '00020101021226700014br.gov.bcb.pix2548pix.example.com',
                    merchant_name: 'Example Store',
                    key: '39580525000189',
                    key_type: 'CNPJ',
                },
                orderDetails: {
                    reference_id: 'order-001',
                    type: 'digital-goods',
                    total_amount: { value: 50000, offset: 100 },
                    order: sampleOrder,
                },
            });

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                type: 'interactive',
                to: '5511999999999',
                interactive: {
                    type: 'order_details',
                    body: { text: 'Complete your payment' },
                    action: {
                        name: 'review_and_pay',
                        parameters: {
                            reference_id: 'order-001',
                            type: 'digital-goods',
                            payment_type: 'br',
                            currency: 'BRL',
                            payment_settings: [
                                {
                                    type: 'pix_dynamic_code',
                                    pix_dynamic_code: {
                                        key_type: 'CNPJ',
                                    },
                                },
                            ],
                            total_amount: { value: 50000, offset: 100 },
                        },
                    },
                },
            });
        });

        it('should send Brazil order_status with payment captured', async () => {
            await whatsApp.messages.interactiveOrderStatusBr({
                to: '5511999999999',
                body: 'Payment received',
                orderStatus: {
                    reference_id: 'order-001',
                    order: { status: 'processing' },
                    payment: { status: 'captured', timestamp: 1722445231 },
                },
            });

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                type: 'interactive',
                interactive: {
                    type: 'order_status',
                    action: {
                        name: 'review_order',
                        parameters: {
                            reference_id: 'order-001',
                            order: { status: 'processing' },
                            payment: { status: 'captured', timestamp: 1722445231 },
                        },
                    },
                },
            });
        });
    });

    describe('India Payments (order_details / order_status)', () => {
        it('should send India order_details with UPI configuration', async () => {
            await whatsApp.messages.interactiveOrderDetailsIn({
                to: '919876543210',
                body: 'Review and pay',
                orderDetails: {
                    reference_id: 'order-in-001',
                    type: 'digital-goods',
                    payment_configuration: 'my-payment-config',
                    total_amount: { value: 1100, offset: 100 },
                },
            });

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                interactive: {
                    type: 'order_details',
                    action: {
                        name: 'review_and_pay',
                        parameters: {
                            reference_id: 'order-in-001',
                            payment_type: 'upi',
                            payment_configuration: 'my-payment-config',
                            currency: 'INR',
                        },
                    },
                },
            });
        });
    });

    describe('Order details template messages', () => {
        it('should send Brazil order_details template with Pix button parameters', async () => {
            await whatsApp.messages.templateOrderDetailsBrPix({
                to: '5511999999999',
                template: {
                    name: 'order_details_cart',
                    language: { policy: 'deterministic', code: 'pt_BR' },
                },
                pix: {
                    code: '00020101021226700014br.gov.bcb.pix2548pix.example.com',
                    merchant_name: 'Example Store',
                    key: '39580525000189',
                    key_type: 'CNPJ',
                },
                orderDetails: {
                    reference_id: 'tpl-order-001',
                    type: 'digital-goods',
                    total_amount: { value: 50000, offset: 100 },
                    order: {
                        status: 'pending',
                        items: [
                            {
                                retailer_id: '1234567',
                                name: 'Cake',
                                amount: { value: 50000, offset: 100 },
                                quantity: 1,
                            },
                        ],
                        subtotal: { value: 50000, offset: 100 },
                        tax: { value: 0, offset: 100 },
                    },
                },
            });

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                type: 'template',
                template: {
                    name: 'order_details_cart',
                    components: [
                        {
                            type: 'button',
                            sub_type: 'order_details',
                            index: 0,
                            parameters: [
                                {
                                    type: 'action',
                                    action: {
                                        order_details: {
                                            reference_id: 'tpl-order-001',
                                            payment_type: 'br',
                                            currency: 'BRL',
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            });
        });
    });

    describe('Order status template messages', () => {
        it('should send order_status template with status parameters', async () => {
            await whatsApp.messages.templateOrderStatus({
                to: '5511999999999',
                template: {
                    name: 'order_status_shipped',
                    language: { policy: 'deterministic', code: 'pt_BR' },
                },
                orderStatus: {
                    reference_id: 'order-001',
                    order: { status: 'shipped', description: 'Expected delivery in 2 days' },
                },
            });

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                type: 'template',
                template: {
                    name: 'order_status_shipped',
                    components: [
                        {
                            type: 'order_status',
                            parameters: [
                                {
                                    type: 'order_status',
                                    order_status: {
                                        reference_id: 'order-001',
                                        order: {
                                            status: 'shipped',
                                            description: 'Expected delivery in 2 days',
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            });
        });
    });
});
