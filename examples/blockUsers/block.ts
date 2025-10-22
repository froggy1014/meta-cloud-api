import WhatsApp from 'meta-cloud-api';

const client = new WhatsApp({
    accessToken: process.env.CLOUD_API_ACCESS_TOKEN,
    phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
});

/**
 * Block WhatsApp users
 *
 * Note: You can only block users that have messaged your business in the last 24 hours
 */
async function blockUsers() {
    try {
        // Block single user
        const result = await client.blockUsers.block(['1234567890']);

        console.log('Block operation completed:');
        console.log('Successfully blocked users:', result.block_users.added_users);

        if (result.block_users.failed_users && result.block_users.failed_users.length > 0) {
            console.log('Failed to block users:', result.block_users.failed_users);
        }
    } catch (error) {
        console.error('Error blocking users:', error);
    }
}

/**
 * Block multiple users at once
 */
async function blockMultipleUsers() {
    try {
        const usersToBlock = ['1234567890', '0987654321', '1122334455'];

        const result = await client.blockUsers.block(usersToBlock);

        console.log('Bulk block operation completed:');
        console.log(`Successfully blocked ${result.block_users.added_users?.length || 0} users`);
        console.log(`Failed to block ${result.block_users.failed_users?.length || 0} users`);

        // Show details
        if (result.block_users.added_users) {
            result.block_users.added_users.forEach((user) => {
                console.log(`✓ Blocked: ${user.input} (WA ID: ${user.wa_id})`);
            });
        }

        if (result.block_users.failed_users) {
            result.block_users.failed_users.forEach((user) => {
                console.log(`✗ Failed: ${user.input} (WA ID: ${user.wa_id})`);
                if (user.errors) {
                    user.errors.forEach((err) => {
                        console.log(`  Error: ${err.message} (Code: ${err.code})`);
                    });
                }
            });
        }
    } catch (error) {
        console.error('Error blocking users:', error);
    }
}

// Run examples
blockUsers();
// blockMultipleUsers();
