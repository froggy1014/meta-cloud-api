import { WhatsApp } from 'meta-cloud-api';

const client = new WhatsApp({
    accessToken: process.env.CLOUD_API_ACCESS_TOKEN,
    phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
});

/**
 * Get the current throughput level of the phone number
 *
 * Throughput represents the maximum messages per second (mps) that can be sent/received:
 * - STANDARD: 80 mps by default (or 5 mps for WhatsApp Business app coexistence numbers)
 * - HIGH: 1,000 mps (automatic upgrade for eligible numbers)
 * - NOT_APPLICABLE: Throughput not applicable for this number
 */
async function getThroughput() {
    try {
        const result = await client.phoneNumbers.getThroughput();

        console.log('Throughput Information:');
        console.log(`• Phone Number ID: ${result.id}`);
        console.log(`• Level: ${result.throughput.level}`);

        // Provide context based on throughput level
        switch (result.throughput.level) {
            case 'STANDARD':
                console.log('  → 80 messages per second (default)');
                console.log('  → Or 5 mps if using WhatsApp Business app coexistence');
                console.log('\nEligibility for HIGH throughput (1,000 mps):');
                console.log('  • Portfolio must have unlimited messaging limit');
                console.log('  • Must message 100K+ unique users in 24h (outside service window)');
                console.log('  • Quality score must be YELLOW or higher');
                break;
            case 'HIGH':
                console.log('  → 1,000 messages per second');
                console.log('  ✓ Your number has been upgraded to higher throughput!');
                break;
            case 'NOT_APPLICABLE':
                console.log('  → Throughput not applicable for this number');
                break;
        }
    } catch (error) {
        console.error('Error getting throughput:', error);
    }
}

/**
 * Get phone number details including throughput
 */
async function _getPhoneNumberWithThroughput() {
    try {
        // Get phone number details with throughput field
        const result = await client.phoneNumbers.getPhoneNumberById('throughput,quality_rating,verified_name');

        console.log('Phone Number Details:');
        console.log(`• Verified Name: ${result.verified_name}`);
        console.log(`• Quality Rating: ${result.quality_rating}`);

        if (result.throughput) {
            console.log(`• Throughput Level: ${result.throughput.level}`);
        }
    } catch (error) {
        console.error('Error getting phone number details:', error);
    }
}

/**
 * Monitor throughput and quality for eligibility
 */
async function _checkThroughputEligibility() {
    try {
        const phoneDetails = await client.phoneNumbers.getPhoneNumberById(
            'throughput,quality_rating,messaging_limit_tier',
        );

        console.log('Throughput Upgrade Eligibility Check:');
        console.log(`• Current Throughput: ${phoneDetails.throughput?.level || 'N/A'}`);
        console.log(`• Quality Rating: ${phoneDetails.quality_rating}`);
        console.log(`• Messaging Limit Tier: ${phoneDetails.messaging_limit_tier || 'N/A'}`);

        // Check eligibility criteria
        const isHighThroughput = phoneDetails.throughput?.level === 'HIGH';
        const hasUnlimitedTier = phoneDetails.messaging_limit_tier === 'TIER_UNLIMITED';
        const hasGoodQuality = phoneDetails.quality_rating === 'GREEN' || phoneDetails.quality_rating === 'YELLOW';

        console.log('\nEligibility Status:');
        if (isHighThroughput) {
            console.log('✓ Already upgraded to HIGH throughput (1,000 mps)');
        } else {
            console.log(
                `${hasUnlimitedTier ? '✓' : '✗'} Unlimited messaging limit: ${hasUnlimitedTier ? 'Yes' : 'No'}`,
            );
            console.log(
                `${hasGoodQuality ? '✓' : '✗'} Quality score YELLOW or higher: ${hasGoodQuality ? 'Yes' : 'No'}`,
            );
            console.log('• Message 100K+ unique users in 24h: Check your analytics');

            if (hasUnlimitedTier && hasGoodQuality) {
                console.log('\n→ You meet 2/3 criteria. Ensure you message 100K+ unique users to qualify.');
            }
        }
    } catch (error) {
        console.error('Error checking eligibility:', error);
    }
}

// Run examples
getThroughput();
// _getPhoneNumberWithThroughput();
// _checkThroughputEligibility();
