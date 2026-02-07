/**
 * Message formatting utilities
 */

/**
 * Format date to readable string
 */
export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format phone number for display
 * Converts 14155552671 to +1 (415) 555-2671
 */
export function formatPhoneNumber(phone: string): string {
    if (phone.length === 11 && phone.startsWith('1')) {
        return `+${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(4, 7)}-${phone.slice(7)}`;
    } else if (phone.length === 10) {
        return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    return `+${phone}`;
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) {
        return str;
    }
    return str.slice(0, maxLength - 3) + '...';
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

/**
 * Format file size in bytes to human-readable string
 */
export function formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Capitalize first letter of each word
 */
export function capitalize(str: string): string {
    return str
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Convert snake_case to Title Case
 */
export function snakeToTitle(str: string): string {
    return str
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Format ticket status with emoji
 */
export function formatTicketStatus(status: string): string {
    const statusEmojis: Record<string, string> = {
        OPEN: '📝 Open',
        IN_PROGRESS: '🔄 In Progress',
        PENDING_USER: '⏳ Pending User',
        PENDING_INTERNAL: '⏱️ Pending Internal',
        RESOLVED: '✅ Resolved',
        CLOSED: '🔒 Closed',
        CANCELLED: '❌ Cancelled',
    };

    return statusEmojis[status] || status;
}

/**
 * Format ticket priority with emoji
 */
export function formatTicketPriority(priority: string): string {
    const priorityEmojis: Record<string, string> = {
        LOW: '🟢 Low',
        MEDIUM: '🟡 Medium',
        HIGH: '🟠 High',
        URGENT: '🔴 Urgent',
    };

    return priorityEmojis[priority] || priority;
}

/**
 * Format markdown bold text
 */
export function bold(text: string): string {
    return `*${text}*`;
}

/**
 * Format markdown italic text
 */
export function italic(text: string): string {
    return `_${text}_`;
}

/**
 * Format markdown strikethrough text
 */
export function strikethrough(text: string): string {
    return `~${text}~`;
}

/**
 * Format markdown monospace text
 */
export function monospace(text: string): string {
    return `\`\`\`${text}\`\`\``;
}

/**
 * Create a bullet list
 */
export function bulletList(items: string[]): string {
    return items.map((item) => `• ${item}`).join('\n');
}

/**
 * Create a numbered list
 */
export function numberedList(items: string[]): string {
    return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
}
