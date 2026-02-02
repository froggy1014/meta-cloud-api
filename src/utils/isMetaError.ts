export type MetaErrorData = {
    message: string;
    type: string;
    code: number;
    error_data?: {
        messaging_product?: 'whatsapp';
        details?: string;
    };
    error_subcode?: number;
    fbtrace_id: string;
};

export interface MetaError extends Error {
    error: MetaErrorData;
}

export const WHATSAPP_ERROR_CODES = [
    0, 1, 2, 3, 4, 10, 33, 100, 190, 200, 299, 368, 80007, 130429, 130472, 130497, 131000, 131005, 131008, 131009,
    131016, 131021, 131026, 131031, 131037, 131042, 131045, 131047, 131048, 131049, 131050, 131051, 131052, 131053,
    131055, 131056, 131057, 132000, 132001, 132005, 132007, 132012, 132015, 132016, 132068, 132069, 133000, 133004,
    133005, 133006, 133008, 133009, 133010, 133015, 133016, 134011, 134100, 134101, 134102, 135000, 200005, 200006,
    200007, 1752041, 2388001, 2388012, 2388019, 2388040, 2388047, 2388072, 2388073, 2388091, 2388093, 2388103, 2388293,
    2388299, 2494100, 2593079, 2593085, 2593107, 2593108,
] as const;

const WHATSAPP_ERROR_CODE_SET = new Set<number>(WHATSAPP_ERROR_CODES);

export type WhatsAppErrorCode = (typeof WHATSAPP_ERROR_CODES)[number];

export function isWhatsAppErrorCode(code: number): code is WhatsAppErrorCode {
    return WHATSAPP_ERROR_CODE_SET.has(code);
}

export class WhatsAppError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'WhatsAppError';
    }
}

export class WhatsAppApiError extends WhatsAppError {
    readonly error: MetaErrorData;
    readonly statusCode?: number;

    constructor(message: string, error: MetaErrorData, statusCode?: number) {
        super(message);
        this.name = 'WhatsAppApiError';
        this.error = error;
        this.statusCode = statusCode;
    }
}

export class WhatsAppNetworkError extends WhatsAppError {
    readonly cause?: unknown;

    constructor(message: string, cause?: unknown) {
        super(message);
        this.name = 'WhatsAppNetworkError';
        this.cause = cause;
    }
}

export class WhatsAppUnknownError extends WhatsAppError {
    readonly cause?: unknown;

    constructor(message: string, cause?: unknown) {
        super(message);
        this.name = 'WhatsAppUnknownError';
        this.cause = cause;
    }
}

/**
 * Determines if the error is a Meta API error response
 * @param error Any error object to check
 * @returns Type guard indicating if error is a Meta API error
 */
export function isMetaError(error: any): error is MetaError {
    if (error == null || typeof error !== 'object') return false;
    if (!('error' in error) || typeof error.error !== 'object' || error.error == null) return false;

    const metaError = error.error as Record<string, unknown>;

    if (typeof metaError.message !== 'string') return false;
    if (typeof metaError.type !== 'string') return false;
    if (typeof metaError.code !== 'number') return false;
    if (typeof metaError.fbtrace_id !== 'string') return false;

    if ('error_data' in metaError && metaError.error_data != null) {
        if (typeof metaError.error_data !== 'object') return false;
        const errorData = metaError.error_data as Record<string, unknown>;
        if ('messaging_product' in errorData && errorData.messaging_product !== 'whatsapp') return false;
        if ('details' in errorData && typeof errorData.details !== 'string') return false;
    }

    if ('error_subcode' in metaError && typeof metaError.error_subcode !== 'number') return false;

    return true;
}

export function isWhatsAppApiErrorResponse(error: any): error is MetaError & { error: { code: WhatsAppErrorCode } } {
    return isMetaError(error) && isWhatsAppErrorCode(error.error.code);
}

export function normalizeMetaError(errorData: unknown, statusCode?: number): MetaError {
    if (isMetaError(errorData)) return errorData;

    let message = 'Unknown error occurred';
    if (errorData && typeof errorData === 'object' && 'message' in errorData) {
        const candidate = (errorData as { message?: unknown }).message;
        if (typeof candidate === 'string') message = candidate;
    }

    return {
        name: 'MetaError',
        message,
        error: {
            message,
            type: 'UnknownError',
            code: typeof statusCode === 'number' ? statusCode : 500,
            fbtrace_id: '',
        },
    };
}
