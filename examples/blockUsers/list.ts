import WhatsApp from 'meta-cloud-api';

const client = new WhatsApp({
    accessToken: process.env.CLOUD_API_ACCESS_TOKEN,
    phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
});

/**
 * List all blocked users
 */
async function listBlockedUsers() {
    try {
        const result = await client.blockUsers.listBlockedUsers();

        console.log('Blocked users:');

        if (result.data && result.data.length > 0) {
            result.data.forEach((item) => {
                if (item.block_users && item.block_users.length > 0) {
                    item.block_users.forEach((user) => {
                        console.log(`• ${user.input} (WA ID: ${user.wa_id})`);
                    });
                }
            });
        } else {
            console.log('No blocked users found');
        }

        // Show pagination info
        if (result.paging) {
            console.log('\nPagination:');
            if (result.paging.cursors) {
                console.log(`  After cursor: ${result.paging.cursors.after || 'N/A'}`);
                console.log(`  Before cursor: ${result.paging.cursors.before || 'N/A'}`);
            }
            if (result.paging.next) {
                console.log(`  Next page: ${result.paging.next}`);
            }
            if (result.paging.previous) {
                console.log(`  Previous page: ${result.paging.previous}`);
            }
        }
    } catch (error) {
        console.error('Error listing blocked users:', error);
    }
}

/**
 * List blocked users with pagination
 */
async function listBlockedUsersWithPagination() {
    try {
        // Get first 10 blocked users
        const firstPage = await client.blockUsers.listBlockedUsers({ limit: 10 });

        console.log('First page of blocked users:');
        console.log(`Found ${firstPage.data.length} users`);

        // If there's a next page cursor, fetch the next page
        if (firstPage.paging?.cursors?.after) {
            const secondPage = await client.blockUsers.listBlockedUsers({
                limit: 10,
                after: firstPage.paging.cursors.after,
            });

            console.log('\nSecond page of blocked users:');
            console.log(`Found ${secondPage.data.length} users`);
        }
    } catch (error) {
        console.error('Error listing blocked users with pagination:', error);
    }
}

/**
 * Get all blocked users by iterating through pages
 */
async function getAllBlockedUsers() {
    try {
        const allUsers: Array<{ input: string; wa_id: string }> = [];
        let cursor: string | undefined;

        do {
            const result = await client.blockUsers.listBlockedUsers({
                limit: 100, // Max per page
                after: cursor,
            });

            // Collect users from this page
            result.data.forEach((item) => {
                if (item.block_users) {
                    allUsers.push(...item.block_users);
                }
            });

            // Update cursor for next iteration
            cursor = result.paging?.cursors?.after;
        } while (cursor);

        console.log(`Total blocked users: ${allUsers.length}`);
        allUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.input} (WA ID: ${user.wa_id})`);
        });
    } catch (error) {
        console.error('Error getting all blocked users:', error);
    }
}

// Run examples
listBlockedUsers();
// listBlockedUsersWithPagination();
// getAllBlockedUsers();
