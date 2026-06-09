// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/whatsapp-business-accounts/

// Endpoints:
// - POST /{APPLICATION_ID}/whatsapp_business_solution
// - GET /{APPLICATION_ID}/whatsapp_business_solutions
// - GET /{SOLUTION_ID}/access_token
// - POST /{SOLUTION_ID}/accept_deactivation_request
// - POST /{SOLUTION_ID}/accept
// - GET /{SOLUTION_ID}
// - POST /{SOLUTION_ID}/reject_deactivation_request
// - POST /{SOLUTION_ID}/reject
// - POST /{SOLUTION_ID}/send_deactivation_request
// - GET /{MIGRATION_INTENT_ID}
// - GET /{WABA_ID}/solutions
// - POST /{WABA_ID}/set_solution_migration_intent

import { BaseAPI } from '../../types/base';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import type { ResponseSuccess } from '../../types/request';
import { objectToQueryString } from '../../utils/objectToQueryString';

import type * as solutions from './types';

export default class SolutionsApi extends BaseAPI implements solutions.SolutionsClass {
    private toQuery(params?: solutions.SolutionListParams): string {
        if (!params) return '';

        const fields = Array.isArray(params.fields) ? params.fields.join(',') : params.fields;
        return objectToQueryString({
            fields,
            role: params.role,
            status: params.status,
            limit: params.limit,
            after: params.after,
            before: params.before,
        });
    }

    private fieldsQuery(fields?: solutions.SolutionFieldsParam): string {
        const fieldsValue = Array.isArray(fields) ? fields.join(',') : fields;
        return fieldsValue ? objectToQueryString({ fields: fieldsValue }) : '';
    }

    async createWhatsAppBusinessSolution(
        applicationId: string,
        request: solutions.CreateWhatsAppBusinessSolutionRequest,
    ): Promise<solutions.SolutionGraphObject> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${applicationId}/whatsapp_business_solution`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(request),
        );
    }

    async getApplicationWhatsAppBusinessSolutions(
        applicationId: string,
        params?: solutions.SolutionListParams,
    ): Promise<solutions.SolutionListResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${applicationId}/whatsapp_business_solutions${this.toQuery(params)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async getSolutionAccessToken(
        solutionId: string,
        fields?: solutions.SolutionFieldsParam,
    ): Promise<solutions.SolutionGraphObject> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${solutionId}/access_token${this.fieldsQuery(fields)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async acceptSolutionDeactivationRequest(
        solutionId: string,
        request: solutions.SolutionDeactivationRequest = {},
    ): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${solutionId}/accept_deactivation_request`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(request),
        );
    }

    async acceptSolution(solutionId: string, request: solutions.AcceptSolutionRequest = {}): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${solutionId}/accept`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(request),
        );
    }

    async getSolutionDetails(
        solutionId: string,
        fields?: solutions.SolutionFieldsParam,
    ): Promise<solutions.SolutionGraphObject> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${solutionId}${this.fieldsQuery(fields)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async rejectSolutionDeactivationRequest(
        solutionId: string,
        request: solutions.SolutionDeactivationRequest = {},
    ): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${solutionId}/reject_deactivation_request`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(request),
        );
    }

    async rejectSolutionRequest(
        solutionId: string,
        request: solutions.RejectSolutionRequest = {},
    ): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${solutionId}/reject`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(request),
        );
    }

    async sendSolutionDeactivationRequest(
        solutionId: string,
        request: solutions.SolutionDeactivationRequest = {},
    ): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${solutionId}/send_deactivation_request`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(request),
        );
    }

    async getMigrationIntentDetails(
        migrationIntentId: string,
        fields?: solutions.SolutionFieldsParam,
    ): Promise<solutions.SolutionGraphObject> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${migrationIntentId}${this.fieldsQuery(fields)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async listWabaSolutions(
        wabaId: string = this.config[WabaConfigEnum.BusinessAcctId],
        params?: solutions.SolutionListParams,
    ): Promise<solutions.SolutionListResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${wabaId}/solutions${this.toQuery(params)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async setSolutionMigrationIntent(
        wabaId: string,
        request: solutions.SetSolutionMigrationIntentRequest,
    ): Promise<solutions.SolutionGraphObject> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${wabaId}/set_solution_migration_intent`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(request),
        );
    }
}
