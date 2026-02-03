// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/block-users/

import type { MetaErrorDetail } from '../../../types/request';

/**
 * Block Users API Types
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/block-users
 */

/**
 * User object for blocking/unblocking operations
 */
export type BlockUserObject = {
    user: string; // Phone number or WhatsApp ID
};

/**
 * Blocked user information in response
 */
export type BlockedUserInfo = {
    input: string; // Original input (phone number or WA_ID)
    wa_id: string; // WhatsApp ID
};

/**
 * Failed user information with error details
 * Uses common MetaErrorDetail type for consistency across APIs
 */
export type FailedUserInfo = BlockedUserInfo & {
    errors?: MetaErrorDetail[];
};

/**
 * Request body for blocking users
 */
export type BlockUsersRequest = {
    messaging_product: 'whatsapp';
    block_users: BlockUserObject[];
};

/**
 * Request body for unblocking users
 */
export type UnblockUsersRequest = {
    messaging_product: 'whatsapp';
    block_users: BlockUserObject[];
};

/**
 * Response for block/unblock operations
 */
export type BlockUsersResponse = {
    messaging_product: 'whatsapp';
    block_users: {
        added_users?: BlockedUserInfo[];
        failed_users?: FailedUserInfo[];
    };
};

/**
 * Pagination cursors for list operations
 */
export type PagingCursors = {
    after?: string;
    before?: string;
};

/**
 * Pagination information
 */
export type PagingInfo = {
    cursors?: PagingCursors;
    previous?: string;
    next?: string;
};

/**
 * List blocked users response
 */
export type ListBlockedUsersResponse = {
    data: Array<{
        block_users: BlockedUserInfo[];
    }>;
    paging?: PagingInfo;
};

/**
 * Query parameters for listing blocked users
 */
export type ListBlockedUsersParams = {
    limit?: number; // Maximum number of blocked users to fetch
    after?: string; // Cursor for pagination
    before?: string; // Cursor for pagination
};

/**
 * Block Users API Interface
 */
export interface BlockUsersClass {
    /**
     * Block one or more WhatsApp users
     * @param users - Array of phone numbers or WhatsApp IDs to block
     * @returns Response with successfully blocked and failed users
     * @throws Error if users have not messaged in last 24 hours
     * @see https://developers.facebook.com/docs/whatsapp/cloud-api/block-users#block-users
     */
    block(users: string[]): Promise<BlockUsersResponse>;

    /**
     * Unblock one or more WhatsApp users
     * @param users - Array of phone numbers or WhatsApp IDs to unblock
     * @returns Response with successfully unblocked and failed users
     * @see https://developers.facebook.com/docs/whatsapp/cloud-api/block-users#unblock-users
     */
    unblock(users: string[]): Promise<BlockUsersResponse>;

    /**
     * Get list of blocked WhatsApp users with pagination
     * @param params - Optional pagination parameters
     * @returns List of blocked users with pagination info
     * @see https://developers.facebook.com/docs/whatsapp/cloud-api/block-users#get-list-of-blocked-numbers
     */
    listBlockedUsers(params?: ListBlockedUsersParams): Promise<ListBlockedUsersResponse>;
}
