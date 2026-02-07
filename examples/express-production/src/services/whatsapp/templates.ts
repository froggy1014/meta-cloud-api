import { MessageSender } from './sender.js';
import { config } from '@config/index.js';

/**
 * Template message helpers
 * Pre-defined message templates for common scenarios
 */
export class MessageTemplates {
    /**
     * Send welcome message with quick action button
     */
    static async sendWelcome(to: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const message = `👋 Welcome to ${config.BUSINESS_NAME}!\n\nI'm your support assistant. How can I help you today?`;

        return MessageSender.sendButtons(
            to,
            message,
            [
                { id: 'new_issue', title: '🆕 New Issue' },
                { id: 'check_status', title: '📋 Check Status' },
            ],
            undefined,
            'Powered by WhatsApp Support Bot',
        );
    }

    /**
     * Ask for user's name
     */
    static async askForName(to: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const message = "Great! Let's start by getting your name.\n\nWhat's your name?";

        return MessageSender.sendText(to, message);
    }

    /**
     * Ask for issue description
     */
    static async askForIssue(
        to: string,
        userName: string,
    ): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const message = `Thanks ${userName}! 👍\n\nPlease describe the issue you're experiencing in detail.`;

        return MessageSender.sendText(to, message);
    }

    /**
     * Show category selection list
     */
    static async showCategories(to: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const message = 'Please select the category that best describes your issue:';

        return MessageSender.sendList(to, message, 'Select Category', [
            {
                title: 'Common Issues',
                rows: [
                    {
                        id: 'TECHNICAL_SUPPORT',
                        title: '🔧 Technical Support',
                        description: 'Technical issues and bugs',
                    },
                    {
                        id: 'BILLING_PAYMENT',
                        title: '💳 Billing & Payment',
                        description: 'Payment and billing questions',
                    },
                    {
                        id: 'ACCOUNT_ACCESS',
                        title: '🔐 Account Access',
                        description: 'Login and account issues',
                    },
                ],
            },
            {
                title: 'Other',
                rows: [
                    {
                        id: 'PRODUCT_INQUIRY',
                        title: '❓ Product Inquiry',
                        description: 'General product questions',
                    },
                    {
                        id: 'FEATURE_REQUEST',
                        title: '✨ Feature Request',
                        description: 'Request new features',
                    },
                    {
                        id: 'BUG_REPORT',
                        title: '🐛 Bug Report',
                        description: 'Report a bug',
                    },
                    {
                        id: 'GENERAL_INQUIRY',
                        title: '💬 General Inquiry',
                        description: 'General questions',
                    },
                    {
                        id: 'OTHER',
                        title: '📌 Other',
                        description: 'Something else',
                    },
                ],
            },
        ]);
    }

    /**
     * Show ticket confirmation summary
     */
    static async showTicketConfirmation(
        to: string,
        userName: string,
        issue: string,
        category: string,
    ): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const categoryNames: Record<string, string> = {
            TECHNICAL_SUPPORT: '🔧 Technical Support',
            BILLING_PAYMENT: '💳 Billing & Payment',
            ACCOUNT_ACCESS: '🔐 Account Access',
            PRODUCT_INQUIRY: '❓ Product Inquiry',
            FEATURE_REQUEST: '✨ Feature Request',
            BUG_REPORT: '🐛 Bug Report',
            GENERAL_INQUIRY: '💬 General Inquiry',
            OTHER: '📌 Other',
        };

        const message =
            `📝 *Ticket Summary*\n\n` +
            `*Name:* ${userName}\n` +
            `*Category:* ${categoryNames[category] || category}\n` +
            `*Issue:* ${issue}\n\n` +
            `Please confirm to create this ticket:`;

        return MessageSender.sendButtons(
            to,
            message,
            [
                { id: 'confirm_ticket', title: '✅ Confirm' },
                { id: 'cancel_ticket', title: '❌ Cancel' },
            ],
            undefined,
            'Review and confirm',
        );
    }

    /**
     * Send ticket created confirmation
     */
    static async sendTicketCreated(
        to: string,
        ticketNumber: string,
    ): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const message =
            `✅ *Ticket Created Successfully!*\n\n` +
            `Your ticket number is: *${ticketNumber}*\n\n` +
            `Our support team will review your request and get back to you as soon as possible.\n\n` +
            `You can check your ticket status anytime by sending "status" or clicking the button below.`;

        return MessageSender.sendButtons(
            to,
            message,
            [{ id: 'check_status', title: '📋 Check Status' }],
            undefined,
            `Thank you for contacting ${config.BUSINESS_NAME}`,
        );
    }

    /**
     * Send cancellation confirmation
     */
    static async sendCancellation(to: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const message = `❌ Ticket creation cancelled.\n\nIf you need help, feel free to start again by sending a message!`;

        return MessageSender.sendButtons(to, message, [{ id: 'new_issue', title: '🆕 New Issue' }]);
    }

    /**
     * Send error message
     */
    static async sendError(to: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const message = `❌ Oops! Something went wrong.\n\nPlease try again or contact our support team directly.`;

        return MessageSender.sendText(to, message);
    }

    /**
     * Send ticket status
     */
    static async sendTicketStatus(
        to: string,
        tickets: Array<{
            ticketNumber: string;
            status: string;
            category: string;
            createdAt: Date;
        }>,
    ): Promise<{ success: boolean; messageId?: string; error?: string }> {
        if (tickets.length === 0) {
            const message = `📋 *Your Tickets*\n\nYou don't have any tickets yet.\n\nNeed help? Create a new ticket by clicking the button below.`;

            return MessageSender.sendButtons(to, message, [{ id: 'new_issue', title: '🆕 New Issue' }]);
        }

        const ticketList = tickets
            .map((ticket) => {
                const statusEmoji = ticket.status === 'RESOLVED' ? '✅' : ticket.status === 'IN_PROGRESS' ? '🔄' : '📝';
                return (
                    `${statusEmoji} *${ticket.ticketNumber}*\n` +
                    `   Status: ${ticket.status}\n` +
                    `   Category: ${ticket.category}\n` +
                    `   Created: ${ticket.createdAt.toLocaleDateString()}`
                );
            })
            .join('\n\n');

        const message = `📋 *Your Tickets*\n\n${ticketList}`;

        return MessageSender.sendText(to, message);
    }

    /**
     * Send outside business hours message
     */
    static async sendOutsideBusinessHours(
        to: string,
    ): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const message =
            `🌙 We're currently outside business hours.\n\n` +
            `Our team is available from ${config.BUSINESS_HOURS_START} to ${config.BUSINESS_HOURS_END}.\n\n` +
            `You can still create a ticket and we'll respond as soon as we're back!`;

        return MessageSender.sendButtons(to, message, [{ id: 'new_issue', title: '🆕 Create Ticket' }]);
    }
}
