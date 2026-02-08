import { WhatsApp } from '@core/whatsapp';
import { CategoryEnum, LanguagesEnum, TemplateStatusEnum } from 'src/types/enums';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TemplateDeleteParams, TemplateGetParams, TemplateRequestBody } from '../types';

describe('Template API - Unit Tests', () => {
    let whatsApp: WhatsApp;
    let mockRequestSend: any;

    const mockTemplateResponse = {
        id: 'template_123',
        status: 'APPROVED',
        language: LanguagesEnum.English,
        category: CategoryEnum.Marketing,
        name: 'test_template',
        components: [
            {
                type: 'BODY',
                text: 'Hello {{1}}, welcome to our service!',
            },
        ],
    };

    beforeEach(() => {
        whatsApp = new WhatsApp({
            accessToken: process.env.CLOUD_API_ACCESS_TOKEN || 'test_token',
            phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID) || 123456789,
            businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID || 'test_business_id',
        });

        mockRequestSend = vi.spyOn(whatsApp.requester, 'getJson');
        mockRequestSend.mockResolvedValue(mockTemplateResponse);
    });

    describe('Template Operations', () => {
        it('should get template by ID with correct endpoint', async () => {
            const templateId = 'template_test_123';

            await whatsApp.templates.getTemplate(templateId);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('GET');
            expect(endpoint).toBe(templateId);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });

        it('should update template with correct payload', async () => {
            const templateId = 'template_update_123';
            const updateData: Partial<TemplateRequestBody> = {
                name: 'updated_template_name',
                components: [
                    {
                        type: 'BODY',
                        text: 'Updated template text {{1}}',
                    },
                ],
            };

            await whatsApp.templates.updateTemplate(templateId, updateData);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('POST');
            expect(endpoint).toBe(templateId);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBe(JSON.stringify(updateData));
        });

        it('should get templates with query parameters', async () => {
            const params: TemplateGetParams = {
                limit: 10,
                name: 'test_template',
                language: LanguagesEnum.English,
                category: CategoryEnum.Marketing,
                status: TemplateStatusEnum.Approved,
            };

            await whatsApp.templates.getTemplates(params);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('GET');
            expect(endpoint).toContain(`${whatsApp.requester.businessAcctId}/message_templates`);
            expect(endpoint).toContain('?limit=10');
            expect(endpoint).toContain('name=test_template');
            expect(endpoint).toContain('language=en');
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });

        it('should get templates without query parameters', async () => {
            await whatsApp.templates.getTemplates();

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('GET');
            expect(endpoint).toBe(`${whatsApp.requester.businessAcctId}/message_templates`);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });

        it('should create template with correct payload', async () => {
            const templateData: TemplateRequestBody = {
                name: 'new_template',
                language: LanguagesEnum.English,
                category: CategoryEnum.Marketing,
                components: [
                    {
                        type: 'HEADER',
                        format: 'TEXT',
                        text: 'Welcome!',
                    },
                    {
                        type: 'BODY',
                        text: 'Hello {{1}}, thank you for joining us!',
                    },
                    {
                        type: 'FOOTER',
                        text: 'Best regards, Team',
                    },
                ],
            };

            await whatsApp.templates.createTemplate(templateData);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('POST');
            expect(endpoint).toBe(`${whatsApp.requester.businessAcctId}/message_templates`);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBe(JSON.stringify(templateData));
        });

        it('should delete template with correct parameters', async () => {
            const deleteParams: TemplateDeleteParams = {
                hsm_id: 'hsm_123',
                name: 'template_to_delete',
            };

            await whatsApp.templates.deleteTemplate(deleteParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('DELETE');
            expect(endpoint).toContain(`${whatsApp.requester.businessAcctId}/message_templates`);
            expect(endpoint).toContain('?hsm_id=hsm_123');
            expect(endpoint).toContain('name=template_to_delete');
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });
    });

    describe('Template Components Validation', () => {
        it('should create template with header component', async () => {
            const templateData: TemplateRequestBody = {
                name: 'header_template',
                language: LanguagesEnum.English,
                category: CategoryEnum.Marketing,
                components: [
                    {
                        type: 'HEADER',
                        format: 'IMAGE',
                        example: {
                            header_handle: ['image_handle_123'],
                        },
                    },
                    {
                        type: 'BODY',
                        text: 'Check out our latest products!',
                    },
                ],
            };

            await whatsApp.templates.createTemplate(templateData);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody.components).toHaveLength(2);
            expect(parsedBody.components[0].type).toBe('HEADER');
            expect(parsedBody.components[0].format).toBe('IMAGE');
            expect(parsedBody.components[1].type).toBe('BODY');
        });

        it('should create template with buttons', async () => {
            const templateData: TemplateRequestBody = {
                name: 'button_template',
                language: LanguagesEnum.English,
                category: CategoryEnum.Marketing,
                components: [
                    {
                        type: 'BODY',
                        text: 'Would you like to learn more?',
                    },
                    {
                        type: 'BUTTONS',
                        buttons: [
                            {
                                type: 'QUICK_REPLY',
                                text: 'Yes, tell me more',
                            },
                            {
                                type: 'URL',
                                text: 'Visit Website',
                                url: 'https://example.com',
                            },
                        ],
                    },
                ],
            };

            await whatsApp.templates.createTemplate(templateData);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody.components).toHaveLength(2);
            expect(parsedBody.components[1].type).toBe('BUTTONS');
            expect(parsedBody.components[1].buttons).toHaveLength(2);
            expect(parsedBody.components[1].buttons[0].type).toBe('QUICK_REPLY');
            expect(parsedBody.components[1].buttons[1].type).toBe('URL');
        });

        it('should create template with named parameters', async () => {
            const templateData: TemplateRequestBody = {
                name: 'named_params_template',
                language: LanguagesEnum.English,
                category: CategoryEnum.Marketing,
                components: [
                    {
                        type: 'BODY',
                        text: 'Hello {{customer_name}}, your order {{order_id}} is ready!',
                        example: {
                            body_text_named_params: [
                                { param_name: 'customer_name', example: 'John' },
                                { param_name: 'order_id', example: '12345' },
                            ],
                        },
                    },
                ],
            };

            await whatsApp.templates.createTemplate(templateData);

            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const parsedBody = JSON.parse(body);

            expect(parsedBody.components[0].example.body_text_named_params).toHaveLength(2);
            expect(parsedBody.components[0].example.body_text_named_params[0].param_name).toBe('customer_name');
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors when getting template', async () => {
            mockRequestSend.mockRejectedValue(new Error('API Error: Template not found'));

            await expect(whatsApp.templates.getTemplate('invalid_id')).rejects.toThrow('API Error: Template not found');
        });

        it('should handle errors when updating template', async () => {
            mockRequestSend.mockRejectedValue(new Error('Update failed: Invalid template data'));

            const updateData = { name: 'invalid_template' };
            await expect(whatsApp.templates.updateTemplate('template_123', updateData)).rejects.toThrow(
                'Update failed: Invalid template data',
            );
        });

        it('should handle errors when creating template', async () => {
            mockRequestSend.mockRejectedValue(new Error('Create failed: Template name already exists'));

            const templateData: TemplateRequestBody = {
                name: 'existing_template',
                language: LanguagesEnum.English,
                category: CategoryEnum.Marketing,
                components: [],
            };

            await expect(whatsApp.templates.createTemplate(templateData)).rejects.toThrow(
                'Create failed: Template name already exists',
            );
        });

        it('should handle errors when deleting template', async () => {
            mockRequestSend.mockRejectedValue(new Error('Delete failed: Template is in use'));

            const deleteParams: TemplateDeleteParams = {
                hsm_id: 'hsm_123',
                name: 'active_template',
            };

            await expect(whatsApp.templates.deleteTemplate(deleteParams)).rejects.toThrow(
                'Delete failed: Template is in use',
            );
        });

        it('should handle network errors', async () => {
            mockRequestSend.mockRejectedValue(new Error('Network error: Connection timeout'));

            await expect(whatsApp.templates.getTemplates()).rejects.toThrow('Network error: Connection timeout');
        });
    });

    describe('API Integration', () => {
        it('should be accessible through WhatsApp instance', () => {
            expect(whatsApp.templates).toBeDefined();
            expect(typeof whatsApp.templates.getTemplate).toBe('function');
            expect(typeof whatsApp.templates.updateTemplate).toBe('function');
            expect(typeof whatsApp.templates.getTemplates).toBe('function');
            expect(typeof whatsApp.templates.createTemplate).toBe('function');
            expect(typeof whatsApp.templates.deleteTemplate).toBe('function');
        });

        it('should use consistent endpoint for template operations', async () => {
            const templateId = 'test_template_123';

            // Test get operation
            await whatsApp.templates.getTemplate(templateId);
            const getEndpoint = mockRequestSend.mock.calls[0][1];

            mockRequestSend.mockClear();

            // Test update operation
            await whatsApp.templates.updateTemplate(templateId, { name: 'updated' });
            const updateEndpoint = mockRequestSend.mock.calls[0][1];

            expect(getEndpoint).toBe(templateId);
            expect(updateEndpoint).toBe(templateId);
        });

        it('should use correct business account ID in endpoints', async () => {
            const businessAcctId = whatsApp.requester.businessAcctId;

            await whatsApp.templates.getTemplates();
            const [_, endpoint] = mockRequestSend.mock.calls[0];

            expect(endpoint).toContain(businessAcctId);
            expect(endpoint).toContain('message_templates');
        });

        it('should handle timeout configuration correctly', async () => {
            const timeoutValue = whatsApp.config.REQUEST_TIMEOUT;

            await whatsApp.templates.getTemplate('test_123');
            const [_, __, timeout] = mockRequestSend.mock.calls[0];

            expect(timeout).toBe(timeoutValue);
        });
    });

    describe('Query String Handling', () => {
        it('should build correct query string for complex parameters', async () => {
            const params: TemplateGetParams = {
                limit: 25,
                name: 'test template with spaces',
                language: LanguagesEnum.English_US,
                category: CategoryEnum.Utility,
                status: TemplateStatusEnum.Pending,
            };

            await whatsApp.templates.getTemplates(params);

            const [_, endpoint] = mockRequestSend.mock.calls[0];

            expect(endpoint).toContain('limit=25');
            expect(endpoint).toContain('name=test%20template%20with%20spaces');
            expect(endpoint).toContain('language=en_US');
            expect(endpoint).toContain('category=UTILITY');
            expect(endpoint).toContain('status=PENDING');
        });

        it('should handle empty parameters object', async () => {
            await whatsApp.templates.getTemplates({});

            const [_, endpoint] = mockRequestSend.mock.calls[0];

            expect(endpoint).toBe(`${whatsApp.requester.businessAcctId}/message_templates`);
        });

        it('should handle partial parameters', async () => {
            const params: TemplateGetParams = {
                limit: 5,
                status: TemplateStatusEnum.Approved,
            };

            await whatsApp.templates.getTemplates(params);

            const [_, endpoint] = mockRequestSend.mock.calls[0];

            expect(endpoint).toContain('limit=5');
            expect(endpoint).toContain('status=APPROVED');
            expect(endpoint).not.toContain('name=');
            expect(endpoint).not.toContain('language=');
            expect(endpoint).not.toContain('category=');
        });
    });
});
