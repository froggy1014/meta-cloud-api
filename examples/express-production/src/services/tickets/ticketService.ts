import { prisma } from '@config/database.js';
import { logger } from '@config/logger.js';
import { Ticket, TicketStatus, TicketPriority, TicketCategory, Prisma } from '@prisma/client';

/**
 * Ticket service
 * Handles CRUD operations for tickets
 */
export class TicketService {
    /**
     * Create a new ticket
     */
    static async create(data: {
        conversationId: string;
        userId: string;
        userName: string;
        category: TicketCategory;
        issue: string;
        priority?: TicketPriority;
    }): Promise<Ticket> {
        try {
            // Generate ticket number
            const ticketCount = await prisma.ticket.count();
            const ticketNumber = `T-${String(ticketCount + 10001).padStart(5, '0')}`;

            const ticket = await prisma.ticket.create({
                data: {
                    ticketNumber,
                    conversationId: data.conversationId,
                    userId: data.userId,
                    userName: data.userName,
                    category: data.category,
                    issue: data.issue,
                    status: TicketStatus.OPEN,
                    priority: data.priority || TicketPriority.MEDIUM,
                },
            });

            logger.info('Ticket created', {
                ticketNumber: ticket.ticketNumber,
                userId: ticket.userId,
                category: ticket.category,
            });

            return ticket;
        } catch (error) {
            logger.error('Failed to create ticket', {
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    /**
     * Get ticket by ID
     */
    static async getById(id: string): Promise<Ticket | null> {
        try {
            return await prisma.ticket.findUnique({
                where: { id },
            });
        } catch (error) {
            logger.error('Failed to get ticket by ID', {
                id,
                error: error instanceof Error ? error.message : String(error),
            });
            return null;
        }
    }

    /**
     * Get ticket by ticket number
     */
    static async getByNumber(ticketNumber: string): Promise<Ticket | null> {
        try {
            return await prisma.ticket.findUnique({
                where: { ticketNumber },
            });
        } catch (error) {
            logger.error('Failed to get ticket by number', {
                ticketNumber,
                error: error instanceof Error ? error.message : String(error),
            });
            return null;
        }
    }

    /**
     * Get tickets by user ID
     */
    static async getByUserId(userId: string, options?: { limit?: number; offset?: number }): Promise<Ticket[]> {
        try {
            return await prisma.ticket.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: options?.limit || 10,
                skip: options?.offset || 0,
            });
        } catch (error) {
            logger.error('Failed to get tickets by user ID', {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });
            return [];
        }
    }

    /**
     * Get all tickets with filtering and pagination
     */
    static async getAll(
        options: {
            status?: TicketStatus;
            category?: TicketCategory;
            priority?: TicketPriority;
            assignedTo?: string;
            limit?: number;
            offset?: number;
        } = {},
    ): Promise<{ tickets: Ticket[]; total: number }> {
        try {
            const where: Prisma.TicketWhereInput = {
                ...(options.status && { status: options.status }),
                ...(options.category && { category: options.category }),
                ...(options.priority && { priority: options.priority }),
                ...(options.assignedTo && { assignedTo: options.assignedTo }),
            };

            const [tickets, total] = await Promise.all([
                prisma.ticket.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    take: options.limit || 10,
                    skip: options.offset || 0,
                }),
                prisma.ticket.count({ where }),
            ]);

            return { tickets, total };
        } catch (error) {
            logger.error('Failed to get all tickets', {
                error: error instanceof Error ? error.message : String(error),
            });
            return { tickets: [], total: 0 };
        }
    }

    /**
     * Update ticket status
     */
    static async updateStatus(id: string, status: TicketStatus, resolution?: string): Promise<Ticket | null> {
        try {
            const ticket = await prisma.ticket.update({
                where: { id },
                data: {
                    status,
                    ...(resolution && { resolution }),
                    ...(status === TicketStatus.RESOLVED && { resolvedAt: new Date() }),
                },
            });

            logger.info('Ticket status updated', {
                ticketNumber: ticket.ticketNumber,
                status,
            });

            return ticket;
        } catch (error) {
            logger.error('Failed to update ticket status', {
                id,
                status,
                error: error instanceof Error ? error.message : String(error),
            });
            return null;
        }
    }

    /**
     * Assign ticket to user
     */
    static async assign(id: string, assignedTo: string): Promise<Ticket | null> {
        try {
            const ticket = await prisma.ticket.update({
                where: { id },
                data: {
                    assignedTo,
                    status: TicketStatus.IN_PROGRESS,
                },
            });

            logger.info('Ticket assigned', {
                ticketNumber: ticket.ticketNumber,
                assignedTo,
            });

            return ticket;
        } catch (error) {
            logger.error('Failed to assign ticket', {
                id,
                assignedTo,
                error: error instanceof Error ? error.message : String(error),
            });
            return null;
        }
    }

    /**
     * Update ticket priority
     */
    static async updatePriority(id: string, priority: TicketPriority): Promise<Ticket | null> {
        try {
            const ticket = await prisma.ticket.update({
                where: { id },
                data: { priority },
            });

            logger.info('Ticket priority updated', {
                ticketNumber: ticket.ticketNumber,
                priority,
            });

            return ticket;
        } catch (error) {
            logger.error('Failed to update ticket priority', {
                id,
                priority,
                error: error instanceof Error ? error.message : String(error),
            });
            return null;
        }
    }

    /**
     * Add tags to ticket
     */
    static async addTags(id: string, tags: string[]): Promise<Ticket | null> {
        try {
            const ticket = await prisma.ticket.findUnique({
                where: { id },
            });

            if (!ticket) {
                return null;
            }

            const updatedTags = [...new Set([...ticket.tags, ...tags])];

            return await prisma.ticket.update({
                where: { id },
                data: { tags: updatedTags },
            });
        } catch (error) {
            logger.error('Failed to add tags to ticket', {
                id,
                tags,
                error: error instanceof Error ? error.message : String(error),
            });
            return null;
        }
    }

    /**
     * Get ticket statistics
     */
    static async getStatistics(): Promise<{
        total: number;
        byStatus: Record<TicketStatus, number>;
        byCategory: Record<TicketCategory, number>;
        byPriority: Record<TicketPriority, number>;
    }> {
        try {
            const [total, byStatus, byCategory, byPriority] = await Promise.all([
                prisma.ticket.count(),
                prisma.ticket.groupBy({
                    by: ['status'],
                    _count: true,
                }),
                prisma.ticket.groupBy({
                    by: ['category'],
                    _count: true,
                }),
                prisma.ticket.groupBy({
                    by: ['priority'],
                    _count: true,
                }),
            ]);

            return {
                total,
                byStatus: Object.fromEntries(byStatus.map((item) => [item.status, item._count])) as Record<
                    TicketStatus,
                    number
                >,
                byCategory: Object.fromEntries(byCategory.map((item) => [item.category, item._count])) as Record<
                    TicketCategory,
                    number
                >,
                byPriority: Object.fromEntries(byPriority.map((item) => [item.priority, item._count])) as Record<
                    TicketPriority,
                    number
                >,
            };
        } catch (error) {
            logger.error('Failed to get ticket statistics', {
                error: error instanceof Error ? error.message : String(error),
            });
            return {
                total: 0,
                byStatus: {} as Record<TicketStatus, number>,
                byCategory: {} as Record<TicketCategory, number>,
                byPriority: {} as Record<TicketPriority, number>,
            };
        }
    }

    /**
     * Delete ticket (soft delete by setting status to CANCELLED)
     */
    static async delete(id: string): Promise<boolean> {
        try {
            await prisma.ticket.update({
                where: { id },
                data: { status: TicketStatus.CANCELLED },
            });

            logger.info('Ticket deleted', { id });

            return true;
        } catch (error) {
            logger.error('Failed to delete ticket', {
                id,
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }
}
