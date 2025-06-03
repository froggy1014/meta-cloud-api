export interface MetaError extends Error {
    error: {
        message: string;
        type: string;
        code: number;
        error_data?: {
            messaging_product: 'whatsapp';
            details: string;
        };
        error_subcode?: number;
        fbtrace_id: string;
    };
}

/**
 * Determines if the error is a Meta API error response
 * @param error Any error object to check
 * @returns Type guard indicating if error is a Meta API error
 */
export function isMetaError(error: any): error is MetaError {
    return (
        error != null &&
        typeof error === 'object' &&
        'error' in error &&
        typeof error.error === 'object' &&
        error.error != null &&
        'message' in error.error &&
        typeof error.error.message === 'string' &&
        'type' in error.error &&
        typeof error.error.type === 'string' &&
        'code' in error.error &&
        typeof error.error.code === 'number' &&
        'fbtrace_id' in error.error &&
        typeof error.error.fbtrace_id === 'string' &&
        (!('error_data' in error.error) ||
            (typeof error.error.error_data === 'object' &&
                error.error.error_data != null &&
                'messaging_product' in error.error.error_data &&
                error.error.error_data.messaging_product === 'whatsapp' &&
                'details' in error.error.error_data &&
                typeof error.error.error_data.details === 'string')) &&
        (!('error_subcode' in error.error) || typeof error.error.error_subcode === 'number')
    );
}
