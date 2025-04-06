/**
 * @openapi
 * openapi: 3.0.0
 * info:
 *   title: Meta Cloud API - Encryption
 *   version: 1.0.0
 *   description: API documentation for WhatsApp business encryption
 *
 * servers:
 *   - url: http://localhost:8080
 *
 * components:
 *   schemas:
 *     EncryptionPublicKeyResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             business_public_key:
 *               type: string
 *             business_public_key_signature_status:
 *               type: string
 *               enum: [VALID, MISMATCH]
 */

import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import WhatsApp from 'meta-cloud-api';
import multer from 'multer';

dotenv.config();

const router = express.Router();
const upload = multer();

/**
 * @openapi
 * /encryption/{businessNumberId}/public-key:
 *   get:
 *     security:
 *       - AccessToken: []
 *     summary: Get encryption public key
 *     tags: [Encryption]
 *     parameters:
 *       - in: path
 *         name: businessNumberId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the business phone number
 *     responses:
 *       200:
 *         description: Successfully retrieved encryption public key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EncryptionPublicKeyResponse'
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
 *         description: Public key not found
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
router.get('/:businessNumberId/public-key', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const whatsapp = new WhatsApp();
        const response = await whatsapp.encryption.getEncryptionPublicKey();
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /encryption/{businessNumberId}/public-key:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Set encryption public key
 *     tags: [Encryption]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - business_public_key
 *             properties:
 *               business_public_key:
 *                 type: string
 *                 description: The business public key for encryption
 *     responses:
 *       200:
 *         description: Successfully set encryption public key
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
router.post('/:businessNumberId/public-key', upload.none(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { business_public_key } = req.body;
        if (!business_public_key) {
            res.status(400).json({ error: 'Business public key is required' });
            return;
        }

        const whatsapp = new WhatsApp();
        const response = await whatsapp.encryption.setEncryptionPublicKey(business_public_key);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

export { router };
