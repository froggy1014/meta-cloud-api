import type { WebhookMetadata } from './common';

// ============================================================================
// Shared Group Error/Participant Types
// @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/webhooks
// ============================================================================

export interface GroupWebhookError {
    /** Error code */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Short title for the error */
    title: string;
    error_data?: {
        /** Detailed error description */
        details: string;
    };
}

export interface GroupAddedParticipant {
    /** WhatsApp ID of the participant */
    wa_id: string;
    /** Phone number input provided when adding (optional) */
    input?: string;
}

export interface GroupRemovedParticipant {
    /** Phone number or WhatsApp ID of the removed participant */
    input: string;
}

export interface GroupFailedParticipant {
    /** Phone number or WhatsApp ID that failed */
    input: string;
    errors: GroupWebhookError[];
}

// ============================================================================
// group_lifecycle_update Webhook Types
// @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/webhooks
//
// Triggered when a group is created or deleted.
//
// value.groups[].type values:
//   - "group_create" — Group was successfully created
//   - "group_delete" — Group was successfully deleted
// ============================================================================

export type GroupLifecycleEventType = 'group_create' | 'group_delete';

export interface GroupLifecycleEntry {
    /** Unix timestamp of the event */
    timestamp: string;
    /** The group's WhatsApp ID */
    group_id: string;
    /** Event type: group_create or group_delete */
    type: GroupLifecycleEventType;
    /** Correlation ID for the API request that triggered this event */
    request_id: string;
    /** Group subject/name — present on group_create */
    subject?: string;
    /** Group description — present on group_create */
    description?: string;
    /** Invite link for the group — present on successful group_create */
    invite_link?: string;
    /** Whether users need admin approval to join — present on group_create */
    join_approval_mode?: string;
    /** Present when the operation failed */
    errors?: GroupWebhookError[];
}

export interface GroupLifecycleUpdateValue {
    messaging_product: 'whatsapp';
    metadata: WebhookMetadata;
    /** Array of group lifecycle events */
    groups: GroupLifecycleEntry[];
}

export interface GroupLifecycleUpdateWebhookValue {
    field: 'group_lifecycle_update';
    value: GroupLifecycleUpdateValue;
}

// ============================================================================
// group_participants_update Webhook Types
// @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/webhooks
//
// Triggered when participants are added, removed, or when join requests occur.
//
// value.groups[].type values:
//   - "group_participants_add"         — Participant(s) added to the group
//   - "group_participants_remove"      — Participant(s) removed or left the group
//   - "group_join_request_created"     — A user submitted a join request
//   - "group_join_request_revoked"     — A user cancelled their join request
// ============================================================================

export type GroupParticipantsEventType =
    | 'group_participants_add'
    | 'group_participants_remove'
    | 'group_join_request_created'
    | 'group_join_request_revoked';

export type GroupParticipantsAddReason = 'invite_link' | 'admin_added';

/** Who initiated the remove action */
export type GroupParticipantsInitiatedBy = 'business' | 'participant';

export interface GroupParticipantsEntry {
    /** Unix timestamp of the event */
    timestamp: string;
    /** The group's WhatsApp ID */
    group_id: string;
    /** Event type */
    type: GroupParticipantsEventType;
    /** Correlation ID for the API request */
    request_id?: string;

    // --- group_participants_add ---
    /** Reason participants were added (e.g. invite_link) */
    reason?: GroupParticipantsAddReason | string;
    /** Participants successfully added */
    added_participants?: GroupAddedParticipant[];

    // --- group_participants_remove ---
    /** Whether business or participant initiated the removal */
    initiated_by?: GroupParticipantsInitiatedBy;
    /** Participants successfully removed */
    removed_participants?: GroupRemovedParticipant[];
    /** Participants that could not be removed */
    failed_participants?: GroupFailedParticipant[];

    // --- group_join_request_created / group_join_request_revoked ---
    /** ID of the join request */
    join_request_id?: string;
    /** WhatsApp ID of the user who submitted or cancelled the request */
    wa_id?: string;

    /** Present when the operation partially or fully failed */
    errors?: GroupWebhookError[];
}

export interface GroupParticipantsUpdateValue {
    messaging_product: 'whatsapp';
    metadata: WebhookMetadata;
    /** Array of participant update events */
    groups: GroupParticipantsEntry[];
}

export interface GroupParticipantsUpdateWebhookValue {
    field: 'group_participants_update';
    value: GroupParticipantsUpdateValue;
}

// ============================================================================
// group_settings_update Webhook Types
// @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/webhooks
//
// Triggered when group settings (subject, description, profile photo) are updated.
//
// value.groups[].type: "group_settings_update"
// Each field (profile_picture, group_subject, group_description) indicates
// whether its update succeeded via update_successful.
// ============================================================================

export interface GroupSettingFieldResult {
    /** Whether this specific field was successfully updated */
    update_successful: boolean;
    /** Present on profile_picture updates */
    mime_type?: string;
    /** SHA-256 hash of the uploaded image — present on profile_picture updates */
    sha256?: string;
    /** New text value — present on group_subject / group_description updates */
    text?: string;
    /** Present when update_successful is false */
    errors?: GroupWebhookError[];
}

export interface GroupSettingsEntry {
    /** Unix timestamp of the event */
    timestamp: string;
    /** The group's WhatsApp ID */
    group_id: string;
    /** Always "group_settings_update" */
    type: 'group_settings_update';
    /** Correlation ID for the API request */
    request_id?: string;
    /** Result of the profile picture update */
    profile_picture?: GroupSettingFieldResult;
    /** Result of the group subject (name) update */
    group_subject?: GroupSettingFieldResult;
    /** Result of the group description update */
    group_description?: GroupSettingFieldResult;
    /** Top-level errors when the entire update failed */
    errors?: GroupWebhookError[];
}

export interface GroupSettingsUpdateValue {
    messaging_product: 'whatsapp';
    metadata: WebhookMetadata;
    /** Array of group settings update events */
    groups: GroupSettingsEntry[];
}

export interface GroupSettingsUpdateWebhookValue {
    field: 'group_settings_update';
    value: GroupSettingsUpdateValue;
}

// ============================================================================
// group_status_update Webhook Types
// @see https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/webhooks
//
// Triggered when a group is suspended or when a suspension is cleared.
// WhatsApp may suspend groups that violate Terms of Service.
//
// value.groups[].type values:
//   - "group_suspend"         — Group has been suspended
//   - "group_suspend_cleared" — Group suspension has been lifted
// ============================================================================

export type GroupStatusEventType = 'group_suspend' | 'group_suspend_cleared';

export interface GroupStatusEntry {
    /** Unix timestamp of the event */
    timestamp: string;
    /** The group's WhatsApp ID */
    group_id: string;
    /** Event type: group_suspend or group_suspend_cleared */
    type: GroupStatusEventType;
}

export interface GroupStatusUpdateValue {
    messaging_product: 'whatsapp';
    metadata: WebhookMetadata;
    /** Array of group status events */
    groups: GroupStatusEntry[];
}

export interface GroupStatusUpdateWebhookValue {
    field: 'group_status_update';
    value: GroupStatusUpdateValue;
}
