import { Response } from 'express';
import { ApiResponse, PaginationMeta } from '@types/index.js';

/**
 * Standard response builders
 * Provides consistent API response format
 */

/**
 * Send success response
 */
export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): Response {
    const response: ApiResponse<T> = {
        success: true,
        data,
    };

    return res.status(statusCode).json(response);
}

/**
 * Send success response with pagination
 */
export function sendSuccessWithPagination<T>(
    res: Response,
    data: T,
    meta: PaginationMeta,
    statusCode: number = 200,
): Response {
    const response: ApiResponse<T> = {
        success: true,
        data,
        meta,
    };

    // Also set pagination headers
    res.setHeader('X-Total-Count', meta.total);
    res.setHeader('X-Page', meta.page);
    res.setHeader('X-Page-Size', meta.limit);

    return res.status(statusCode).json(response);
}

/**
 * Send error response
 */
export function sendError(res: Response, message: string, statusCode: number = 500, details?: any): Response {
    const response: ApiResponse = {
        success: false,
        error: {
            message,
            ...(details && { details }),
        },
    };

    return res.status(statusCode).json(response);
}

/**
 * Send validation error response
 */
export function sendValidationError(res: Response, errors: any[]): Response {
    const response: ApiResponse = {
        success: false,
        error: {
            message: 'Validation failed',
            details: errors,
        },
    };

    return res.status(400).json(response);
}

/**
 * Send not found response
 */
export function sendNotFound(res: Response, resource: string = 'Resource'): Response {
    const response: ApiResponse = {
        success: false,
        error: {
            message: `${resource} not found`,
        },
    };

    return res.status(404).json(response);
}

/**
 * Send unauthorized response
 */
export function sendUnauthorized(res: Response, message: string = 'Unauthorized'): Response {
    const response: ApiResponse = {
        success: false,
        error: {
            message,
        },
    };

    return res.status(401).json(response);
}

/**
 * Send forbidden response
 */
export function sendForbidden(res: Response, message: string = 'Forbidden'): Response {
    const response: ApiResponse = {
        success: false,
        error: {
            message,
        },
    };

    return res.status(403).json(response);
}

/**
 * Calculate pagination meta
 */
export function calculatePaginationMeta(page: number, limit: number, total: number): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}
