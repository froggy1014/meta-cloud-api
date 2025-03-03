import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to validate WhatsApp API authentication headers from Swagger requests
 * Checks for required x-phone-number-id and x-access-token headers
 * Stores credentials in res.locals.whatsappCredentials if valid
 */
export const whatsappAuth = (req: Request, res: Response, next: NextFunction) => {
    const phoneNumberId = req.headers['x-phone-number-id'];
    const accessToken = req.headers['x-access-token'];

    if (!phoneNumberId || !accessToken) {
        return res.status(400).json({
            error: 'Missing required headers: x-phone-number-id and x-access-token',
        });
    }

    res.locals.whatsappCredentials = {
        phoneNumberId: Number(phoneNumberId),
        accessToken: accessToken as string,
    };

    next();
};
