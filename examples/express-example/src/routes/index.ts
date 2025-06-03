import express, { Router } from 'express';
import { IRequest } from 'meta-cloud-api';
import { webhookHandler } from '../handlers/webhookHandler';

const router: Router = express.Router();

// Set up webhook endpoints
router.get('/webhook', (req, res) => {
    webhookHandler.handleVerificationRequest(req, res);
});

// Handle webhook requests
router.post('/webhook', (req, res) => {
    webhookHandler.handleWebhookRequest(req, res);
});

// Handle Flow requests - similar to Next.js API approach
router.post('/flow', (req, res) => {
    // Raw body is available from middleware
    const extendedReq = req as IRequest & { rawBody: string };

    console.log('🚀 ~ Flow request ~ method:', req.method, 'path:', req.path);
    console.log('🚀 ~ Flow request ~ rawBody length:', extendedReq.rawBody?.length || 0);
    console.log('🚀 ~ Flow request ~ body:', req.body);

    webhookHandler.handleFlowRequest(extendedReq, res);
});

export default router;
