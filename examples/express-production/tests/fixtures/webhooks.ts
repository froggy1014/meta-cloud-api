/**
 * Webhook payload fixtures for testing
 */

export const textMessageWebhook = {
    object: 'whatsapp_business_account',
    entry: [
        {
            id: '123456789',
            changes: [
                {
                    value: {
                        messaging_product: 'whatsapp',
                        metadata: {
                            display_phone_number: '1234567890',
                            phone_number_id: '123456789012345',
                        },
                        contacts: [
                            {
                                profile: {
                                    name: 'Test User',
                                },
                                wa_id: '14155552671',
                            },
                        ],
                        messages: [
                            {
                                from: '14155552671',
                                id: 'wamid.123',
                                timestamp: '1234567890',
                                type: 'text',
                                text: {
                                    body: 'Hello',
                                },
                            },
                        ],
                    },
                    field: 'messages',
                },
            ],
        },
    ],
};

export const buttonReplyWebhook = {
    object: 'whatsapp_business_account',
    entry: [
        {
            id: '123456789',
            changes: [
                {
                    value: {
                        messaging_product: 'whatsapp',
                        metadata: {
                            display_phone_number: '1234567890',
                            phone_number_id: '123456789012345',
                        },
                        contacts: [
                            {
                                profile: {
                                    name: 'Test User',
                                },
                                wa_id: '14155552671',
                            },
                        ],
                        messages: [
                            {
                                from: '14155552671',
                                id: 'wamid.123',
                                timestamp: '1234567890',
                                type: 'interactive',
                                interactive: {
                                    type: 'button_reply',
                                    button_reply: {
                                        id: 'new_issue',
                                        title: 'New Issue',
                                    },
                                },
                            },
                        ],
                    },
                    field: 'messages',
                },
            ],
        },
    ],
};

export const listReplyWebhook = {
    object: 'whatsapp_business_account',
    entry: [
        {
            id: '123456789',
            changes: [
                {
                    value: {
                        messaging_product: 'whatsapp',
                        metadata: {
                            display_phone_number: '1234567890',
                            phone_number_id: '123456789012345',
                        },
                        contacts: [
                            {
                                profile: {
                                    name: 'Test User',
                                },
                                wa_id: '14155552671',
                            },
                        ],
                        messages: [
                            {
                                from: '14155552671',
                                id: 'wamid.123',
                                timestamp: '1234567890',
                                type: 'interactive',
                                interactive: {
                                    type: 'list_reply',
                                    list_reply: {
                                        id: 'TECHNICAL_SUPPORT',
                                        title: 'Technical Support',
                                    },
                                },
                            },
                        ],
                    },
                    field: 'messages',
                },
            ],
        },
    ],
};

export const statusWebhook = {
    object: 'whatsapp_business_account',
    entry: [
        {
            id: '123456789',
            changes: [
                {
                    value: {
                        messaging_product: 'whatsapp',
                        metadata: {
                            display_phone_number: '1234567890',
                            phone_number_id: '123456789012345',
                        },
                        statuses: [
                            {
                                id: 'wamid.123',
                                status: 'delivered',
                                timestamp: '1234567890',
                                recipient_id: '14155552671',
                            },
                        ],
                    },
                    field: 'messages',
                },
            ],
        },
    ],
};
