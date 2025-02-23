import WhatsApp from 'meta-cloud-api';
import express from 'express';

/**
 * Creates a message handler for sending WhatsApp messages of a specific type
 * @param messageType - The type of WhatsApp message to send (text, image, audio, etc)
 * @returns An Express request handler that processes the message request
 */

// TODO : facebook error handling
export const createMessageHandler = (messageType: keyof WhatsApp['messages']) => {
    return async (req: express.Request, res: express.Response) => {
        const { body, recipient, replyMessageId } = req.body;

        try {
            const whatsapp = new WhatsApp(
                res.locals.whatsappCredentials.phoneNumberId,
                res.locals.whatsappCredentials.accessToken,
            );

            const response = await whatsapp.messages[messageType](body, recipient, replyMessageId);
            res.status(200).json(await response.json());
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(400).json({ error: 'Unknown error' });
            }
        }
    };
};
