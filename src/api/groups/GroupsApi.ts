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
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import type { ResponseSuccess } from '../../types/request';
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
 *
 * Endpoints covered:
 * - `POST /{PHONE_NUMBER_ID}/groups` - Create a new group
 * - `DELETE /{GROUP_ID}` - Delete a group
 * - `GET /{GROUP_ID}` - Get group info
 * - `GET /{PHONE_NUMBER_ID}/groups` - List active groups
 * - `GET /{GROUP_ID}/invite_link` - Get group invite link
 * - `POST /{GROUP_ID}/invite_link` - Reset group invite link
 * - `GET /{GROUP_ID}/join_requests` - Get pending join requests
 * - `POST /{GROUP_ID}/join_requests` - Approve join requests
 * - `DELETE /{GROUP_ID}/join_requests` - Reject join requests
 * - `DELETE /{GROUP_ID}/participants` - Remove participants
 * - `POST /{GROUP_ID}` - Update group settings
 *
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
 */
export default class GroupsApi extends BaseAPI implements groups.GroupsClass {
    /**
     * Create a new WhatsApp group.
     *
     * @param params - The group creation parameters.
     * @param params.subject - The name/subject of the group.
     * @param params.description - Optional description for the group.
     * @param params.join_approval_mode - Optional join approval mode setting.
     * @returns The created group response with group ID.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
     */
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

    /**
     * Delete a WhatsApp group.
     *
     * @param groupId - The ID of the group to delete.
     * @returns A success response confirming deletion.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
     */
    async deleteGroup(groupId: string): Promise<ResponseSuccess> {
        return this.sendJson(HttpMethodsEnum.Delete, `/${groupId}`, this.config[WabaConfigEnum.RequestTimeout], null);
    }

    /**
     * Retrieve metadata and information about a specific group.
     *
     * @param groupId - The ID of the group to retrieve.
     * @param fields - Optional fields to include in the response (e.g., subject, description, participants).
     * @returns The group information including metadata and requested fields.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
     */
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

    /**
     * List all active groups for the phone number with optional pagination.
     *
     * @param params - Optional pagination parameters.
     * @param params.limit - Maximum number of groups to return.
     * @param params.after - Cursor for forward pagination.
     * @param params.before - Cursor for backward pagination.
     * @returns A paginated list of active groups.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
     */
    async getActiveGroups(params?: groups.GroupListParams): Promise<groups.GroupListResponse> {
        const queryParams = params ? objectToQueryString(params) : '';
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/groups${queryParams}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    /**
     * Get the current invite link for a group.
     *
     * @param groupId - The ID of the group.
     * @returns The group invite link.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
     */
    async getGroupInviteLink(groupId: string): Promise<groups.GroupInviteLinkResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `/${groupId}/invite_link`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    /**
     * Reset and regenerate the invite link for a group, invalidating the previous link.
     *
     * @param groupId - The ID of the group.
     * @returns The new group invite link.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
     */
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

    /**
     * Get pending join requests for a group.
     *
     * @param groupId - The ID of the group.
     * @returns A list of pending join requests.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
     */
    async getJoinRequests(groupId: string): Promise<groups.GroupJoinRequestsResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `/${groupId}/join_requests`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    /**
     * Approve one or more pending join requests for a group.
     *
     * @param groupId - The ID of the group.
     * @param joinRequestIds - Array of join request IDs to approve.
     * @returns The result of the approval action.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
     */
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

    /**
     * Reject one or more pending join requests for a group.
     *
     * @param groupId - The ID of the group.
     * @param joinRequestIds - Array of join request IDs to reject.
     * @returns The result of the rejection action.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
     */
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

    /**
     * Remove one or more participants from a group.
     *
     * @param groupId - The ID of the group.
     * @param participants - Array of user WhatsApp IDs to remove from the group.
     * @returns A success response confirming removal.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
     */
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

    /**
     * Update group settings such as subject, description, or profile picture.
     *
     * @param groupId - The ID of the group to update.
     * @param params - The settings to update.
     * @param params.subject - Optional new group subject/name.
     * @param params.description - Optional new group description.
     * @param params.profilePictureFile - Optional profile picture as a Buffer or Blob.
     * @returns The updated group settings response.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
     */
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
