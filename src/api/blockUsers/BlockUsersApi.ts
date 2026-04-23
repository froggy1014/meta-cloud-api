// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/block-users/

// Endpoints:
// - POST /{PHONE_NUMBER_ID}/block_users
// - DELETE /{PHONE_NUMBER_ID}/block_users
// - GET /{PHONE_NUMBER_ID}/block_users?limit&after&before

import { BaseAPI } from '../../types/base';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import { objectToQueryString } from '../../utils/objectToQueryString';
import { assertNonEmpty } from '../../utils/validate';
import type * as blockUsers from './types/blockUsers';

/**
 * API for blocking and unblocking WhatsApp users.
 *
 * Provides methods to block, unblock, and list blocked users for your
 * WhatsApp Business phone number.
 *
 * Limitations:
 * - Can only block users that have messaged your business in the last 24 hours
 * - 64k blocklist limit
 *
 * Endpoints covered:
 * - `POST /{PHONE_NUMBER_ID}/block_users` - Block one or more users
 * - `DELETE /{PHONE_NUMBER_ID}/block_users` - Unblock one or more users
 * - `GET /{PHONE_NUMBER_ID}/block_users` - List blocked users with pagination
 *
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/block-users/
 */
export default class BlockUsersApi extends BaseAPI implements blockUsers.BlockUsersClass {
    private readonly endpoint = 'block_users';

    /**
     * Build the request body for block/unblock operations.
     *
     * @param users - Array of phone numbers or WhatsApp IDs.
     * @returns The formatted request body.
     */
    private buildBlockUsersBody(users: string[]): blockUsers.BlockUsersRequest {
        return {
            messaging_product: 'whatsapp',
            block_users: users.map((user) => ({ user })),
        };
    }

    /**
     * Block one or more WhatsApp users
     * @param users - Array of phone numbers or WhatsApp IDs to block
     * @returns Response with successfully blocked and failed users
     * @throws Error if users have not messaged in last 24 hours
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/block-users/
     *
     * @example
     * ```typescript
     * // Block single user
     * const result = await client.blockUsers.block(['1234567890']);
     *
     * // Block multiple users
     * const result = await client.blockUsers.block(['1234567890', '0987654321']);
     *
     * // Check results
     * console.log('Blocked:', result.block_users.added_users);
     * console.log('Failed:', result.block_users.failed_users);
     * ```
     */
    async block(users: string[]): Promise<blockUsers.BlockUsersResponse> {
        assertNonEmpty(users, 'users');

        const body = this.buildBlockUsersBody(users);

        return await this.sendJson<blockUsers.BlockUsersResponse>(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }

    /**
     * Unblock one or more WhatsApp users
     * @param users - Array of phone numbers or WhatsApp IDs to unblock
     * @returns Response with successfully unblocked and failed users
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/block-users/
     *
     * @example
     * ```typescript
     * // Unblock single user
     * const result = await client.blockUsers.unblock(['1234567890']);
     *
     * // Unblock multiple users
     * const result = await client.blockUsers.unblock(['1234567890', '0987654321']);
     *
     * // Check results
     * console.log('Unblocked:', result.block_users.added_users);
     * console.log('Failed:', result.block_users.failed_users);
     * ```
     */
    async unblock(users: string[]): Promise<blockUsers.BlockUsersResponse> {
        assertNonEmpty(users, 'users');

        const body = this.buildBlockUsersBody(users);

        return await this.sendJson<blockUsers.BlockUsersResponse>(
            HttpMethodsEnum.Delete,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(body),
        );
    }

    /**
     * Get list of blocked WhatsApp users with pagination
     * @param params - Optional pagination parameters
     * @returns List of blocked users with pagination info
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/block-users/
     *
     * @example
     * ```typescript
     * // Get first 10 blocked users
     * const result = await client.blockUsers.listBlockedUsers({ limit: 10 });
     *
     * // Pagination with cursor
     * const nextPage = await client.blockUsers.listBlockedUsers({
     *   limit: 10,
     *   after: result.paging?.cursors?.after
     * });
     *
     * // Get all blocked users
     * const allBlocked = await client.blockUsers.listBlockedUsers();
     * ```
     */
    async listBlockedUsers(params?: blockUsers.ListBlockedUsersParams): Promise<blockUsers.ListBlockedUsersResponse> {
        let endpoint = `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}`;

        // Add query parameters if provided
        if (params) {
            const queryString = objectToQueryString(params);
            if (queryString) {
                endpoint += queryString;
            }
        }

        return await this.sendJson<blockUsers.ListBlockedUsersResponse>(
            HttpMethodsEnum.Get,
            endpoint,
            this.config[WabaConfigEnum.RequestTimeout],
        );
    }
}
