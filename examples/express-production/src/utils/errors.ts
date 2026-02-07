/**
 * Custom error classes
 */

/**
 * Base application error
 */
export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public isOperational: boolean = true,
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
    constructor(
        message: string,
        public details?: any,
    ) {
        super(400, message);
    }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
        super(404, `${resource} not found`);
    }
}

/**
 * Unauthorized error
 */
export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(401, message);
    }
}

/**
 * Forbidden error
 */
export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden') {
        super(403, message);
    }
}

/**
 * Conflict error
 */
export class ConflictError extends AppError {
    constructor(message: string = 'Resource already exists') {
        super(409, message);
    }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
    constructor(message: string = 'Too many requests') {
        super(429, message);
    }
}

/**
 * Internal server error
 */
export class InternalError extends AppError {
    constructor(message: string = 'Internal server error') {
        super(500, message, false); // Not operational
    }
}

/**
 * Service unavailable error
 */
export class ServiceUnavailableError extends AppError {
    constructor(message: string = 'Service temporarily unavailable') {
        super(503, message, false);
    }
}

/**
 * Bad request error
 */
export class BadRequestError extends AppError {
    constructor(message: string = 'Bad request') {
        super(400, message);
    }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
    constructor(message: string = 'Database error') {
        super(500, message, false);
    }
}

/**
 * External API error
 */
export class ExternalAPIError extends AppError {
    constructor(service: string, message: string = 'External API error') {
        super(502, `${service}: ${message}`, false);
    }
}
