import { Router, Request, Response } from 'express';
import { TicketService } from '@services/tickets/ticketService.js';
import {
    sendSuccess,
    sendSuccessWithPagination,
    sendError,
    sendNotFound,
    calculatePaginationMeta,
} from '@utils/responses.js';
import { validate, commonSchemas } from '@middleware/validator.js';
import { asyncHandler } from '@middleware/errorHandler.js';
import { apiRateLimiter } from '@middleware/rateLimiter.js';
import { z } from 'zod';
import { TicketStatus, TicketPriority, TicketCategory } from '@prisma/client';

const router = Router();

// Apply API rate limiting
router.use(apiRateLimiter);

/**
 * GET /api/tickets
 * Get all tickets with filtering and pagination
 */
router.get(
    '/',
    validate(
        z.object({
            page: z
                .string()
                .optional()
                .transform((val) => (val ? parseInt(val, 10) : 1)),
            limit: z
                .string()
                .optional()
                .transform((val) => (val ? parseInt(val, 10) : 10)),
            status: z.nativeEnum(TicketStatus).optional(),
            category: z.nativeEnum(TicketCategory).optional(),
            priority: z.nativeEnum(TicketPriority).optional(),
            assignedTo: z.string().optional(),
        }),
        'query',
    ),
    asyncHandler(async (req: Request, res: Response) => {
        const { page = 1, limit = 10, status, category, priority, assignedTo } = req.query as any;

        const { tickets, total } = await TicketService.getAll({
            status,
            category,
            priority,
            assignedTo,
            limit,
            offset: (page - 1) * limit,
        });

        const paginationMeta = calculatePaginationMeta(page, limit, total);

        return sendSuccessWithPagination(res, tickets, paginationMeta);
    }),
);

/**
 * GET /api/tickets/stats
 * Get ticket statistics
 */
router.get(
    '/stats',
    asyncHandler(async (req: Request, res: Response) => {
        const stats = await TicketService.getStatistics();
        return sendSuccess(res, stats);
    }),
);

/**
 * GET /api/tickets/:id
 * Get ticket by ID
 */
router.get(
    '/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const ticket = await TicketService.getById(id);

        if (!ticket) {
            return sendNotFound(res, 'Ticket');
        }

        return sendSuccess(res, ticket);
    }),
);

/**
 * GET /api/tickets/number/:ticketNumber
 * Get ticket by ticket number
 */
router.get(
    '/number/:ticketNumber',
    asyncHandler(async (req: Request, res: Response) => {
        const { ticketNumber } = req.params;
        const ticket = await TicketService.getByNumber(ticketNumber);

        if (!ticket) {
            return sendNotFound(res, 'Ticket');
        }

        return sendSuccess(res, ticket);
    }),
);

/**
 * GET /api/tickets/user/:userId
 * Get tickets by user ID
 */
router.get(
    '/user/:userId',
    validate(commonSchemas.pagination, 'query'),
    asyncHandler(async (req: Request, res: Response) => {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query as any;

        const tickets = await TicketService.getByUserId(userId, {
            limit,
            offset: (page - 1) * limit,
        });

        return sendSuccess(res, tickets);
    }),
);

/**
 * PATCH /api/tickets/:id/status
 * Update ticket status
 */
router.patch(
    '/:id/status',
    validate(
        z.object({
            status: z.nativeEnum(TicketStatus),
            resolution: z.string().optional(),
        }),
        'body',
    ),
    asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { status, resolution } = req.body;

        const ticket = await TicketService.updateStatus(id, status, resolution);

        if (!ticket) {
            return sendNotFound(res, 'Ticket');
        }

        return sendSuccess(res, ticket);
    }),
);

/**
 * PATCH /api/tickets/:id/assign
 * Assign ticket to user
 */
router.patch(
    '/:id/assign',
    validate(
        z.object({
            assignedTo: z.string().min(1),
        }),
        'body',
    ),
    asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { assignedTo } = req.body;

        const ticket = await TicketService.assign(id, assignedTo);

        if (!ticket) {
            return sendNotFound(res, 'Ticket');
        }

        return sendSuccess(res, ticket);
    }),
);

/**
 * PATCH /api/tickets/:id/priority
 * Update ticket priority
 */
router.patch(
    '/:id/priority',
    validate(
        z.object({
            priority: z.nativeEnum(TicketPriority),
        }),
        'body',
    ),
    asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { priority } = req.body;

        const ticket = await TicketService.updatePriority(id, priority);

        if (!ticket) {
            return sendNotFound(res, 'Ticket');
        }

        return sendSuccess(res, ticket);
    }),
);

/**
 * PATCH /api/tickets/:id/tags
 * Add tags to ticket
 */
router.patch(
    '/:id/tags',
    validate(
        z.object({
            tags: z.array(z.string()).min(1),
        }),
        'body',
    ),
    asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { tags } = req.body;

        const ticket = await TicketService.addTags(id, tags);

        if (!ticket) {
            return sendNotFound(res, 'Ticket');
        }

        return sendSuccess(res, ticket);
    }),
);

/**
 * DELETE /api/tickets/:id
 * Delete (cancel) ticket
 */
router.delete(
    '/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        const success = await TicketService.delete(id);

        if (!success) {
            return sendError(res, 'Failed to delete ticket', 500);
        }

        return sendSuccess(res, { message: 'Ticket deleted successfully' });
    }),
);

export default router;
