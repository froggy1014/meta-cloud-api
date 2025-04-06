/**
 * @openapi
 * openapi: 3.0.0
 * info:
 *   title: Meta Cloud API - QR Codes
 *   version: 1.0.0
 *   description: API documentation for WhatsApp QR codes
 *
 * servers:
 *   - url: http://localhost:8080
 *
 * components:
 *   schemas:
 *     QrCodeResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *         prefilled_message:
 *           type: string
 *         deep_link_url:
 *           type: string
 *         qr_image_url:
 *           type: string
 *
 *     QrCodesResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QrCodeResponse'
 */

import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import WhatsApp from 'meta-cloud-api';

dotenv.config();

const router = express.Router();

/**
 * @openapi
 * /qr-codes:
 *   get:
 *     security:
 *       - AccessToken: []
 *     summary: Get all QR codes
 *     tags: [QR Codes]
 *     responses:
 *       200:
 *         description: Successfully retrieved QR codes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QrCodesResponse'
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
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const whatsapp = new WhatsApp();
        const response = await whatsapp.qrCode.getQrCodes();
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /qr-codes/{qrCodeId}:
 *   get:
 *     security:
 *       - AccessToken: []
 *     summary: Get a specific QR code by ID
 *     tags: [QR Codes]
 *     parameters:
 *       - in: path
 *         name: qrCodeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the QR code
 *     responses:
 *       200:
 *         description: Successfully retrieved QR code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QrCodesResponse'
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
 *       404:
 *         description: QR code not found
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
router.get('/:qrCodeId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { qrCodeId } = req.params;
        const whatsapp = new WhatsApp();
        const response = await whatsapp.qrCode.getQrCode(qrCodeId);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /qr-codes:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Create a new QR code
 *     tags: [QR Codes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prefilled_message:
 *                 type: string
 *                 description: Message to be pre-filled when the QR code is scanned
 *     responses:
 *       201:
 *         description: Successfully created QR code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QrCodesResponse'
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
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { prefilled_message } = req.body;

        const whatsapp = new WhatsApp();
        const response = await whatsapp.qrCode.createQrCode({ prefilled_message });
        const data = await response.json();
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /qr-codes/{qrCodeId}:
 *   put:
 *     security:
 *       - AccessToken: []
 *     summary: Update a QR code
 *     tags: [QR Codes]
 *     parameters:
 *       - in: path
 *         name: qrCodeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the QR code to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prefilled_message:
 *                 type: string
 *                 description: New message to be pre-filled when the QR code is scanned
 *     responses:
 *       200:
 *         description: Successfully updated QR code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QrCodeResponse'
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
 *       404:
 *         description: QR code not found
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
router.put('/:qrCodeId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { qrCodeId } = req.params;
        const { prefilled_message } = req.body;

        const whatsapp = new WhatsApp();
        const response = await whatsapp.qrCode.updateQrCode({
            code: qrCodeId,
            prefilled_message,
        });
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /qr-codes/{qrCodeId}:
 *   delete:
 *     security:
 *       - AccessToken: []
 *     summary: Delete a QR code
 *     tags: [QR Codes]
 *     parameters:
 *       - in: path
 *         name: qrCodeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the QR code to delete
 *     responses:
 *       200:
 *         description: Successfully deleted QR code
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
 *       404:
 *         description: QR code not found
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
router.delete('/:qrCodeId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { qrCodeId } = req.params;

        const whatsapp = new WhatsApp();
        const response = await whatsapp.qrCode.deleteQrCode(qrCodeId);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

export { router };
