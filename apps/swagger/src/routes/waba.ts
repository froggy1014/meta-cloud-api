/**
 * @openapi
 * openapi: 3.0.0
 * info:
 *   title: Meta Cloud API - WABA Subscriptions
 *   version: 1.0.0
 *   description: API documentation for WhatsApp Business API subscriptions
 *
 * servers:
 *   - url: http://localhost:8080
 *
 * components:
 *   schemas:
 *     WabaSubscription:
 *       type: object
 *       properties:
 *         whatsapp_business_api_data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             link:
 *               type: string
 *             name:
 *               type: string
 *
 *     WabaSubscriptions:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WabaSubscription'
 */

import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import WhatsApp from 'meta-cloud-api';

dotenv.config();

const router = express.Router();

/**
 * @openapi
 * /waba/{businessAccountId}/subscriptions:
 *   get:
 *     security:
 *       - AccessToken: []
 *     summary: Get all WABA subscriptions
 *     tags: [WABA]
 *     parameters:
 *       - in: path
 *         name: businessAccountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the business account
 *     responses:
 *       200:
 *         description: Successfully retrieved WABA subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WabaSubscriptions'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:businessAccountId/subscriptions', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const whatsapp = new WhatsApp();
        const response = await whatsapp.waba.getAllWabaSubscriptions();
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /waba/{businessAccountId}/subscriptions:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Subscribe to WABA
 *     tags: [WABA]
 *     parameters:
 *       - in: path
 *         name: businessAccountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the business account
 *     responses:
 *       200:
 *         description: Successfully subscribed to WABA
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:businessAccountId/subscriptions', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const whatsapp = new WhatsApp();
        const response = await whatsapp.waba.subscribeToWaba();
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /waba/{businessAccountId}/subscriptions:
 *   delete:
 *     security:
 *       - AccessToken: []
 *     summary: Unsubscribe from WABA
 *     tags: [WABA]
 *     parameters:
 *       - in: path
 *         name: businessAccountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the business account
 *     responses:
 *       200:
 *         description: Successfully unsubscribed from WABA
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:businessAccountId/subscriptions', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const whatsapp = new WhatsApp();
        const response = await whatsapp.waba.unsubscribeFromWaba();
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /waba/{businessAccountId}/webhooks:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Override WABA webhook
 *     tags: [WABA]
 *     parameters:
 *       - in: path
 *         name: businessAccountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the business account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - override_callback_uri
 *               - verify_token
 *             properties:
 *               override_callback_uri:
 *                 type: string
 *                 description: The webhook URL
 *               verify_token:
 *                 type: string
 *                 description: The verification token for the webhook
 *     responses:
 *       200:
 *         description: Successfully overrode WABA webhook
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:businessAccountId/webhooks', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { url, verify_token } = req.body;
        if (!url || !verify_token) {
            res.status(400).json({ error: 'Webhook URL and verify token are required' });
            return;
        }

        const whatsapp = new WhatsApp();
        const response = await whatsapp.waba.overrideWabaWebhook(url, verify_token);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

export { router };
