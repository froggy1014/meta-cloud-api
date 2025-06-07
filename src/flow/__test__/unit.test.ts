import { beforeEach, describe, expect, it, vi } from 'vitest';
import WhatsApp from '../../whatsapp';
import { FlowCategoryEnum, FlowStatusEnum } from '../types/common';

describe('Flow API - Unit Tests', () => {
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
            id: 'flow_123',
            name: 'Test Flow',
            status: FlowStatusEnum.Draft,
            categories: [FlowCategoryEnum.SignUp],
            validation_errors: [],
        });
    });

    describe('Flow CRUD Operations', () => {
        it('should list flows with correct endpoint', async () => {
            const wabaId = 'waba_123';

            await whatsApp.flow.listFlows(wabaId);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('GET');
            expect(endpoint).toBe(`/${wabaId}/flows`);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });

        it('should create flow with correct payload structure', async () => {
            const wabaId = 'waba_123';
            const flowData = {
                name: 'Test Flow',
                categories: [FlowCategoryEnum.SignUp, FlowCategoryEnum.LeadGeneration],
                endpoint_uri: 'https://example.com/flow-endpoint',
                flow_json: '{"version": "3.0"}',
                publish: false,
            };

            await whatsApp.flow.createFlow(wabaId, flowData);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('POST');
            expect(endpoint).toBe(`/${wabaId}/flows`);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeDefined();

            const parsedBody = JSON.parse(body);
            expect(parsedBody.name).toBe(flowData.name);
            expect(parsedBody.categories).toEqual(flowData.categories);
            expect(parsedBody.endpoint_uri).toBe(flowData.endpoint_uri);
            expect(parsedBody.flow_json).toBe(flowData.flow_json);
            expect(parsedBody.publish).toBe(flowData.publish);
        });

        it('should create flow with minimal required data', async () => {
            const wabaId = 'waba_123';
            const flowData = {
                name: 'Simple Flow',
            };

            await whatsApp.flow.createFlow(wabaId, flowData);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const parsedBody = JSON.parse(body);
            expect(parsedBody.name).toBe(flowData.name);
            expect(parsedBody.categories).toBeUndefined();
            expect(parsedBody.endpoint_uri).toBeUndefined();
            expect(parsedBody.clone_flow_id).toBeUndefined();
        });

        it('should get flow with correct endpoint', async () => {
            const flowId = 'flow_123';

            await whatsApp.flow.getFlow(flowId);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('GET');
            expect(endpoint).toBe(`/${flowId}`);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });

        it('should get flow with fields and date format parameters', async () => {
            const flowId = 'flow_123';
            const fields = 'name,status,categories';
            const dateFormat = 'U';

            await whatsApp.flow.getFlow(flowId, fields, dateFormat);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint] = mockRequestSend.mock.calls[0];

            expect(method).toBe('GET');
            expect(endpoint).toBe(`/${flowId}?fields=${encodeURIComponent(fields)}&date_format=${dateFormat}`);
        });

        it('should get flow preview with correct parameters', async () => {
            const flowId = 'flow_123';
            const invalidate = true;

            await whatsApp.flow.getFlowPreview(flowId, invalidate);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint] = mockRequestSend.mock.calls[0];

            expect(method).toBe('GET');
            expect(endpoint).toBe(`/${flowId}?fields=preview.invalidate%28true%29`);
        });

        it('should update flow metadata with correct payload', async () => {
            const flowId = 'flow_123';
            const updateData = {
                name: 'Updated Flow Name',
                categories: [FlowCategoryEnum.CustomerSupport],
                endpoint_uri: 'https://updated-endpoint.com',
                application_id: 'app_456',
            };

            await whatsApp.flow.updateFlowMetadata(flowId, updateData);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('POST');
            expect(endpoint).toBe(`/${flowId}`);
            expect(timeout).toBeGreaterThan(0);

            const parsedBody = JSON.parse(body);
            expect(parsedBody.name).toBe(updateData.name);
            expect(parsedBody.categories).toEqual(updateData.categories);
            expect(parsedBody.endpoint_uri).toBe(updateData.endpoint_uri);
            expect(parsedBody.application_id).toBe(updateData.application_id);
        });

        it('should delete flow with correct endpoint', async () => {
            const flowId = 'flow_123';

            await whatsApp.flow.deleteFlow(flowId);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('DELETE');
            expect(endpoint).toBe(`/${flowId}`);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });
    });

    describe('Flow Assets Operations', () => {
        it('should list assets with correct endpoint', async () => {
            const flowId = 'flow_123';

            await whatsApp.flow.listAssets(flowId);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('GET');
            expect(endpoint).toBe(`/${flowId}/assets`);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBeNull();
        });

        it('should update flow JSON with Buffer', async () => {
            const mockSendFormData = vi.spyOn(whatsApp.flow as any, 'sendFormData');
            mockSendFormData.mockResolvedValue({ success: true });

            const flowId = 'flow_123';
            const jsonBuffer = Buffer.from('{"version": "3.0"}');

            await whatsApp.flow.updateFlowJson(flowId, {
                file: jsonBuffer,
                name: 'custom_flow.json',
            });

            expect(mockSendFormData).toHaveBeenCalled();
            const [method, endpoint, timeout, formData] = mockSendFormData.mock.calls[0] as [
                string,
                string,
                number,
                FormData,
            ];

            expect(method).toBe('POST');
            expect(endpoint).toBe(`/${flowId}/assets`);
            expect(timeout).toBeGreaterThan(0);
            expect(formData).toBeInstanceOf(FormData);
            expect(formData.get('asset_type')).toBe('FLOW_JSON');
            expect(formData.get('name')).toBe('custom_flow.json');
        });

        it('should update flow JSON with JSON object', async () => {
            const mockSendFormData = vi.spyOn(whatsApp.flow as any, 'sendFormData');
            mockSendFormData.mockResolvedValue({ success: true });

            const flowId = 'flow_123';
            const jsonObject = { version: '3.0', screens: [] };

            await whatsApp.flow.updateFlowJson(flowId, {
                file: jsonObject,
            });

            expect(mockSendFormData).toHaveBeenCalled();
            const [_, __, ___, formData] = mockSendFormData.mock.calls[0] as [string, string, number, FormData];

            expect(formData).toBeInstanceOf(FormData);
            expect(formData.get('asset_type')).toBe('FLOW_JSON');
            expect(formData.get('name')).toBe('flow.json');
        });

        it('should update flow JSON with Blob', async () => {
            const mockSendFormData = vi.spyOn(whatsApp.flow as any, 'sendFormData');
            mockSendFormData.mockResolvedValue({ success: true });

            const flowId = 'flow_123';
            const jsonBlob = new Blob(['{"version": "3.0"}'], { type: 'application/json' });

            await whatsApp.flow.updateFlowJson(flowId, {
                file: jsonBlob,
                name: 'blob_flow.json',
            });

            expect(mockSendFormData).toHaveBeenCalled();
            const [_, __, ___, formData] = mockSendFormData.mock.calls[0] as [string, string, number, FormData];

            expect(formData).toBeInstanceOf(FormData);
            expect(formData.get('asset_type')).toBe('FLOW_JSON');
            expect(formData.get('name')).toBe('blob_flow.json');
        });

        it('should throw error for invalid file type in updateFlowJson', async () => {
            const flowId = 'flow_123';
            const invalidFile = 'invalid_string' as any;

            await expect(
                whatsApp.flow.updateFlowJson(flowId, {
                    file: invalidFile,
                }),
            ).rejects.toThrow('Invalid file type provided for Flow JSON update');
        });
    });

    describe('Flow Validation', () => {
        it('should validate flow JSON and return valid response', async () => {
            const mockUpdateFlowJson = vi.spyOn(whatsApp.flow, 'updateFlowJson');
            mockUpdateFlowJson.mockResolvedValue({
                success: true,
                validation_errors: [],
            });

            const flowId = 'flow_123';
            const jsonObject = { version: '3.0', screens: [] };

            const result = await whatsApp.flow.validateFlowJson(flowId, jsonObject);

            expect(mockUpdateFlowJson).toHaveBeenCalledWith(flowId, {
                file: jsonObject,
            });
            expect(result.valid).toBe(true);
            expect(result.success).toBe(true);
            expect(result.validation_errors).toEqual([]);
        });

        it('should validate flow JSON and return invalid response with errors', async () => {
            const mockUpdateFlowJson = vi.spyOn(whatsApp.flow, 'updateFlowJson');
            const validationErrors = [
                {
                    error: 'INVALID_VERSION',
                    error_type: 'validation',
                    message: 'Invalid version specified',
                    line_start: 1,
                    line_end: 1,
                    column_start: 15,
                    column_end: 20,
                    pointers: [],
                },
            ];

            mockUpdateFlowJson.mockResolvedValue({
                success: false,
                validation_errors: validationErrors,
            });

            const flowId = 'flow_123';
            const invalidJson = { version: '2.0' };

            const result = await whatsApp.flow.validateFlowJson(flowId, invalidJson);

            expect(result.valid).toBe(false);
            expect(result.success).toBe(false);
            expect(result.validation_errors).toEqual(validationErrors);
        });
    });

    describe('Flow Lifecycle Operations', () => {
        it('should publish flow with correct endpoint', async () => {
            const flowId = 'flow_123';

            await whatsApp.flow.publishFlow(flowId);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('POST');
            expect(endpoint).toBe(`/${flowId}/publish`);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBe('{}');
        });

        it('should deprecate flow with correct endpoint', async () => {
            const flowId = 'flow_123';

            await whatsApp.flow.deprecateFlow(flowId);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('POST');
            expect(endpoint).toBe(`/${flowId}/deprecate`);
            expect(timeout).toBeGreaterThan(0);
            expect(body).toBe('{}');
        });
    });

    describe('Flow Migration', () => {
        it('should migrate flows with correct payload', async () => {
            const destinationWabaId = 'dest_waba_123';
            const migrationData = {
                source_waba_id: 'source_waba_456',
                source_flow_names: ['Flow 1', 'Flow 2'],
            };

            await whatsApp.flow.migrateFlows(destinationWabaId, migrationData);

            expect(mockRequestSend).toHaveBeenCalled();
            const [method, endpoint, timeout, body] = mockRequestSend.mock.calls[0];

            expect(method).toBe('POST');
            expect(endpoint).toBe(`/${destinationWabaId}/migrate_flows`);
            expect(timeout).toBeGreaterThan(0);

            const parsedBody = JSON.parse(body);
            expect(parsedBody.source_waba_id).toBe(migrationData.source_waba_id);
            expect(parsedBody.source_flow_names).toEqual(migrationData.source_flow_names);
        });

        it('should migrate flows without flow names filter', async () => {
            const destinationWabaId = 'dest_waba_123';
            const migrationData = {
                source_waba_id: 'source_waba_456',
            };

            await whatsApp.flow.migrateFlows(destinationWabaId, migrationData);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const parsedBody = JSON.parse(body);
            expect(parsedBody.source_waba_id).toBe(migrationData.source_waba_id);
            expect(parsedBody.source_flow_names).toBeUndefined();
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully for list flows', async () => {
            mockRequestSend.mockRejectedValue(new Error('API Error: WABA not found'));

            await expect(whatsApp.flow.listFlows('invalid_waba')).rejects.toThrow('API Error: WABA not found');
        });

        it('should handle create flow errors', async () => {
            mockRequestSend.mockRejectedValue(new Error('Create failed: Invalid data'));

            const flowData = { name: 'Test Flow' };
            await expect(whatsApp.flow.createFlow('waba_123', flowData)).rejects.toThrow('Create failed: Invalid data');
        });

        it('should handle validation errors in validateFlowJson', async () => {
            const mockUpdateFlowJson = vi.spyOn(whatsApp.flow, 'updateFlowJson');
            mockUpdateFlowJson.mockRejectedValue(new Error('Network error'));

            const flowId = 'flow_123';
            const jsonObject = { version: '3.0' };

            await expect(whatsApp.flow.validateFlowJson(flowId, jsonObject)).rejects.toThrow('Network error');
        });

        it('should handle JSON stringify errors in updateFlowJson', async () => {
            const flowId = 'flow_123';
            const circularObject: any = {};
            circularObject.self = circularObject; // Create circular reference

            await expect(
                whatsApp.flow.updateFlowJson(flowId, {
                    file: circularObject,
                }),
            ).rejects.toThrow('Failed to stringify JSON object for Flow JSON update');
        });
    });

    describe('API Integration', () => {
        it('should be accessible through WhatsApp instance', () => {
            expect(whatsApp.flow).toBeDefined();
            expect(typeof whatsApp.flow.listFlows).toBe('function');
            expect(typeof whatsApp.flow.createFlow).toBe('function');
            expect(typeof whatsApp.flow.getFlow).toBe('function');
            expect(typeof whatsApp.flow.updateFlowMetadata).toBe('function');
            expect(typeof whatsApp.flow.deleteFlow).toBe('function');
            expect(typeof whatsApp.flow.listAssets).toBe('function');
            expect(typeof whatsApp.flow.updateFlowJson).toBe('function');
            expect(typeof whatsApp.flow.validateFlowJson).toBe('function');
            expect(typeof whatsApp.flow.publishFlow).toBe('function');
            expect(typeof whatsApp.flow.deprecateFlow).toBe('function');
            expect(typeof whatsApp.flow.migrateFlows).toBe('function');
        });

        it('should use consistent endpoint patterns for flow operations', async () => {
            const flowId = 'test_flow_123';

            // Test get flow
            await whatsApp.flow.getFlow(flowId);
            const getEndpoint = mockRequestSend.mock.calls[0][1];

            mockRequestSend.mockClear();

            // Test delete flow
            await whatsApp.flow.deleteFlow(flowId);
            const deleteEndpoint = mockRequestSend.mock.calls[0][1];

            expect(getEndpoint).toBe(`/${flowId}`);
            expect(deleteEndpoint).toBe(`/${flowId}`);
        });
    });
});
