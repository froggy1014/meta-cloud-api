// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/

import GroupsApi from './GroupsApi';

export default GroupsApi;

export type {
    GroupCreateRequest,
    GroupCreateResponse,
    GroupInfoField,
    GroupInfoFieldsParam,
    GroupInfoResponse,
    GroupInviteLinkResponse,
    GroupJoinApprovalMode,
    GroupJoinRequest,
    GroupJoinRequestError,
    GroupJoinRequestFailure,
    GroupJoinRequestsActionResponse,
    GroupJoinRequestsResponse,
    GroupListParams,
    GroupListResponse,
    GroupParticipant,
    GroupParticipantInput,
    GroupParticipantsRequest,
    GroupSettingsResponse,
    GroupsClass,
    UpdateGroupSettingsRequest,
} from './types';
export { GroupsApi };
