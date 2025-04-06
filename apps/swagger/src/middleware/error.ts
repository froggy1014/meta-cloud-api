import { Request, Response, NextFunction } from 'express';
import { isMetaError } from 'meta-cloud-api/utils';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (isMetaError(err)) {
        // Handle Meta API specific errors
        return res.status(400).json(err);
    }

    // Generate Meta error object for generic errors
    if (err instanceof Error) {
        return res.status(400).json({
            error: {
                message: err.message,
                type: 'Generic Error',
                code: 400,
                error_data: {
                    messaging_product: 'whatsapp',
                    details: err.stack || 'No stack trace available',
                },
                fbtrace_id: `generic-${Date.now()}`,
            },
        });
    }

    // Generate Meta error object for unknown errors
    return res.status(500).json({
        error: {
            message: 'Internal server error',
            type: 'Unknown Error',
            code: 500,
            error_data: {
                messaging_product: 'whatsapp',
                details: 'An unknown error occurred',
            },
            fbtrace_id: `unknown-${Date.now()}`,
        },
    });
}
