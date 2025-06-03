import express, { NextFunction, Request, Response } from 'express';

declare global {
    namespace Express {
        interface Request {
            rawBody?: string;
        }
    }
}

/**
 * Middleware to capture raw body for webhook signature verification
 * Similar to Next.js API approach with text() and json()
 */
export const rawBodyMiddleware = express.raw({
    type: 'application/json',
    verify: (req: Request, res: Response, buf: Buffer) => {
        // Store the raw body as string for signature verification
        req.rawBody = buf.toString('utf8');
    },
});

/**
 * Alternative middleware that manually parses both raw and JSON
 */
export const manualRawBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'POST' && req.headers['content-type']?.includes('application/json')) {
        const chunks: Buffer[] = [];

        req.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
        });

        req.on('end', () => {
            const rawBody = Buffer.concat(chunks).toString('utf8');
            req.rawBody = rawBody;

            // Parse JSON similar to Next.js json() helper
            try {
                req.body = JSON.parse(rawBody);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                req.body = {};
            }

            console.log('🚀 ~ rawBodyMiddleware ~ method:', req.method, 'path:', req.path);
            console.log('🚀 ~ rawBodyMiddleware ~ rawBody length:', rawBody.length);
            next();
        });

        req.on('error', (error) => {
            console.error('Error reading request body:', error);
            next(error);
        });
    } else {
        next();
    }
};

export default rawBodyMiddleware;
