/**
 * @openapi
 * openapi: 3.0.0
 * info:
 *   title: Meta Cloud API - Media
 *   version: 1.0.0
 *   description: API documentation for WhatsApp media operations
 *
 * servers:
 *   - url: http://localhost:8080
 *
 * components:
 *   schemas:
 *     MediaResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         url:
 *           type: string
 *         mime_type:
 *           type: string
 *         sha256:
 *           type: string
 *         file_size:
 *           type: number
 *         messaging_product:
 *           type: string
 *           enum: [whatsapp]
 *
 *     MediasResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MediaResponse'
 *         paging:
 *           type: object
 *           properties:
 *             cursors:
 *               type: object
 *               properties:
 *                 before:
 *                   type: string
 *                 after:
 *                   type: string
 *
 *     UploadMediaResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
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
 * /media/{mediaId}:
 *   get:
 *     security:
 *       - AccessToken: []
 *     summary: Get media by ID
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the media
 *     responses:
 *       200:
 *         description: Successfully retrieved media
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:mediaId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const mediaId = req.params.mediaId;
        const whatsapp = new WhatsApp();
        const response = await whatsapp.media.getMediaById(mediaId);
        res.status(200).json(await response.json());
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /media:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Upload media
 *     tags: [Media]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               messaging_product:
 *                 type: string
 *                 enum: [whatsapp]
 *                 default: whatsapp
 *     responses:
 *       200:
 *         description: Successfully uploaded media
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadMediaResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        const whatsapp = new WhatsApp();
        const file = new File([req.file.buffer], req.file.originalname, { type: req.file.mimetype });
        const messagingProduct = req.body.messaging_product || 'whatsapp';

        const response = await whatsapp.media.uploadMedia(file, messagingProduct);
        res.status(200).json(await response.json());
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /media/{mediaId}:
 *   delete:
 *     security:
 *       - AccessToken: []
 *     summary: Delete media
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the media to delete
 *     responses:
 *       200:
 *         description: Successfully deleted media
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
router.delete('/:mediaId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const mediaId = req.params.mediaId;
        const whatsapp = new WhatsApp();
        const response = await whatsapp.media.deleteMedia(mediaId);
        res.status(200).json(await response.json());
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /media/download:
 *   get:
 *     security:
 *       - AccessToken: []
 *     summary: Download media
 *     tags: [Media]
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: The URL of the media to download
 *     responses:
 *       200:
 *         description: Successfully downloaded media
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/download', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const mediaUrl = req.query.url as string;
        if (!mediaUrl) {
            res.status(400).json({ error: 'Media URL is required' });
            return;
        }

        const whatsapp = new WhatsApp();
        const response = await whatsapp.media.downloadMedia(mediaUrl);
        const blob = await response.json();

        // Set appropriate headers for file download
        res.setHeader('Content-Type', blob.type);
        res.setHeader('Content-Disposition', 'attachment');

        // Send the blob data
        res.send(Buffer.from(await blob.arrayBuffer()));
    } catch (error) {
        next(error);
    }
});

export { router };
