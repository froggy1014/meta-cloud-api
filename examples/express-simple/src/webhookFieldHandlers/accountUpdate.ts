import type { ProcessedAccountUpdate, WhatsApp } from 'meta-cloud-api';

/**
 * Example handler for account_update webhook field
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/webhooks/components#account_update
 */
export async function handleAccountUpdateWebhook(
    _whatsapp: WhatsApp,
    processed: ProcessedAccountUpdate,
): Promise<void> {
    console.log('🏢 Account update webhook received:');
    console.log('  WABA ID:', processed.wabaId);
    console.log('  Event:', processed.value.event);
    console.log('  Phone Number ID:', processed.value.phone_number_id);

    switch (processed.value.event) {
        case 'VERIFIED_ACCOUNT':
            console.log('  ✅ Account verified!');
            break;
        case 'DISABLED_UPDATE':
            console.log('  ⚠️  Account disabled status changed');
            console.log('  Banned:', processed.value.ban_info?.waba_ban_state);
            break;
        case 'ACCOUNT_VIOLATION':
            console.log('  ⚠️  Account policy violation');
            console.log('  Violations:', processed.value.violations);
            break;
        case 'ACCOUNT_RESTRICTION':
            console.log('  🚫 Account restricted');
            console.log('  Restrictions:', processed.value.restrictions);
            break;
    }
}
