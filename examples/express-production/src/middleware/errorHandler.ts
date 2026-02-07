import { Request, Response, NextFunction } from 'express';
import { logger } from '@config/logger.js';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public isOperational = true,
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Handle Zod validation errors
 */
function handleZodError(error: ZodError): { statusCode: number; message: string; errors: unknown[] } {
    const errors = error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
    }));

    return {
        statusCode: 400,
        message: 'Validation failed',
        errors,
    };
}

/**
 * Handle Prisma errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
    statusCode: number;
    message: string;
} {
    switch (error.code) {
        case 'P2002':
            return {
                statusCode: 409,
                message: 'Resource already exists',
            };
        case 'P2025':
            return {
                statusCode: 404,
                message: 'Resource not found',
            };
        case 'P2003':
            return {
                statusCode: 400,
                message: 'Invalid reference',
            };
        default:
            return {
                statusCode: 500,
                message: 'Database error',
            };
    }
}

/**
 * Global error handler middleware
 * Catches all errors and sends appropriate responses
 */
export function errorHandler(err: Error | AppError, req: Request, res: Response, next: NextFunction): void {
    // Default error response
    let statusCode = 500;
    let message = 'Internal server error';
    let errors: unknown[] | undefined;

    // Handle different error types
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err instanceof ZodError) {
        const zodError = handleZodError(err);
        statusCode = zodError.statusCode;
        message = zodError.message;
        errors = zodError.errors;
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        const prismaError = handlePrismaError(err);
        statusCode = prismaError.statusCode;
        message = prismaError.message;
    } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized';
    } else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    }

    // Log error
    logger.error('Request error', {
        statusCode,
        message,
        path: req.path,
        method: req.method,
        ip: req.ip,
        error: err.message,
        stack: err.stack,
    });

    // Send error response
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(errors && { errors }),
            ...(process.env.NODE_ENV === 'development' && {
                stack: err.stack,
                details: err,
            }),
        },
    });
}

/**
 * Handle 404 Not Found errors
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
    const error = new AppError(404, `Route ${req.originalUrl} not found`);
    next(error);
}

/**
 * Async handler wrapper to catch promise rejections
 */
export function asyncHandler<T>(fn: (req: Request, res: Response, next: NextFunction) => Promise<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
