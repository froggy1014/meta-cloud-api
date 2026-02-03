// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/

import type { ResponseSuccess } from '../../../types/request';

/**
 * Groups API Types
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
 */

export type GroupJoinApprovalMode = 'approval_required' | 'auto_approve';

export type GroupCreateRequest = {
    subject: string;
    description?: string;
    join_approval_mode?: GroupJoinApprovalMode;
};

export type GroupCreateResponse = {
    messaging_product: 'whatsapp';
    id: string;
    invite_link?: string;
};

export type GroupInfoField =
    | 'join_approval_mode'
    | 'subject'
    | 'description'
    | 'suspended'
    | 'creation_timestamp'
    | 'participants'
    | 'total_participant_count';

export type GroupInfoFieldsParam = GroupInfoField[] | string;

export type GroupParticipant = {
    wa_id: string;
};

export type GroupInfoResponse = {
    messaging_product: 'whatsapp';
    id: string;
    subject?: string;
    description?: string;
    suspended?: boolean;
    creation_timestamp?: number;
    participants?: GroupParticipant[];
    total_participant_count?: number;
    join_approval_mode?: GroupJoinApprovalMode;
};

export type GroupInviteLinkResponse = {
    messaging_product: 'whatsapp';
    invite_link: string;
};

export type GroupJoinRequest = {
    join_request_id: string;
    wa_id: string;
    creation_timestamp: number;
};

export type GroupJoinRequestError = {
    code: number;
    message: string;
    title?: string;
    error_data?: {
        details?: string;
    };
};

export type GroupJoinRequestFailure = {
    join_request_id: string;
    errors: GroupJoinRequestError[];
};

export type GroupJoinRequestsResponse = {
    data: GroupJoinRequest[];
    paging?: PagingInfo;
};

export type GroupJoinRequestsActionResponse = {
    messaging_product: 'whatsapp';
    approved_join_requests?: string[];
    rejected_join_requests?: string[];
    failed_join_requests?: GroupJoinRequestFailure[];
    errors?: GroupJoinRequestError[];
};

export type GroupSummary = {
    id: string;
    subject: string;
    created_at: number;
};

export type GroupListResponse = {
    data: {
        groups: GroupSummary[];
    };
    paging?: PagingInfo;
};

export type GroupListParams = {
    limit?: number;
    after?: string;
    before?: string;
};

export type GroupParticipantInput = {
    user: string;
};

export type GroupParticipantsRequest = {
    participants: GroupParticipantInput[];
};

export type UpdateGroupSettingsRequest = {
    subject?: string;
    description?: string;
    profilePictureFile?: Blob | Buffer;
};

export type GroupSettingsResponse = ResponseSuccess;

export interface GroupsClass {
    createGroup(params: GroupCreateRequest): Promise<GroupCreateResponse>;
    deleteGroup(groupId: string): Promise<ResponseSuccess>;
    getGroupInfo(groupId: string, fields?: GroupInfoFieldsParam): Promise<GroupInfoResponse>;
    getActiveGroups(params?: GroupListParams): Promise<GroupListResponse>;
    getGroupInviteLink(groupId: string): Promise<GroupInviteLinkResponse>;
    resetGroupInviteLink(groupId: string): Promise<GroupInviteLinkResponse>;
    getJoinRequests(groupId: string): Promise<GroupJoinRequestsResponse>;
    approveJoinRequests(groupId: string, joinRequestIds: string[]): Promise<GroupJoinRequestsActionResponse>;
    rejectJoinRequests(groupId: string, joinRequestIds: string[]): Promise<GroupJoinRequestsActionResponse>;
    removeParticipants(groupId: string, participants: string[]): Promise<ResponseSuccess>;
    updateGroupSettings(groupId: string, params: UpdateGroupSettingsRequest): Promise<GroupSettingsResponse>;
}

export type PagingInfo = {
    cursors?: {
        before?: string;
        after?: string;
    };
    previous?: string;
    next?: string;
};
