import { TicketCategory } from '@prisma/client';

/**
 * Ticket category metadata and utilities
 */

/**
 * Category display information
 */
export interface CategoryInfo {
    id: TicketCategory;
    name: string;
    description: string;
    emoji: string;
    priority: 'low' | 'medium' | 'high';
}

/**
 * Category metadata map
 */
export const CATEGORY_INFO: Record<TicketCategory, CategoryInfo> = {
    [TicketCategory.TECHNICAL_SUPPORT]: {
        id: TicketCategory.TECHNICAL_SUPPORT,
        name: 'Technical Support',
        description: 'Technical issues and troubleshooting',
        emoji: '🔧',
        priority: 'high',
    },
    [TicketCategory.BILLING_PAYMENT]: {
        id: TicketCategory.BILLING_PAYMENT,
        name: 'Billing & Payment',
        description: 'Payment and billing questions',
        emoji: '💳',
        priority: 'high',
    },
    [TicketCategory.ACCOUNT_ACCESS]: {
        id: TicketCategory.ACCOUNT_ACCESS,
        name: 'Account Access',
        description: 'Login and account issues',
        emoji: '🔐',
        priority: 'high',
    },
    [TicketCategory.PRODUCT_INQUIRY]: {
        id: TicketCategory.PRODUCT_INQUIRY,
        name: 'Product Inquiry',
        description: 'General product questions',
        emoji: '❓',
        priority: 'medium',
    },
    [TicketCategory.FEATURE_REQUEST]: {
        id: TicketCategory.FEATURE_REQUEST,
        name: 'Feature Request',
        description: 'Request new features',
        emoji: '✨',
        priority: 'low',
    },
    [TicketCategory.BUG_REPORT]: {
        id: TicketCategory.BUG_REPORT,
        name: 'Bug Report',
        description: 'Report a bug',
        emoji: '🐛',
        priority: 'high',
    },
    [TicketCategory.GENERAL_INQUIRY]: {
        id: TicketCategory.GENERAL_INQUIRY,
        name: 'General Inquiry',
        description: 'General questions',
        emoji: '💬',
        priority: 'medium',
    },
    [TicketCategory.OTHER]: {
        id: TicketCategory.OTHER,
        name: 'Other',
        description: 'Something else',
        emoji: '📌',
        priority: 'medium',
    },
};

/**
 * Get category display name
 */
export function getCategoryName(category: TicketCategory): string {
    return CATEGORY_INFO[category].name;
}

/**
 * Get category with emoji
 */
export function getCategoryWithEmoji(category: TicketCategory): string {
    const info = CATEGORY_INFO[category];
    return `${info.emoji} ${info.name}`;
}

/**
 * Get category description
 */
export function getCategoryDescription(category: TicketCategory): string {
    return CATEGORY_INFO[category].description;
}

/**
 * Get all categories for display
 */
export function getAllCategories(): CategoryInfo[] {
    return Object.values(CATEGORY_INFO);
}

/**
 * Get categories grouped by priority
 */
export function getCategoriesByPriority(): {
    high: CategoryInfo[];
    medium: CategoryInfo[];
    low: CategoryInfo[];
} {
    const categories = getAllCategories();

    return {
        high: categories.filter((c) => c.priority === 'high'),
        medium: categories.filter((c) => c.priority === 'medium'),
        low: categories.filter((c) => c.priority === 'low'),
    };
}

/**
 * Validate category
 */
export function isValidCategory(category: string): category is TicketCategory {
    return Object.values(TicketCategory).includes(category as TicketCategory);
}
