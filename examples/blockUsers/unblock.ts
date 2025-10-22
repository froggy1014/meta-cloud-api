import WhatsApp from 'meta-cloud-api';

const client = new WhatsApp({
    accessToken: process.env.CLOUD_API_ACCESS_TOKEN,
    phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
});

/**
 * Unblock WhatsApp users
 */
async function unblockUsers() {
    try {
        // Unblock single user
        const result = await client.blockUsers.unblock(['1234567890']);

        console.log('Unblock operation completed:');
        console.log('Successfully unblocked users:', result.block_users.added_users);

        if (result.block_users.failed_users && result.block_users.failed_users.length > 0) {
            console.log('Failed to unblock users:', result.block_users.failed_users);
        }
    } catch (error) {
        console.error('Error unblocking users:', error);
    }
}

/**
 * Unblock multiple users at once
 */
async function unblockMultipleUsers() {
    try {
        const usersToUnblock = ['1234567890', '0987654321', '1122334455'];

        const result = await client.blockUsers.unblock(usersToUnblock);

        console.log('Bulk unblock operation completed:');
        console.log(`Successfully unblocked ${result.block_users.added_users?.length || 0} users`);
        console.log(`Failed to unblock ${result.block_users.failed_users?.length || 0} users`);

        // Show details
        if (result.block_users.added_users) {
            result.block_users.added_users.forEach((user) => {
                console.log(`✓ Unblocked: ${user.input} (WA ID: ${user.wa_id})`);
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
        console.error('Error unblocking users:', error);
    }
}

// Run examples
unblockUsers();
// unblockMultipleUsers();
