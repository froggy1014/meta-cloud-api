/**
 * @openapi
 * openapi: 3.0.0
 * info:
 *   title: Meta Cloud API - Two-Step Verification
 *   version: 1.0.0
 *   description: API documentation for WhatsApp two-step verification
 *
 * servers:
 *   - url: http://localhost:8080
 *
 * components:
 *   schemas:
 *     TwoStepVerificationRequest:
 *       type: object
 *       required:
 *         - pin
 *       properties:
 *         pin:
 *           type: string
 *           description: The PIN code for two-step verification
 */

import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import WhatsApp from 'meta-cloud-api';

dotenv.config();

const router = express.Router();

/**
 * @openapi
 * /two-step-verification/{businessNumberId}:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Set two-step verification PIN
 *     tags: [Two-Step Verification]
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
 *             $ref: '#/components/schemas/TwoStepVerificationRequest'
 *     responses:
 *       200:
 *         description: Successfully set two-step verification PIN
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
router.post('/:businessNumberId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { pin } = req.body;
        if (!pin || pin.length !== 6) {
            res.status(400).json({ error: 'PIN must be exactly 6 digits' });
            return;
        }

        const whatsapp = new WhatsApp();
        const response = await whatsapp.twoStepVerification.setTwoStepVerificationCode(pin);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

export { router };
