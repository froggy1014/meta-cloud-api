/**
 * @openapi
 * openapi: 3.0.0
 * info:
 *   title: Meta Cloud API - Registration
 *   version: 1.0.0
 *   description: API documentation for WhatsApp phone number registration
 *
 * servers:
 *   - url: http://localhost:8080
 *
 * components:
 *   schemas:
 *     DataLocalizationRegionEnum:
 *       type: string
 *       enum: [INDIA, SINGAPORE, UNITED_STATES]
 */

import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import WhatsApp from 'meta-cloud-api';

dotenv.config();

const router = express.Router();

/**
 * @openapi
 * /registration/{businessNumberId}/register:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Register a phone number
 *     tags: [Registration]
 *     parameters:
 *       - in: path
 *         name: businessNumberId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the business phone number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pin
 *             properties:
 *               pin:
 *                 type: string
 *               data_localization_region:
 *                 $ref: '#/components/schemas/DataLocalizationRegionEnum'
 *     responses:
 *       200:
 *         description: Successfully registered phone number
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
 */
router.post('/:businessNumberId/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { pin, data_localization_region } = req.body;
        const whatsapp = new WhatsApp();
        const response = await whatsapp.registration.register(pin, data_localization_region);
        res.status(200).json(await response.json());
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /registration/{businessNumberId}/deregister:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Deregister a phone number
 *     tags: [Registration]
 *     parameters:
 *       - in: path
 *         name: businessNumberId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the business phone number
 *     responses:
 *       200:
 *         description: Successfully deregistered phone number
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
 */
router.post('/:businessNumberId/deregister', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const businessNumberId = req.params.businessNumberId;
        const whatsapp = new WhatsApp();
        const response = await whatsapp.registration.deregister();
        res.status(200).json(await response.json());
    } catch (error) {
        next(error);
    }
});

export { router };
