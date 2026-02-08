import type { Ticket, TicketCategory, TicketPriority, TicketStatus } from '@prisma/client';

/**
 * Ticket-related type definitions
 */

export interface TicketCreateInput {
    conversationId: string;
    userId: string;
    userName: string;
    category: TicketCategory;
    issue: string;
    priority?: TicketPriority;
}

export interface TicketUpdateInput {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedTo?: string;
    resolution?: string;
    tags?: string[];
    metadata?: Record<string, any>;
}

export interface TicketFilterOptions {
    status?: TicketStatus;
    category?: TicketCategory;
    priority?: TicketPriority;
    assignedTo?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
}

export interface TicketStatistics {
    total: number;
    byStatus: Record<TicketStatus, number>;
    byCategory: Record<TicketCategory, number>;
    byPriority: Record<TicketPriority, number>;
    averageResolutionTime?: number;
    openTickets: number;
    resolvedTickets: number;
}

export type TicketWithConversation = Ticket & {
    conversation: {
        id: string;
        userId: string;
        userName: string;
    };
};
