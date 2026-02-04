// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/

// Endpoints:
// - POST /{PHONE_NUMBER_ID}/groups
// - DELETE /{GROUP_ID}
// - GET /{GROUP_ID}?fields
// - GET /{PHONE_NUMBER_ID}/groups?limit&after&before
// - GET /{GROUP_ID}/invite_link
// - POST /{GROUP_ID}/invite_link
// - GET /{GROUP_ID}/join_requests
// - POST /{GROUP_ID}/join_requests
// - DELETE /{GROUP_ID}/join_requests
// - DELETE /{GROUP_ID}/participants
// - POST /{GROUP_ID}

import { BaseAPI } from '../../types/base';
import type { WabaConfigType } from '../../types/config';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import type { RequesterClass, ResponseSuccess } from '../../types/request';
import { objectToQueryString } from '../../utils/objectToQueryString';

import type * as groups from './types';

/**
 * API for managing WhatsApp Groups.
 *
 * This API allows you to:
 * - Create and delete groups
 * - Approve/reject join requests
 * - Manage group invite links
 * - Remove participants
 * - Update group settings
 * - Fetch group metadata and active groups
 */
export default class GroupsApi extends BaseAPI implements groups.GroupsClass {
    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    async createGroup(params: groups.GroupCreateRequest): Promise<groups.GroupCreateResponse> {
        const body = {
            messaging_product: 'whatsapp',
            subject: params.subject,
        } as { messaging_product: 'whatsapp'; subject: string; description?: string; join_approval_mode?: string };

        if (params.description) body.description = params.description;
        if (params.join_approval_mode) body.join_approval_mode = params.join_approval_mode;

        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/groups`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }

    async deleteGroup(groupId: string): Promise<ResponseSuccess> {
        return this.sendJson(HttpMethodsEnum.Delete, `/${groupId}`, this.config[WabaConfigEnum.RequestTimeout], null);
    }

    async getGroupInfo(groupId: string, fields?: groups.GroupInfoFieldsParam): Promise<groups.GroupInfoResponse> {
        const fieldValue = Array.isArray(fields) ? fields.join(',') : fields;
        const queryParams = fieldValue ? objectToQueryString({ fields: fieldValue }) : '';
        return this.sendJson(
            HttpMethodsEnum.Get,
            `/${groupId}${queryParams}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async getActiveGroups(params?: groups.GroupListParams): Promise<groups.GroupListResponse> {
        const queryParams = params ? objectToQueryString(params) : '';
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/groups${queryParams}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async getGroupInviteLink(groupId: string): Promise<groups.GroupInviteLinkResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `/${groupId}/invite_link`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async resetGroupInviteLink(groupId: string): Promise<groups.GroupInviteLinkResponse> {
        const body = {
            messaging_product: 'whatsapp',
        };
        return this.sendJson(
            HttpMethodsEnum.Post,
            `/${groupId}/invite_link`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }

    async getJoinRequests(groupId: string): Promise<groups.GroupJoinRequestsResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `/${groupId}/join_requests`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    async approveJoinRequests(
        groupId: string,
        joinRequestIds: string[],
    ): Promise<groups.GroupJoinRequestsActionResponse> {
        const body = {
            messaging_product: 'whatsapp',
            join_requests: joinRequestIds,
        };
        return this.sendJson(
            HttpMethodsEnum.Post,
            `/${groupId}/join_requests`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }

    async rejectJoinRequests(
        groupId: string,
        joinRequestIds: string[],
    ): Promise<groups.GroupJoinRequestsActionResponse> {
        const body = {
            messaging_product: 'whatsapp',
            join_requests: joinRequestIds,
        };
        return this.sendJson(
            HttpMethodsEnum.Delete,
            `/${groupId}/join_requests`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }

    async removeParticipants(groupId: string, participants: string[]): Promise<ResponseSuccess> {
        const body = {
            messaging_product: 'whatsapp',
            participants: participants.map((user) => ({ user })),
        };
        return this.sendJson(
            HttpMethodsEnum.Delete,
            `/${groupId}/participants`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }

    async updateGroupSettings(
        groupId: string,
        params: groups.UpdateGroupSettingsRequest,
    ): Promise<groups.GroupSettingsResponse> {
        if (params.profilePictureFile) {
            const formData = new FormData();
            formData.append('messaging_product', 'whatsapp');
            if (params.subject) formData.append('subject', params.subject);
            if (params.description) formData.append('description', params.description);

            if (params.profilePictureFile instanceof Buffer) {
                const fileBlob = new globalThis.Blob([new Uint8Array(params.profilePictureFile)], {
                    type: 'image/jpeg',
                });
                formData.append('file', fileBlob as unknown as Blob);
            } else if (params.profilePictureFile instanceof Blob) {
                formData.append('file', params.profilePictureFile);
            } else {
                throw new Error('Invalid profile picture file type. Use a Buffer or Blob.');
            }

            return this.sendFormData(
                HttpMethodsEnum.Post,
                `/${groupId}`,
                this.config[WabaConfigEnum.RequestTimeout],
                formData,
            );
        }

        const body = {
            messaging_product: 'whatsapp',
        } as { messaging_product: 'whatsapp'; subject?: string; description?: string };

        if (params.subject) body.subject = params.subject;
        if (params.description) body.description = params.description;

        return this.sendJson(
            HttpMethodsEnum.Post,
            `/${groupId}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }
}
