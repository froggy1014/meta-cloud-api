/**
 * Shared type definitions
 */

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
    };
}

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface HealthCheckResult {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    checks: {
        database: boolean;
        redis: boolean;
        whatsapp: boolean;
        queue: boolean;
    };
}
