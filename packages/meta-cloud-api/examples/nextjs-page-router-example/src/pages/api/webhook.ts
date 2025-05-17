import { webhookHandler } from '@/lib/webhookHandler';

import { buffer } from 'micro';
import type { NextApiRequest, NextApiResponse } from 'next';

// https://nextjs.org/docs/pages/building-your-application/routing/api-routes
export const config = {
    api: {
        bodyParser: false,
    },
};

const handleVerifyWebhook = (req: NextApiRequest, res: NextApiResponse) => {
    return webhookHandler.handleVerificationRequest(req, res);
};

const handleWebhook = async (req: NextApiRequest, res: NextApiResponse) => {
    const bufferBody = await buffer(req);
    req.body = JSON.parse(bufferBody.toString());

    return await webhookHandler.handleWebhookRequest(req, res);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return handleVerifyWebhook(req, res);
    } else if (req.method === 'POST') {
        return await handleWebhook(req, res);
    } else {
        return res.status(405).end();
    }
}
