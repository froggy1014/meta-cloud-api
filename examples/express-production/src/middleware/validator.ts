import type { NextFunction, Request, Response } from 'express';
import { type ZodSchema, z } from 'zod';
import { AppError } from './errorHandler.js';

/**
 * Validation target types
 */
type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Zod schema validation middleware
 * Validates request data against a Zod schema
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate the specified target
            const data = req[target];
            const validated = schema.parse(data);

            // Replace with validated data
            req[target] = validated;

            next();
        } catch (error) {
            // Zod errors are handled by the global error handler
            next(error);
        }
    };
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
    /**
     * Pagination query parameters
     */
    pagination: z.object({
        page: z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 1))
            .pipe(z.number().int().positive()),
        limit: z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 10))
            .pipe(z.number().int().positive().max(100)),
    }),

    /**
     * Phone number validation
     */
    phoneNumber: z.string().regex(/^\d{10,15}$/, 'Invalid phone number format'),

    /**
     * Ticket ID validation
     */
    ticketId: z.string().cuid('Invalid ticket ID'),

    /**
     * Ticket number validation
     */
    ticketNumber: z.string().regex(/^T-\d{5}$/, 'Invalid ticket number format'),

    /**
     * Date range query
     */
    dateRange: z.object({
        startDate: z
            .string()
            .optional()
            .transform((val) => (val ? new Date(val) : undefined)),
        endDate: z
            .string()
            .optional()
            .transform((val) => (val ? new Date(val) : undefined)),
    }),
};

/**
 * Validate phone number middleware
 */
export function validatePhoneNumber(req: Request, res: Response, next: NextFunction): void {
    const phoneNumber = req.params.phoneNumber || req.body.phoneNumber || req.query.phoneNumber;

    if (!phoneNumber) {
        return next(new AppError(400, 'Phone number is required'));
    }

    if (!/^\d{10,15}$/.test(phoneNumber)) {
        return next(new AppError(400, 'Invalid phone number format'));
    }

    next();
}

/**
 * Validate ticket ID middleware
 */
export function validateTicketId(req: Request, res: Response, next: NextFunction): void {
    const ticketId = req.params.ticketId || req.body.ticketId;

    if (!ticketId) {
        return next(new AppError(400, 'Ticket ID is required'));
    }

    next();
}
