import express, { Router } from 'express';

import { IRequest } from 'meta-cloud-api';
import { rawBodyMiddleware } from '../middleware/rawBody';

// Import handlers to register them
import '../handlers';
import { webhookHandler as wa } from '../instance';

const router: Router = express.Router();

// Set up webhook endpoints with standard express.json() middleware
router.get('/webhook', (req, res) => {
    wa.handleVerificationRequest(req, res);
});

// Handle webhook requests with express.json() middleware
router.post('/webhook', express.json(), (req, res) => {
    wa.handleWebhookRequest(req, res);
});

// Handle Flow requests with rawBodyMiddleware
router.post('/flow', rawBodyMiddleware, (req, res) => {
    wa.handleFlowRequest(req as IRequest & { rawBody: string }, res);
});

export default router;
