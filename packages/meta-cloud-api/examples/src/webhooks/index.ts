import { Request, Response, Router } from 'express';
import WhatsApp from '../../../src';
import { VERIFY_TOKEN, WEBHOOK_PATH } from '../config';
import { handleMessage, handleStatusUpdate } from '../handlers';

export function setupWebhooks(whatsapp: WhatsApp): Router {
    const router = Router();

    router.get(WEBHOOK_PATH, (req: Request, res: Response) => {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('Webhook verified successfully');
            res.status(200).send(challenge);
        } else {
            if (mode !== 'subscribe') {
                console.log('Webhook verification failed: Invalid mode - expected "subscribe" but got:', mode);
            }
            if (token !== VERIFY_TOKEN) {
                console.log('Webhook verification failed: Invalid verify token');
                console.log('Expected:', VERIFY_TOKEN);
                console.log('Received:', token);
            }
            res.sendStatus(403);
        }
    });

    router.post(WEBHOOK_PATH, async (req: Request, res: Response) => {
        const body = req.body;

        if (body.object !== 'whatsapp_business_account') {
            console.log('Received webhook for non-WhatsApp event');
            res.sendStatus(404);
            return;
        }

        for (const entry of body.entry) {
            try {
                const changes = entry.changes;
                for (const change of changes) {
                    if (change.field === 'messages') {
                        const value = change.value;

                        if (value.messages && value.messages.length > 0) {
                            for (const message of value.messages) {
                                await handleMessage(whatsapp, message);
                            }
                        }

                        if (value.statuses && value.statuses.length > 0) {
                            for (const status of value.statuses) {
                                handleStatusUpdate(status);
                            }
                        }
                    } else {
                        console.log(`Received event of type: ${change.field}`);
                    }
                }
            } catch (error) {
                console.error(`Error processing webhook: ${error}`);
            }
        }

        res.sendStatus(200);
    });

    return router;
}
