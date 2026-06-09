// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/whatsapp-business-accounts/

import type { Paging, ResponseSuccess } from '../../../types/request';

export type SolutionGraphObject = Record<string, unknown>;

export type SolutionFieldsParam = string[] | string;

export type SolutionListParams = {
    fields?: SolutionFieldsParam;
    role?: 'OWNER' | 'PARTNER' | string;
    status?: string;
    limit?: number;
    after?: string;
    before?: string;
};

export type SolutionListResponse<T = SolutionGraphObject> = {
    data: T[];
    paging?: Paging;
    summary?: SolutionGraphObject;
};

export type CreateWhatsAppBusinessSolutionRequest = {
    partner_app_id?: string;
    partner_business_id?: string;
    [key: string]: unknown;
};

export type AcceptSolutionRequest = {
    partner_app_id?: string;
    [key: string]: unknown;
};

export type RejectSolutionRequest = {
    partner_app_id?: string;
    request_type?: string;
    reason?: string;
    [key: string]: unknown;
};

export type SolutionDeactivationRequest = {
    reason?: string;
    [key: string]: unknown;
};

export type SolutionMigrationIntent =
    | 'INITIATE_MIGRATION'
    | 'CANCEL_MIGRATION'
    | 'CONFIRM_MIGRATION'
    | 'SCHEDULE_MIGRATION';

export type SetSolutionMigrationIntentRequest = {
    solution_id: string;
    migration_intent: SolutionMigrationIntent;
    target_solution_id?: string;
    migration_reason?: string;
    scheduled_migration_time?: string;
};

export interface SolutionsClass {
    createWhatsAppBusinessSolution(
        applicationId: string,
        request: CreateWhatsAppBusinessSolutionRequest,
    ): Promise<SolutionGraphObject>;
    getApplicationWhatsAppBusinessSolutions(
        applicationId: string,
        params?: SolutionListParams,
    ): Promise<SolutionListResponse>;
    getSolutionAccessToken(solutionId: string, fields?: SolutionFieldsParam): Promise<SolutionGraphObject>;
    acceptSolutionDeactivationRequest(
        solutionId: string,
        request?: SolutionDeactivationRequest,
    ): Promise<ResponseSuccess>;
    acceptSolution(solutionId: string, request?: AcceptSolutionRequest): Promise<ResponseSuccess>;
    getSolutionDetails(solutionId: string, fields?: SolutionFieldsParam): Promise<SolutionGraphObject>;
    rejectSolutionDeactivationRequest(
        solutionId: string,
        request?: SolutionDeactivationRequest,
    ): Promise<ResponseSuccess>;
    rejectSolutionRequest(solutionId: string, request?: RejectSolutionRequest): Promise<ResponseSuccess>;
    sendSolutionDeactivationRequest(
        solutionId: string,
        request?: SolutionDeactivationRequest,
    ): Promise<ResponseSuccess>;
    getMigrationIntentDetails(migrationIntentId: string, fields?: SolutionFieldsParam): Promise<SolutionGraphObject>;
    listWabaSolutions(wabaId?: string, params?: SolutionListParams): Promise<SolutionListResponse>;
    setSolutionMigrationIntent(
        wabaId: string,
        request: SetSolutionMigrationIntentRequest,
    ): Promise<SolutionGraphObject>;
}
